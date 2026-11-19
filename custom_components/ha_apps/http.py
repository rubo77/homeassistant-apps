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
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import CLI_CMD, REPOS_DIR

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
        base = Path(REPOS_DIR) / repo / slug
        icon = base / "icon.png"
        if not icon.exists():
            icon = base / "logo.png"
        if not icon.exists():
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
        base = Path(REPOS_DIR) / repo / slug
        for name in ("README.md", "DOCS.md", "readme.md"):
            doc = base / name
            if doc.exists():
                return web.json_response(
                    {"markdown": doc.read_text(errors="replace")})
        return web.json_response({"markdown": ""})


class HaAppsRawView(HomeAssistantView):
    """GET /api/ha_apps/raw/{repo}/{slug}/{path} — files from the repo cache."""

    url = "/api/ha_apps/raw/{repo}/{slug}/{path}"
    name = "api:ha_apps:raw"
    requires_auth = False  # public repo content for README images

    async def get(
        self, request: web.Request, repo: str, slug: str, path: str
    ) -> web.Response:
        base = (Path(REPOS_DIR) / repo / slug).resolve()
        target = (base / path).resolve()
        if not str(target).startswith(str(base) + "/"):
            return web.Response(status=HTTPStatus.BAD_REQUEST)
        if not target.is_file():
            return web.Response(status=HTTPStatus.NOT_FOUND)
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
