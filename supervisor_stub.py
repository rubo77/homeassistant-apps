#!/usr/bin/env python3
# Minimal Supervisor API stub for ha-apps: answers the HTTP endpoints
# add-on s6-overlay boot scripts (bashio) call on http://supervisor so
# they can start without a real Supervisor. Runs inside the
# ha_apps_supervisor-stub container on the ha_apps_net docker network,
# reachable as "supervisor".
#
# Per-caller add-on options are resolved by reverse-DNS of the client IP
# on the docker network (ha_apps_<slug>) -> /ha_apps_data/<slug>/
# options.json, which the installer seeds from the add-on's config.yaml
# defaults. Everything else returns generic, valid-looking data.
# Deployed by dev/deploy-ha-apps.sh to /usr/local/lib/ha-apps/.

import json
import socket
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

DATA_DIR = Path("/ha_apps_data")
TOKEN_FILE = Path("/ha_apps_stub/token.json")

INFO = {
    "supervisor": "stub",
    "homeassistant": "ha-apps",
    "hassos": None,
    "docker": "ha-apps",
    "hostname": "ha-apps",
    "operating_system": "Debian",
    "machine": "generic-x86-64",
    "arch": "amd64",
    "supported": True,
    "supported_arch": ["amd64", "aarch64", "armv7", "armhf", "i386"],
    "channel": "stable",
    "logging": "info",
    "timezone": "Europe/Berlin",
    "version": "stub",
    "version_latest": "stub",
    "features": [],
}


def _default_ha_url():
    # the docker bridge gateway is the host; HA binds 0.0.0.0:8123
    try:
        for line in Path("/proc/net/route").read_text().splitlines()[1:]:
            f = line.split()
            if f[1] == "00000000" and int(f[3], 16) & 1:
                gw = socket.inet_ntoa(bytes.fromhex(f[2])[::-1])
                return f"http://{gw}:8123"
    except (OSError, IndexError):
        pass
    return "http://172.17.0.1:8123"


def _ha_conn():
    """(token, base_url) for proxying core API calls, or (None, None)."""
    try:
        d = json.loads(TOKEN_FILE.read_text())
        return d["token"], d.get("ha_url") or _default_ha_url()
    except (OSError, json.JSONDecodeError, KeyError):
        return None, None


def caller_slug(ip):
    """Container name (ha_apps_<slug>) of the calling add-on, or None."""
    try:
        name = socket.gethostbyaddr(ip)[0]
    except (socket.herror, socket.gaierror, OSError):
        return None
    name = name.split(".")[0]
    return name.removeprefix("ha_apps_") or None


def caller_data(ip):
    """(slug, options, meta) of the calling add-on container."""
    slug = caller_slug(ip)
    options, meta = {}, {}
    if slug:
        for name, store in (("options.json", options := {}),
                            ("addon_meta.json", meta := {})):
            try:
                store.update(
                    json.loads((DATA_DIR / slug / name).read_text()))
            except (OSError, json.JSONDecodeError):
                pass
    return slug, options, meta


class Stub(BaseHTTPRequestHandler):
    def _reply(self, data=None, code=200):
        body = json.dumps(
            {"result": "ok", "data": data if data is not None else {}}
        ).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _route(self):
        path = self.path.split("?")[0].rstrip("/")
        ip = self.client_address[0]
        if path.endswith("/addons/self/info"):
            slug, options, meta = caller_data(ip)
            return {
                "name": meta.get("name") or slug or "ha-apps addon",
                "slug": slug or "unknown",
                "hostname": slug or "addon",
                "state": "started",
                "log_level": options.get("log_level", "info"),
                "options": options,
                "version": meta.get("version"),
                "version_latest": meta.get("version"),
                "ingress_port": meta.get("ingress_port"),
                "ingress": bool(meta.get("ingress_port")),
                "auto_update": False,
                "boot": "auto",
                "protected": True,
                "ip_address": ip,
                "network": {},
            }
        if path.endswith("/addons/self/options") or path.endswith(
            "/addons/self/options/config"
        ):
            return caller_data(ip)[1]
        if path.endswith("/addons/self/stats"):
            return {}
        if path in ("/info", "/core/info", "/supervisor/info", "/host/info",
                    "/os/info", "/resolution/info", "/network/info",
                    "/supervisor/ping"):
            return INFO
        return {}

    def _proxy(self):
        """Forward core-API calls to the real HA when a token exists.
        The Supervisor maps /core/api/* -> HA /api/*; add-ons with
        homeassistant_api call exactly that path. /auth goes through
        too (auth_api consumers)."""
        token, base = _ha_conn()
        if not token:
            return False
        path = self.path
        if path.startswith("/core/api"):
            path = "/api" + path[len("/core/api"):]
        elif not path.startswith(("/api", "/auth")):
            return False
        body = None
        if self.command in ("POST", "PUT", "PATCH", "DELETE"):
            body = self.rfile.read(
                int(self.headers.get("Content-Length") or 0))
        req = urllib.request.Request(
            base + path, data=body, method=self.command,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": self.headers.get("Content-Type")
                or "application/json",
            })
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                code = resp.status
                ctype = resp.headers.get("Content-Type", "application/json")
        except urllib.error.HTTPError as err:
            data, code, ctype = err.read(), err.code, "application/json"
        except OSError as err:
            self._reply({"error": f"ha api unreachable: {err}"}, 502)
            return True
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
        return True

    def do_GET(self):
        if not self._proxy():
            self._reply(self._route())

    def do_POST(self):
        if not self._proxy():
            self._reply(self._route())

    def do_PUT(self):
        if not self._proxy():
            self._reply({})

    def do_PATCH(self):
        if not self._proxy():
            self._reply({})

    def do_DELETE(self):
        if not self._proxy():
            self._reply({})

    def log_message(self, fmt, *args):
        print(f"[stub] {self.client_address[0]} {fmt % args}", flush=True)


HTTPServer(("0.0.0.0", 80), Stub).serve_forever()
