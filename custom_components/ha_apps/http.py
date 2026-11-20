"""HTTP views bridging the store panel to the ha-apps CLI."""

from __future__ import annotations

import json
import logging
import os
import subprocess

from homeassistant.const import __version__
from http import HTTPStatus
from pathlib import Path

from aiohttp import web
from homeassistant import config_entries
from homeassistant.auth.models import TOKEN_TYPE_LONG_LIVED_ACCESS_TOKEN
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import CLI_CMD, LOCAL_REPO_DIR, REPOS_DIR


def _addon_dir(repo: str, slug: str) -> Path | None:
    """Repo-cached add-on directory; local add-ons live outside REPOS_DIR."""
    for base in (Path(REPOS_DIR) / repo / slug,
                 Path(LOCAL_REPO_DIR) / slug):
        if base.is_dir():
            return base
    return None


def _find_icon(base: Path) -> Path | None:
    for name in ("icon.png", "logo.png"):
        icon = base / name
        if icon.is_file():
            return icon
    return None


def _readme_markdown(base: Path) -> tuple[str, str] | None:
    for name in ("DOCS.md", "README.md", "readme.md"):
        doc = base / name
        if doc.is_file():
            return name, doc.read_text(errors="replace")
    return None


def _raw_target(base: Path, path: str) -> Path | str | None:
    """Resolved path inside base; 'bad' on traversal, None when missing."""
    base_r = base.resolve()
    target = (base_r / path).resolve()
    if not str(target).startswith(str(base_r) + "/"):
        return "bad"
    return target if target.is_file() else None

_LOGGER = logging.getLogger(__name__)

PANEL_JS = Path(__file__).parent / "panel" / "panel.js"
ACTION_TIMEOUT = 900
LIST_TIMEOUT = 60
# cold-cache registry manifest inspects can exceed LIST_TIMEOUT
INFO_TIMEOUT = 180


def _is_admin(request: web.Request) -> bool:
    user = request.get("hass_user")
    return user is not None and user.is_admin


def _forbidden():
    return web.json_response(
        {"error": "admin required"}, status=HTTPStatus.FORBIDDEN
    )


STUB_TOKEN_FILE = (
    Path(os.environ.get("HA_APPS_DIR", "/var/lib/ha_apps"))
    / "stub"
    / "token.json"
)


def _stub_token_exists() -> bool:
    try:
        json.loads(STUB_TOKEN_FILE.read_text())
    except (OSError, json.JSONDecodeError):
        return False
    return True


def _write_stub_token(token: str) -> None:
    STUB_TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    STUB_TOKEN_FILE.write_text(json.dumps({"token": token}))
    STUB_TOKEN_FILE.chmod(0o600)


async def _ensure_addon_token(request):
    """Long-lived HA access token the supervisor stub uses when it
    proxies /core/api calls from add-ons (homeassistant_api/auth_api).
    Minted once for the admin performing the install."""
    hass = request.app["hass"]
    if await hass.async_add_executor_job(_stub_token_exists):
        return
    user = request.get("hass_user")
    if user is None:
        return
    refresh = await hass.auth.async_create_refresh_token(
        user,
        client_name="ha-apps add-on token",
        token_type=TOKEN_TYPE_LONG_LIVED_ACCESS_TOKEN,
    )
    token = hass.auth.async_create_access_token(refresh)
    await hass.async_add_executor_job(_write_stub_token, token)
    _LOGGER.info(
        "[HA_APPS] minted HA API token for add-ons (user %s)", user.name
    )


async def _run_cli(hass: HomeAssistant, timeout: int, *cli_args: str):
    """Run the ha-apps CLI in the executor; returns (rc, stdout, stderr)."""

    def _exec():
        try:
            env = dict(os.environ, HA_VERSION=__version__)
            proc = subprocess.run(
                [*CLI_CMD, *cli_args],
                capture_output=True,
                text=True,
                timeout=timeout,
                env=env,
            )
        except subprocess.TimeoutExpired:
            return 124, "", f"ha-apps timed out after {timeout}s"
        except OSError as err:
            return 127, "", f"ha-apps failed to start: {err}"
        return proc.returncode, proc.stdout, proc.stderr

    return await hass.async_add_executor_job(_exec)


async def _cli_json_response(hass, timeout, *cli_args):
    rc, out, err = await _run_cli(hass, timeout, *cli_args)
    if rc != 0:
        _LOGGER.warning("[HA_APPS] %s failed rc=%s: %s", cli_args, rc, err[:400])
        return web.json_response(
            {"error": err.strip() or out.strip() or f"rc={rc}"},
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )
    try:
        return web.json_response(json.loads(out))
    except json.JSONDecodeError:
        return web.json_response({"output": out})


class HaAppsListView(HomeAssistantView):
    """GET /api/ha_apps/addons — catalog with install state."""

    url = "/api/ha_apps/addons"
    name = "api:ha_apps:addons"

    async def get(self, request: web.Request) -> web.Response:
        if not _is_admin(request):
            return _forbidden()
        return await _cli_json_response(
            request.app["hass"], LIST_TIMEOUT, "list", "--json"
        )


class HaAppsInfoView(HomeAssistantView):
    """GET /api/ha_apps/addon/{slug} — normalized add-on details."""

    url = "/api/ha_apps/addon/{slug}"
    name = "api:ha_apps:addon"

    async def get(self, request: web.Request, slug: str) -> web.Response:
        if not _is_admin(request):
            return _forbidden()
        return await _cli_json_response(
            request.app["hass"], INFO_TIMEOUT, "info", slug
        )


class HaAppsActionView(HomeAssistantView):
    """POST /api/ha_apps/addon/{slug}/action — install/remove/start/stop/update."""

    url = "/api/ha_apps/addon/{slug}/action"
    name = "api:ha_apps:action"
    ACTIONS = {"install", "remove", "start", "stop", "update"}

    async def post(self, request: web.Request, slug: str) -> web.Response:
        if not _is_admin(request):
            return _forbidden()
        body = await request.json()
        action = body.get("action")
        if action not in self.ACTIONS:
            return web.json_response(
                {"error": f"unknown action {action!r}"},
                status=HTTPStatus.BAD_REQUEST,
            )
        cli_args = [action, slug]
        if action == "remove" and body.get("purge"):
            cli_args.append("--purge")
        if action in ("install", "update"):
            await _ensure_addon_token(request)
        rc, out, err = await _run_cli(
            request.app["hass"], ACTION_TIMEOUT, *cli_args
        )
        result = {"ok": rc == 0, "output": (out + err).strip()}
        if rc == 0 and action == "install":
            setup = await _auto_integrate(request.app["hass"], slug)
            if setup:
                result["ha_integration"] = setup
        return web.json_response(
            result,
            status=HTTPStatus.OK if rc == 0 else HTTPStatus.INTERNAL_SERVER_ERROR,
        )


async def _auto_integrate(hass: HomeAssistant, slug: str):
    """Create the HA config entry a special installer declared, if any."""
    rc, out, err = await _run_cli(hass, INFO_TIMEOUT, "info", slug)
    if rc != 0:
        _LOGGER.warning(
            "[HA_APPS] post-install info %s failed rc=%s: %s", slug, rc, err[:400]
        )
        return None
    info = json.loads(out)
    spec = (info.get("special") or {}).get("ha_integration")
    if not spec:
        return None
    try:
        flow = await hass.config_entries.flow.async_init(
            spec["domain"],
            context={"source": config_entries.SOURCE_USER},
            data=spec["data"],
        )
    except Exception as err:  # noqa: BLE001 — report integration failure
        _LOGGER.warning("[HA_APPS] auto-integrate %s failed: %s", slug, err)
        return {"domain": spec["domain"], "ok": False, "reason": str(err)}
    _LOGGER.info("[HA_APPS] auto-integrate %s -> %s", slug, flow.get("type"))
    return {
        "domain": spec["domain"],
        "ok": flow.get("type") == "create_entry",
        "reason": flow.get("reason") or flow.get("type"),
    }


class HaAppsLogsView(HomeAssistantView):
    """GET /api/ha_apps/addon/{slug}/logs — container logs as text."""

    url = "/api/ha_apps/addon/{slug}/logs"
    name = "api:ha_apps:logs"

    async def get(self, request: web.Request, slug: str) -> web.Response:
        if not _is_admin(request):
            return _forbidden()
        rc, out, err = await _run_cli(
            request.app["hass"], LIST_TIMEOUT, "logs", slug, "--tail", "300"
        )
        if rc != 0:
            return web.json_response(
                {"error": err.strip() or f"rc={rc}"},
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
            )
        return web.json_response({"logs": out + err})


class HaAppsStatusView(HomeAssistantView):
    """GET /api/ha_apps/status — disk space, catalog and install state."""

    url = "/api/ha_apps/status"
    name = "api:ha_apps:status"

    async def get(self, request: web.Request) -> web.Response:
        if not _is_admin(request):
            return _forbidden()
        return await _cli_json_response(
            request.app["hass"], LIST_TIMEOUT, "status", "--json"
        )


class HaAppsRefreshView(HomeAssistantView):
    """POST /api/ha_apps/catalog/refresh — git pull the add-on repos."""

    url = "/api/ha_apps/catalog/refresh"
    name = "api:ha_apps:refresh"

    async def post(self, request: web.Request) -> web.Response:
        if not _is_admin(request):
            return _forbidden()
        rc, out, err = await _run_cli(
            request.app["hass"], ACTION_TIMEOUT, "update-catalog"
        )
        return web.json_response(
            {"ok": rc == 0, "output": (out + err).strip()},
            status=HTTPStatus.OK if rc == 0 else HTTPStatus.INTERNAL_SERVER_ERROR,
        )


class HaAppsIconView(HomeAssistantView):
    """GET /api/ha_apps/icon/{repo}/{slug} — add-on icon from the repo cache."""

    url = "/api/ha_apps/icon/{repo}/{slug}"
    name = "api:ha_apps:icon"
    requires_auth = False  # public repo asset, loaded via <img> in the panel

    async def get(self, request: web.Request, repo: str, slug: str) -> web.Response:
        if "/" in slug or ".." in slug or "/" in repo or ".." in repo:
            return web.Response(status=HTTPStatus.BAD_REQUEST)
        hass = request.app["hass"]
        base = await hass.async_add_executor_job(_addon_dir, repo, slug)
        if base is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)
        icon = await hass.async_add_executor_job(_find_icon, base)
        if icon is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)
        return web.FileResponse(icon)


class HaAppsReadmeView(HomeAssistantView):
    """GET /api/ha_apps/readme/{repo}/{slug} — add-on README/DOCS markdown."""

    url = "/api/ha_apps/readme/{repo}/{slug}"
    name = "api:ha_apps:readme"
    requires_auth = False  # public repo asset like the icons

    async def get(self, request: web.Request, repo: str, slug: str) -> web.Response:
        if "/" in slug or ".." in slug or "/" in repo or ".." in repo:
            return web.Response(status=HTTPStatus.BAD_REQUEST)
        hass = request.app["hass"]
        base = await hass.async_add_executor_job(_addon_dir, repo, slug)
        if base is None:
            return web.json_response({"markdown": ""})
        found = await hass.async_add_executor_job(_readme_markdown, base)
        if found is None:
            return web.json_response({"markdown": ""})
        name, markdown = found
        return web.json_response({"markdown": markdown, "doc": name})


class HaAppsRawView(HomeAssistantView):
    """GET /api/ha_apps/raw/{repo}/{slug}/{path} — files from the repo cache."""

    url = "/api/ha_apps/raw/{repo}/{slug}/{path}"
    name = "api:ha_apps:raw"
    requires_auth = False  # public repo content for README images

    async def get(
        self, request: web.Request, repo: str, slug: str, path: str
    ) -> web.Response:
        hass = request.app["hass"]
        found = await hass.async_add_executor_job(_addon_dir, repo, slug)
        if found is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)
        target = await hass.async_add_executor_job(_raw_target, found, path)
        if target == "bad":
            return web.Response(status=HTTPStatus.BAD_REQUEST)
        if target is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)
        if target.suffix == ".md":
            markdown = await hass.async_add_executor_job(
                lambda: target.read_text(errors="replace")
            )
            return web.Response(
                text=markdown,
                content_type="text/plain",
            )
        return web.FileResponse(target)


class HaAppsPanelView(HomeAssistantView):
    """GET /api/ha_apps/panel.js — the custom panel web component."""

    url = "/api/ha_apps/panel.js"
    name = "api:ha_apps:panel"
    requires_auth = False  # static asset loaded by the HA frontend itself

    async def get(self, request: web.Request) -> web.Response:
        return web.FileResponse(
            PANEL_JS,
            headers={
                "Content-Type": "text/javascript",
                "Cache-Control": "no-cache",
            },
        )
