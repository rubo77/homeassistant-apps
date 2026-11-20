#!/usr/bin/env python3
# ha-apps — Supervisor-free add-on store backend for Home Assistant Core on
# Debian/Ubuntu/Raspbian. Clones the official + community add-on repos,
# parses each add-on's config.yaml and installs/removes them as plain
# Docker containers (name prefix "ha_apps_"). Designed to be driven both
# interactively and by the ha_apps Home Assistant custom component
# (--json output). Needs root (docker socket, /var/lib/ha_apps).
# Usage: see dev/ha-apps (bash wrapper) or `ha-apps --help`.

import argparse
import glob
import json
import os
import platform
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.stderr.write(
        "ha-apps: PyYAML is missing — install python3-yaml or point the\n"
        "wrapper at the HA venv python (/opt/homeassistant/venv/bin/python).\n"
    )
    sys.exit(2)

BASE_DIR = Path(os.environ.get("HA_APPS_DIR", "/var/lib/ha_apps"))
REPOS_DIR = BASE_DIR / "repos"
INSTALLED_JSON = BASE_DIR / "installed.json"
HA_CONFIG_DIR = os.environ.get("HA_CONFIG_DIR", "/root/.homeassistant")

REPOS = {
    "official": "https://github.com/home-assistant/addons",
    "community": "https://github.com/hassio-addons/repository",
}

# extra catalog source: a local add-on repo dir (*/config.yaml) that is
# not git-managed — own/experimental add-ons live here
LOCAL_REPO_DIR = Path(
    os.environ.get("HA_APPS_LOCAL_REPO", str(BASE_DIR / "local"))
)

CONTAINER_PREFIX = "ha_apps_"


def _find_binary(name):
    """Resolve a binary; the HA systemd unit runs with a minimal PATH."""
    found = shutil.which(name)
    if found:
        return found
    for cand in (f"/usr/bin/{name}", f"/usr/local/bin/{name}",
                 f"/snap/bin/{name}", f"/bin/{name}"):
        if os.path.exists(cand):
            return cand
    sys.exit(f"ha-apps: {name} not found — install it first")


DOCKER = _find_binary("docker")
GIT = _find_binary("git")

NETWORK = "ha_apps_net"
STUB_CONTAINER = "ha_apps_supervisor-stub"
STUB_DATA = BASE_DIR / "stub"
STUB_IMAGE = "python:3-alpine"
STUB_SCRIPT = Path(__file__).parent / "supervisor_stub.py"


def ensure_network():
    """Create the shared docker network the stub and add-ons live on."""
    p = run(
        [DOCKER, "network", "inspect", NETWORK], capture=True, check=False
    )
    if p.returncode != 0:
        run([DOCKER, "network", "create", NETWORK])


def ensure_stub():
    """(Re)create the supervisor API stub container if it is missing
    or lacks the token mount."""
    STUB_DATA.mkdir(parents=True, exist_ok=True)
    # fill in the URL the stub uses to reach the real HA API — the LAN
    # egress IP works from bridge-network containers and tracks DHCP
    token_file = STUB_DATA / "token.json"
    if token_file.exists():
        try:
            data = json.loads(token_file.read_text())
            data["ha_url"] = f"http://{host_addr()}:8123"
            token_file.write_text(json.dumps(data))
        except (OSError, json.JSONDecodeError):
            pass
    p = run(
        [DOCKER, "inspect", "-f",
         "{{.State.Running}} {{.Mounts}}", STUB_CONTAINER],
        capture=True, check=False,
    )
    if (
        p.returncode == 0
        and p.stdout.strip().startswith("true")
        and "ha_apps_stub" in p.stdout
    ):
        return
    run([DOCKER, "rm", "-f", STUB_CONTAINER], capture=True, check=False)
    run([DOCKER, "pull", STUB_IMAGE])
    if not STUB_SCRIPT.exists():
        sys.exit(f"ha-apps: supervisor stub script missing: {STUB_SCRIPT}")
    run([
        DOCKER, "run", "-d",
        "--name", STUB_CONTAINER,
        "--network", NETWORK,
        # add-ons hardcode http://supervisor in their bashio boot scripts
        "--network-alias", "supervisor",
        "--restart", "unless-stopped",
        "--label", "ha_apps.managed=1",
        "-v", f"{STUB_SCRIPT}:/stub.py:ro",
        # per-caller option lookup: stub resolves client IP -> container
        # name -> slug -> /ha_apps_data/<slug>/options.json
        "-v", f"{BASE_DIR / 'data'}:/ha_apps_data:ro",
        # token + ha_url for proxying /core/api to the real HA
        "-v", f"{STUB_DATA}:/ha_apps_stub:ro",
        STUB_IMAGE, "python", "/stub.py",
    ])
ARCH_MAP = {
    "x86_64": "amd64",
    "aarch64": "aarch64",
    "armv7l": "armv7",
    "armv6l": "armhf",
    "armhf": "armhf",
    "i386": "i386",
    "i686": "i386",
}

# Supervisor map: entries -> (host dir builder, default container path).
# Both the legacy string keys ("config:rw") and the newer dict "type"
# names are normalized through this table.
VOLUME_MAP = {
    "config": lambda slug: (HA_CONFIG_DIR, "/config"),
    "homeassistant_config": lambda slug: (HA_CONFIG_DIR, "/config"),
    "share": lambda slug: (str(BASE_DIR / "share"), "/share"),
    "ssl": lambda slug: (str(BASE_DIR / "ssl"), "/ssl"),
    "addons": lambda slug: (str(BASE_DIR / "addons"), "/addons"),
    "local_apps": lambda slug: (str(BASE_DIR / "addons"), "/addons"),
    "all_app_configs": lambda slug: (str(BASE_DIR / "data"),
                                     "/addon_configs"),
    "media": lambda slug: (str(BASE_DIR / "media"), "/media"),
    "backup": lambda slug: (str(BASE_DIR / "backup"), "/backup"),
}
# map entries that are host device/service passthroughs, not plain dirs
HOST_PASSTHROUGH = {
    "dev": "/dev",
    "udev": "/run/udev",
    "dbus": "/run/dbus",
}
# add-on config keys that signal a dependency on Supervisor APIs
SUPERVISOR_KEYS = (
    "hassio_api",
    "hassio_role",
    "auth_api",
    "homeassistant_api",
    "services",
    "discovery",
    "docker_api",
)


def host_arch():
    arch = ARCH_MAP.get(platform.machine().lower())
    if not arch:
        sys.exit(f"ha-apps: unsupported host architecture {platform.machine()!r}")
    return arch


def run(cmd, capture=False, check=True):
    if capture:
        p = subprocess.run(cmd, capture_output=True, text=True)
        if check and p.returncode != 0:
            raise RuntimeError(
                f"{cmd[0]} failed (rc={p.returncode}): {p.stderr.strip()[:400]}"
            )
        return p
    p = subprocess.run(cmd)
    if check and p.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed (rc={p.returncode})")
    return p


def load_installed():
    if INSTALLED_JSON.exists():
        return json.loads(INSTALLED_JSON.read_text())
    return {}


def save_installed(data):
    INSTALLED_JSON.parent.mkdir(parents=True, exist_ok=True)
    tmp = INSTALLED_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, indent=2, sort_keys=True))
    tmp.replace(INSTALLED_JSON)


def docker_states():
    """container name -> (running, image) for every ha_apps_* container."""
    p = run(
        [
            DOCKER, "ps", "-a",
            "--filter", f"name={CONTAINER_PREFIX}",
            "--format", "{{.Names}}\t{{.Status}}\t{{.Image}}",
        ],
        capture=True,
    )
    states = {}
    for line in p.stdout.splitlines():
        name, status, image = line.split("\t", 2)
        states[name] = ("Up" in status, image)
    return states


def _catalog_entries():
    """Yield (slug, repo_name, cfg, addon_dir) for every repo config."""
    repo_dirs = {name: REPOS_DIR / name for name in REPOS}
    repo_dirs["local"] = LOCAL_REPO_DIR
    for repo_name, repo_dir in repo_dirs.items():
        if not repo_dir.is_dir():
            continue
        for cfg_path in sorted(repo_dir.glob("*/config.y*ml")) + sorted(
            repo_dir.glob("*/config.json")
        ):
            try:
                cfg = yaml.safe_load(cfg_path.read_text()) or {}
            except Exception as err:
                sys.stderr.write(
                    f"ha-apps: skipping {cfg_path}: parse error {err}\n"
                )
                continue
            if not isinstance(cfg, dict) or "name" not in cfg:
                continue
            slug = cfg.get("slug") or cfg_path.parent.name
            yield slug, repo_name, cfg, cfg_path.parent


def installed_service_names():
    """Service names with at least one installed provider add-on
    (services: ["mqtt:provide"] declares the provider side)."""
    provided = {}
    for slug, _repo, cfg, _dir in _catalog_entries():
        for svc in cfg.get("services") or []:
            name, _, mode = str(svc).partition(":")
            if mode == "provide":
                provided.setdefault(name, set()).add(slug)
    installed = set(load_installed())
    return {
        name for name, slugs in provided.items() if slugs & installed
    }


def scan_catalog():
    """Parse every */config.{yaml,json} in the cached repos into a dict."""
    addons = {}
    arch = host_arch()
    have_services = installed_service_names()
    for slug, repo_name, cfg, addon_dir in _catalog_entries():
        addons[slug] = normalize(
            slug, repo_name, cfg, addon_dir, arch, have_services
        )
    return addons


# add-ons whose binaries need specific CPU instructions — verified on
# nebelhaufen (Core 2 Duo U7700, no SSE4.2/AVX): onnxruntime-based
# add-ons die with SIGILL
CPU_REQUIRES = {
    "piper": "avx",
    "whisper": "avx",
}


def cpu_has_flag(flag):
    try:
        flags = Path("/proc/cpuinfo").read_text()
    except OSError:
        return False
    return any(
        flag in line.split() for line in flags.splitlines() if "flags" in line
    )


# add-ons with a dedicated installer: extra ports to publish plus the
# HA-side integration that ha_apps wires up automatically after the
# container is up (wyoming config flow with host/port)
SPECIAL_INSTALLERS = {
    "piper": {
        "publish": ["127.0.0.1:10200:10200"],
        "wait_port": 10200,
        "ha_integration": {
            "domain": "wyoming",
            "data": {"host": "127.0.0.1", "port": 10200},
        },
        "auto": [
            "Publishes port 10200 on localhost and creates the Wyoming "
            "integration in Home Assistant automatically",
        ],
    },
}

# extra payload some add-ons download at runtime (models, voices)
SIZE_NOTES = {
    "piper": "plus ~20–60 MB per voice (downloaded on first TTS call)",
    "whisper": (
        "plus model on first start: ~40 MB (tiny-int8) up to "
        "~3 GB (large-v3), depending on the \"model\" option"
    ),
}

# concrete follow-up steps for add-ons that need manual wiring after
# install because Supervisor features (discovery, HA API) are absent
POST_INSTALL_NOTES = {
    "piper": [
        "Select Piper as TTS in Settings → Voice assistants",
        "Voices are downloaded on first TTS call "
        "(~20–60 MB per voice into the add-on data directory)",
    ],
    "whisper": [
        "In HA: Settings → Devices & services → + Add integration → \"Wyoming Protocol\"",
        "Host: <this machine's IP>, port: 10300 (the add-on listens on the mapped port)",
        "The speech model is fetched from the HuggingFace Hub on first "
        "start — ~40 MB (tiny-int8) up to ~3 GB (large-v3) depending on "
        "the \"model\" option, stored in the add-on data directory",
        "Then select Whisper as STT in Settings → Voice assistants",
    ],
    "tidal": [
        "Log in to Tidal once: browse Tidal in the Iris UI (port 6680), "
        "watch 'ha-apps logs tidal' for the login.tidal.com URL, open it "
        "in a browser on this host (port 8989 must reach the container — "
        "from a remote browser use 'ssh -L 8989:localhost:8989 <host>' "
        "first) and authorize. The session is kept in the add-on data "
        "directory",
        "Audio plays through this host's sound card (/dev/snd) — pick "
        "the ALSA device via the 'audio_device' option if 'default' "
        "is not the right one",
        "The Iris web UI on port 6680 controls playback; Tidal "
        "requires a paid subscription",
    ],
    "esphome": [
        "In HA: Settings → Devices & services → + Add integration → \"ESPHome\" — enter the add-on dashboard address and port",
        "Devices must be added via DHCP or manual discovery; automatic add-on discovery is absent",
    ],
}


def post_install_notes(slug, cfg, needs_sup):
    """User-facing checklist of manual steps needed after install."""
    notes = list(POST_INSTALL_NOTES.get(slug, []))
    if "discovery" in needs_sup and slug not in POST_INSTALL_NOTES and slug not in SPECIAL_INSTALLERS:
        notes.append(
            {
                "key": "pi_discovery",
                "text": "This add-on normally announces itself to HA via "
                "Supervisor discovery — that is absent. Add the matching "
                "integration manually (Settings → Devices & services → "
                "+ Add integration), using this machine's IP and the "
                "mapped port.",
            }
        )
    if cfg.get("ingress"):
        notes.append(
            {
                "key": "pi_no_ingress",
                "text": "The web UI does not run embedded (no ingress) — "
                "open it directly on the mapped port in your browser.",
            }
        )
    return notes


def normalize(slug, repo_name, cfg, addon_dir, arch, have_services=None):
    """Reduce a Supervisor config.yaml to what the store/installer needs."""
    supported = True
    reason = None
    archs = cfg.get("arch")
    if archs and arch not in archs:
        supported, reason = False, f"no {arch} build"
    cpu_flag = CPU_REQUIRES.get(slug)
    if cpu_flag and not cpu_has_flag(cpu_flag):
        supported, reason = False, f"cpu lacks {cpu_flag}"
    image = cfg.get("image")
    version = str(cfg.get("version", ""))
    if supported:
        hw = missing_hardware(cfg)
        if hw:
            supported, reason = False, "missing " + " + ".join(hw)
    if supported:
        machines = cfg.get("machine") or []
        allowed = [m for m in machines if not str(m).startswith("!")]
        denied = [str(m)[1:] for m in machines if str(m).startswith("!")]
        mid = machine_id()
        if allowed and mid not in allowed:
            supported, reason = False, f"needs machine {allowed}"
        elif mid in denied:
            supported, reason = False, f"excluded on {mid}"
    if supported:
        # device lists enumerate options (plex: /dev/dri, card0, card1) —
        # only block when none of the declared sources exists
        devs = [str(d).split(":")[0] for d in cfg.get("devices") or []]
        devs = [d for d in devs if d]
        if devs and not any(os.path.exists(d) for d in devs):
            supported, reason = False, f"missing device {devs[0]}"
    if supported and cfg.get("homeassistant"):
        req = _ver_tuple(cfg["homeassistant"])
        have = _ver_tuple(os.environ.get("HA_VERSION", ""))
        if req and have and have < req:
            supported, reason = False, f"needs HA >= {cfg['homeassistant']}"
    if supported and have_services is not None:
        # svc:need hard-requires a provider add-on to be installed
        for svc in cfg.get("services") or []:
            name, _, mode = str(svc).partition(":")
            if mode == "need" and name not in have_services:
                supported, reason = False, f"requires service {name}"
                break
    build_dir = None
    if cfg.get("build") or (addon_dir / "Dockerfile").exists():
        # built locally from the repo's Dockerfile, not pulled
        build_dir = str(addon_dir)
        image_resolved = image or f"ha-apps-local/{slug}"
        if ":" not in image_resolved.rsplit("/", 1)[-1] and version:
            image_resolved += f":{version}"
    elif not image:
        if supported:
            supported, reason = False, "no prebuilt image"
        image_resolved = None
    else:
        image_resolved = image.replace("{arch}", arch)
        # Supervisor tags the pull with the add-on version when the image
        # template itself carries no tag
        if ":" not in image_resolved.rsplit("/", 1)[-1] and version:
            image_resolved += f":{version}"
    webui_port = None
    ports = cfg.get("ports") or {}
    webui = cfg.get("webui")
    if cfg.get("ingress_port"):
        webui_port = int(cfg["ingress_port"])
    elif webui and "[PORT:" in webui:
        container_port = webui.split("[PORT:")[1].split("]")[0]
        host_port = ports.get(f"{container_port}/tcp") or ports.get(
            f"{container_port}/udp"
        )
        if host_port:
            webui_port = int(host_port)
        else:
            webui_port = int(container_port) if container_port.isdigit() else None
    needs_sup = [k for k in SUPERVISOR_KEYS if cfg.get(k)]
    icon = None
    for cand in ("icon.png", "logo.png"):
        if (addon_dir / cand).exists():
            icon = f"/api/ha_apps/icon/{repo_name}/{slug}"
            break
    return {
        "slug": slug,
        "repo": repo_name,
        "name": cfg.get("name", slug),
        "version": version,
        "description": cfg.get("description", ""),
        "url": cfg.get("url", ""),
        "image": image_resolved,
        "build_dir": build_dir,
        "supported": supported,
        "unsupported_reason": reason,
        "needs_supervisor": needs_sup,
        "icon": icon,
        "webui": webui or ("ingress" if cfg.get("ingress") else None),
        "webui_port": webui_port,
        "ingress_port": cfg.get("ingress_port"),
        "ports": ports,
        "ports_description": cfg.get("ports_description") or {},
        "host_network": bool(cfg.get("host_network")),
        "installed": False,
        "state": None,
        "post_install": post_install_notes(slug, cfg, needs_sup),
        "special": SPECIAL_INSTALLERS.get(slug),
        "size_note": SIZE_NOTES.get(slug),
        "raw": cfg,
    }


def container_name(slug):
    return f"{CONTAINER_PREFIX}{slug}"


def build_run_args(addon, slug, extra_ports=()):
    """Translate the normalized add-on spec into docker run arguments."""
    cfg = addon["raw"]
    args = [
        DOCKER, "run", "-d",
        "--name", container_name(slug),
        "--restart", "unless-stopped",
        "--label", "ha_apps.managed=1",
        "--label", f"ha_apps.slug={slug}",
        "--label", f"ha_apps.repo={addon['repo']}",
        "-e", f"TZ={os.environ.get('TZ', 'Europe/Berlin')}",
        # the stub accepts any token; it only has to be non-empty for bashio
        "-e", "SUPERVISOR_TOKEN=ha_apps_stub",
        "-e", "HASSIO_TOKEN=ha_apps_stub",
    ]
    if addon["host_network"]:
        args += ["--network", "host"]
    else:
        args += ["--network", NETWORK]
        published = {}
        for container_port, host_port in addon["ports"].items():
            if host_port is None:
                continue  # port disabled by default in the add-on config
            cport = container_port.split("/")[0]
            proto = container_port.split("/")[1] if "/" in container_port else "tcp"
            args += ["-p", f"{host_port}:{cport}/{proto}"]
            published[cport] = int(host_port)
        webui_port = addon.get("webui_port")
        ingress_port = addon.get("ingress_port")
        if ingress_port and str(ingress_port) not in published:
            args += ["-p", f"{ingress_port}:{ingress_port}/tcp"]
            published[str(ingress_port)] = int(ingress_port)
        elif webui_port and str(webui_port) not in published:
            args += ["-p", f"{webui_port}:{webui_port}/tcp"]
            published[str(webui_port)] = int(webui_port)
        for pub in extra_ports:
            # either host:container or bind_ip:host:container
            parts = pub.split(":")
            if len(parts) == 3:
                bind_ip, host_p, container_p = parts
            else:
                bind_ip = None
                host_p, _, container_p = pub.partition(":")
            if "/" not in container_p:
                container_p += "/tcp"
            spec = f"{host_p}:{container_p}"
            if bind_ip:
                spec = f"{bind_ip}:{spec}"
            args += ["-p", spec]
            published[container_p.split("/")[0]] = int(host_p)
    data_dir = BASE_DIR / "data" / slug
    data_dir.mkdir(parents=True, exist_ok=True)
    args += ["-v", f"{data_dir}:/data"]
    for entry in cfg.get("map") or []:
        if isinstance(entry, dict):
            # newer format: {"type": "share", "read_only": true, "path": ...}
            key = entry.get("type", "")
            mode = "ro" if entry.get("read_only") else "rw"
            path_override = entry.get("path")
        else:
            key, _, mode = entry.partition(":")
            mode = mode or "rw"
            path_override = None
        if key in VOLUME_MAP:
            host_path, container_path = VOLUME_MAP[key](slug)
            container_path = path_override or container_path
            Path(host_path).mkdir(parents=True, exist_ok=True)
            args += ["-v", f"{host_path}:{container_path}:{mode}"]
        elif key in HOST_PASSTHROUGH:
            args += ["-v", f"{HOST_PASSTHROUGH[key]}:{HOST_PASSTHROUGH[key]}:{mode}"]
    for dev in cfg.get("devices") or []:
        args += ["--device", dev]
    # capability grants the Supervisor would wire up — mapped only when
    # the host actually has the backing socket/device so the container
    # never sees a dangling bind-mount dir
    for key, path in {
        "docker_api": "/var/run/docker.sock",
        "host_dbus": "/run/dbus",
        "udev": "/run/udev",
        "bluetooth": "/run/dbus",
    }.items():
        if cfg.get(key) and os.path.exists(path):
            args += ["-v", f"{path}:{path}"]
    if cfg.get("host_pid"):
        args += ["--pid", "host"]
    if cfg.get("host_uts"):
        args += ["--uts", "host"]
    if cfg.get("host_ipc"):
        args += ["--ipc", "host"]
    if cfg.get("privileged") or cfg.get("full_access"):
        args += ["--privileged"]
    if cfg.get("kernel_modules"):
        args += ["--cap-add", "SYS_MODULE"]
    if cfg.get("usb") and os.path.isdir("/dev/bus/usb"):
        args += ["-v", "/dev/bus/usb:/dev/bus/usb"]
    if cfg.get("uart") and os.path.isdir("/dev/serial"):
        args += ["-v", "/dev/serial:/dev/serial"]
    if cfg.get("devicetree") and os.path.isdir("/proc/device-tree"):
        args += ["-v", "/proc/device-tree:/proc/device-tree:ro"]
    if cfg.get("gpio"):
        for chip in sorted(glob.glob("/dev/gpiochip*")):
            args += ["--device", chip]
    if cfg.get("video"):
        for dri in sorted(
            glob.glob("/dev/dri/card*") + glob.glob("/dev/dri/renderD*")
        ):
            args += ["--device", dri]
    if cfg.get("audio") and os.path.isdir("/dev/snd"):
        args += ["--device", "/dev/snd"]
    if any(str(d).startswith("/dev/net/") for d in cfg.get("devices") or []):
        args += ["--cap-add", "NET_ADMIN"]
    for key, value in (cfg.get("environment") or {}).items():
        args += ["-e", f"{key}={value}"]
    options = cfg.get("options")
    if options is not None:
        options_file = data_dir / "options.json"
        if not options_file.exists():
            options_file.write_text(json.dumps(options))
    # the stub merges this into /addons/self/info (ingress_port, version)
    (data_dir / "addon_meta.json").write_text(json.dumps({
        "slug": slug,
        "name": addon["name"],
        "version": addon["version"],
        "ingress_port": addon.get("ingress_port"),
        "webui_port": addon.get("webui_port"),
    }))
    args.append(addon["image"])
    return args


def cmd_update_catalog(_args):
    REPOS_DIR.mkdir(parents=True, exist_ok=True)
    for name, url in REPOS.items():
        dest = REPOS_DIR / name
        if (dest / ".git").is_dir():
            print(f"[ha-apps] updating {name} ...")
            run([GIT, "-C", str(dest), "pull", "--ff-only"])
        else:
            print(f"[ha-apps] cloning {name} -> {dest} ...")
            run([GIT, "clone", "--depth", "1", url, str(dest)])
    print("[ha-apps] catalog updated")
    prefetch_sizes()


def prefetch_sizes(workers=8):
    """Warm the download-size cache so the overview shows sizes instantly."""
    from concurrent.futures import ThreadPoolExecutor
    images = {
        a["image"]
        for a in scan_catalog().values()
        if a.get("image")
        and not a.get("build_dir")
        and _size_cache(a["image"]) == "miss"
    }
    if not images:
        return
    print(f"[ha-apps] prefetching download sizes for {len(images)} images ...")
    def _probe(image):
        size = _image_download_size(image)
        if size is not None:
            _size_cache_write(image, size)
    with ThreadPoolExecutor(max_workers=workers) as pool:
        list(pool.map(_probe, images))
    print("[ha-apps] size prefetch done")


def docker_image_sizes():
    """image ref -> human size string for every local image."""
    p = run(
        [DOCKER, "images", "--format", "{{.Repository}}:{{.Tag}}\t{{.Size}}"],
        capture=True, check=False,
    )
    if p.returncode != 0:
        return {}
    sizes = {}
    for line in p.stdout.splitlines():
        ref, _, size = line.partition("\t")
        sizes[ref] = size
    return sizes


SIZE_CACHE_TTL = 6 * 3600  # download size for an image:tag never changes


def _size_cache(image):
    f = BASE_DIR / "cache" / "sizes.json"
    try:
        cache = json.loads(f.read_text())
    except (OSError, json.JSONDecodeError):
        cache = {}
    entry = cache.get(image)
    if entry and time.time() - entry.get("ts", 0) < SIZE_CACHE_TTL:
        return entry.get("size_mb", 0) or None
    return "miss"


def _size_cache_write(image, size_mb):
    f = BASE_DIR / "cache" / "sizes.json"
    f.parent.mkdir(parents=True, exist_ok=True)
    try:
        cache = json.loads(f.read_text())
    except (OSError, json.JSONDecodeError):
        cache = {}
    cache[image] = {"size_mb": size_mb, "ts": int(time.time())}
    f.write_text(json.dumps(cache))


def image_download_size(image):
    """Compressed download size in MB via the registry manifest (cached)."""
    cached = _size_cache(image)
    if cached != "miss":
        return cached
    size = _image_download_size(image)
    if size is not None:
        _size_cache_write(image, size)
    return size


def _image_download_size(image):
    p = run([DOCKER, "manifest", "inspect", image], capture=True, check=False)
    if p.returncode != 0:
        return None
    try:
        doc = json.loads(p.stdout)
    except json.JSONDecodeError:
        return None
    manifests = doc.get("manifests") or []
    if manifests:
        digest = None
        for m in manifests:
            if (m.get("platform") or {}).get("architecture") == host_arch():
                digest = m.get("digest")
                break
        if not digest:
            return None
        p = run(
            [DOCKER, "manifest", "inspect", f"{image.split(':')[0]}@{digest}"],
            capture=True, check=False,
        )
        if p.returncode != 0:
            return None
        try:
            doc = json.loads(p.stdout)
        except json.JSONDecodeError:
            return None
    layers = doc.get("layers") or []
    total = sum(l.get("size", 0) for l in layers)
    return total // 1_000_000 if total else None


def enrich(addons):
    installed = load_installed()
    states = docker_states()
    sizes = docker_image_sizes()
    for slug, addon in addons.items():
        meta = installed.get(slug)
        cname = container_name(slug)
        running, image = states.get(cname, (False, None))
        addon["installed"] = cname in states
        addon["state"] = (
            "running" if running else ("stopped" if cname in states else None)
        )
        webui = addon.get("webui") or ""
        if "[HOST]" in webui:
            url = webui.replace("[HOST]", host_addr())
            for cport, hport in (addon.get("ports") or {}).items():
                cp = cport.split("/")[0]
                url = url.replace(f"[PORT:{cp}]", str(hport or cp))
            url = re.sub(r"\[PORT:(\d+)\]", r"\1", url)
            addon["webui_url"] = url
        if meta:
            addon["installed_version"] = meta.get("version")
            addon["webui_port"] = meta.get("webui_port")
            addon["extra_ports"] = meta.get("extra_ports", [])
            if meta.get("image") in sizes:
                addon["image_size"] = sizes[meta["image"]]
            update_avail = (
                addon["version"] and meta.get("version") != addon["version"]
            )
            addon["update_available"] = bool(update_avail)
        elif addon.get("image"):
            cached = _size_cache(addon["image"])
            if cached != "miss" and cached:
                addon["download_size_mb"] = cached
    return addons


def cmd_list(args):
    addons = enrich(scan_catalog())
    out = {s: {k: v for k, v in a.items() if k != "raw"} for s, a in addons.items()}
    if args.json:
        print(json.dumps(sorted(out.values(), key=lambda a: a["name"].lower())))
    else:
        for a in out.values():
            flags = []
            if a["installed"]:
                flags.append(a["state"])
            if a["needs_supervisor"]:
                flags.append("needs-supervisor")
            if not a["supported"]:
                flags.append(f"unsupported:{a['unsupported_reason']}")
            print(
                f"{a['slug']:35} {a['version']:10} {a['repo']:10} "
                f"{','.join(flags) or '-':25} {a['name']}"
            )


def find_addon(slug):
    """Normalize one add-on without scanning the whole catalog."""
    arch = host_arch()
    search_dirs = {name: REPOS_DIR / name for name in REPOS}
    search_dirs["local"] = LOCAL_REPO_DIR
    for repo_name, repo_dir in search_dirs.items():
        addon_dir = repo_dir / slug
        for cfg_path in (
            addon_dir / "config.yaml",
            addon_dir / "config.yml",
            addon_dir / "config.json",
        ):
            if cfg_path.exists():
                try:
                    cfg = yaml.safe_load(cfg_path.read_text()) or {}
                except Exception as err:
                    sys.exit(f"ha-apps: parse error in {cfg_path}: {err}")
                real_slug = cfg.get("slug") or slug
                return normalize(
                    real_slug, repo_name, cfg, addon_dir, arch,
                    installed_service_names(),
                )
    # slugs may differ from directory names — fall back to a full scan
    addon = scan_catalog().get(slug)
    if not addon:
        sys.exit(f"ha-apps: add-on {slug!r} not in catalog — run update-catalog")
    return addon


def cmd_info(args):
    addon = enrich({args.slug: find_addon(args.slug)})[args.slug]
    installed = load_installed().get(args.slug)
    if installed:
        addon["installed_meta"] = installed
    if addon.get("image"):
        size = image_download_size(addon["image"])
        if size:
            addon["download_size_mb"] = size
    out = {k: v for k, v in addon.items() if k != "raw"}
    out["options"] = addon["raw"].get("options")
    out["schema"] = addon["raw"].get("schema")
    print(json.dumps(out, indent=2) if args.json else json.dumps(out, indent=2))


# refuse installs when the disk is nearly full: images are ~0.2-1 GB
# each and a filled root fs kills HA itself
MIN_FREE_BYTES = 1_500_000_000


def disk_free_bytes():
    return shutil.disk_usage(BASE_DIR).free


def cmd_install(args):
    addon = find_addon(args.slug)
    if not addon["supported"]:
        sys.exit(f"ha-apps: {args.slug} not supported: {addon['unsupported_reason']}")
    free = disk_free_bytes()
    if free < MIN_FREE_BYTES:
        sys.exit(
            f"ha-apps: refusing install — only {free // 1_000_000} MB free "
            f"on {BASE_DIR} (minimum {MIN_FREE_BYTES // 1_000_000} MB)"
        )
    if addon["needs_supervisor"]:
        sys.stderr.write(
            f"ha-apps: WARNING {args.slug} uses Supervisor APIs "
            f"({', '.join(addon['needs_supervisor'])}) — may not fully work\n"
        )
    image = addon["image"]
    if addon.get("build_dir"):
        print(f"[ha-apps] building {image} from {addon['build_dir']} ...")
        run([DOCKER, "build", "--network", "host", "-t", image, addon["build_dir"]])
    else:
        print(f"[ha-apps] checking image manifest for {host_arch()} ...")
        inspect = run(
            [DOCKER, "manifest", "inspect", image], capture=True, check=False
        )
        if inspect.returncode != 0:
            sys.exit(
                f"ha-apps: image {image} has no manifest for this host — "
                f"the add-on is listed but likely cannot run here "
                f"({inspect.stderr.strip()[:200]})"
            )
        try:
            manifest = json.loads(inspect.stdout)
        except json.JSONDecodeError:
            manifest = {}
        manifests = manifest.get("manifests") or []
        if manifests:
            archs = {
                (m.get("platform") or {}).get("architecture")
                for m in manifests
            }
            if host_arch() not in archs:
                sys.exit(
                    f"ha-apps: {image} is not built for {host_arch()} "
                    f"(available: {', '.join(sorted(a for a in archs if a))})"
                )
        print(f"[ha-apps] pulling {image} ...")
        run([DOCKER, "pull", image])
    ensure_network()
    ensure_stub()
    if args.option:
        data_dir = BASE_DIR / "data" / args.slug
        data_dir.mkdir(parents=True, exist_ok=True)
        opt_file = data_dir / "options.json"
        if opt_file.exists():
            opts = json.loads(opt_file.read_text())
        else:
            opts = dict(addon["raw"].get("options") or {})
        for kv in args.option:
            key, _, value = kv.partition("=")
            if value.lower() in ("true", "false"):
                value = value.lower() == "true"
            elif value.lstrip("-").isdigit():
                value = int(value)
            opts[key] = value
        opt_file.write_text(json.dumps(opts))
    cname = container_name(args.slug)
    run([DOCKER, "rm", "-f", cname], check=False, capture=True)
    special = SPECIAL_INSTALLERS.get(args.slug) or {}
    extra_ports = list(args.publish or []) + list(special.get("publish") or [])
    run_args = build_run_args(addon, args.slug, extra_ports=extra_ports)
    run(run_args)
    wait_port = special.get("wait_port")
    if wait_port:
        _wait_tcp(wait_port)
    meta = load_installed()
    meta[args.slug] = {
        "slug": args.slug,
        "repo": addon["repo"],
        "name": addon["name"],
        "version": addon["version"],
        "image": image,
        "webui_port": addon.get("webui_port"),
        "webui": addon.get("webui"),
        "extra_ports": [
            int(p.split(":")[-2]) if p.count(":") == 2
            else int(p.partition(":")[0])
            for p in extra_ports
        ],
        "ha_integration": special.get("ha_integration"),
        "installed_at": int(time.time()),
    }
    save_installed(meta)
    print(f"[ha-apps] {args.slug} installed (container {cname})")


def machine_id():
    """Machine identifier for add-on `machine:` requirements. On plain
    Linux hosts there is no Supervisor machine concept — report a
    generic id matching the CPU arch."""
    import glob as _glob
    model = ""
    for f in _glob.glob("/proc/device-tree/model"):
        try:
            model = open(f).read().strip("\x00").lower()
            break
        except OSError:
            pass
    if "raspberry pi" in model:
        return "raspberrypi" + ("4" if "4" in model else "5" if "5" in model else "3") + "-64"
    return os.environ.get(
        "HA_APPS_MACHINE",
        {"x86_64": "generic-x86-64", "aarch64": "generic-aarch64"}.get(
            platform.machine(), "generic-" + platform.machine()
        ),
    )


def _has(pattern):
    import glob as _glob
    return bool(_glob.glob(pattern))


def missing_hardware(cfg):
    """Hardware the add-on needs that this host does not provide.
    uart/usb/udev alone are only capability grants (ssh, vscode set them
    without needing a device) — a missing serial adapter only blocks the
    addons that also declare udev/usb device plumbing."""
    missing = []
    if cfg.get("gpio") and not _has("/dev/gpiochip*"):
        missing.append("gpio")
    if cfg.get("devicetree") and not os.path.isdir("/proc/device-tree"):
        missing.append("devicetree")
    if cfg.get("video") and not (_has("/dev/dri/renderD*") or _has("/dev/dri/card*")):
        missing.append("video")
    if (
        cfg.get("uart")
        and (cfg.get("usb") or cfg.get("udev"))
        and not (_has("/dev/ttyUSB*") or _has("/dev/ttyACM*"))
    ):
        missing.append("serial adapter")
    if cfg.get("audio") and not _has("/dev/snd/*"):
        missing.append("audio")
    if cfg.get("bluetooth") and not _has("/sys/class/bluetooth/hci*"):
        missing.append("bluetooth")
    return missing


def _ver_tuple(v):
    m = re.match(r"(\d+)\.(\d+)(?:\.(\d+))?", str(v))
    return tuple(int(g or 0) for g in m.groups()) if m else None


def host_addr():
    """Egress LAN IP of this host — what a browser on the network can
    reach for published add-on ports."""
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sk:
            sk.connect(("8.8.8.8", 80))
            return sk.getsockname()[0]
    except OSError:
        return "127.0.0.1"


def _wait_tcp(port, host="127.0.0.1", timeout=60):
    """Block until a TCP connect succeeds — the container needs a moment."""
    import socket
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                print(f"[ha-apps] port {port} is accepting connections")
                return
        except OSError:
            time.sleep(2)
    print(f"[ha-apps] warning: port {port} not reachable after {timeout}s")


def cmd_remove(args):
    cname = container_name(args.slug)
    run([DOCKER, "rm", "-f", cname], capture=True)
    meta = load_installed()
    meta.pop(args.slug, None)
    save_installed(meta)
    if args.purge:
        import shutil
        shutil.rmtree(BASE_DIR / "data" / args.slug, ignore_errors=True)
    print(f"[ha-apps] {args.slug} removed" + (" (data purged)" if args.purge else ""))


def cmd_start_stop(args):
    run([DOCKER, args.command, container_name(args.slug)])
    print(f"[ha-apps] {args.slug} {args.command}ed")


def cmd_update(args):
    addon = find_addon(args.slug)
    image = addon["image"]
    if addon.get("build_dir"):
        print(f"[ha-apps] rebuilding {image} from {addon['build_dir']} ...")
        run([DOCKER, "build", "--network", "host", "-t", image, addon["build_dir"]])
    else:
        print(f"[ha-apps] pulling {image} ...")
        run([DOCKER, "pull", image])
    run([DOCKER, "rm", "-f", container_name(args.slug)], capture=True)
    run(build_run_args(addon, args.slug))
    meta = load_installed()
    if args.slug in meta:
        meta[args.slug]["version"] = addon["version"]
        meta[args.slug]["image"] = image
        save_installed(meta)
    print(f"[ha-apps] {args.slug} updated to {addon['version']}")


def cmd_logs(args):
    run([DOCKER, "logs", "--tail", str(args.tail), container_name(args.slug)])


def cmd_status(args):
    usage = shutil.disk_usage(BASE_DIR)
    addons = enrich(scan_catalog())
    installed = {s: a for s, a in addons.items() if a["installed"]}
    out = {
        "arch": host_arch(),
        "disk_free_mb": usage.free // 1_000_000,
        "disk_total_mb": usage.total // 1_000_000,
        "disk_dir": str(BASE_DIR),
        "host_addr": host_addr(),
        "min_free_mb": MIN_FREE_BYTES // 1_000_000,
        "catalog_size": len(addons),
        "installed": [s for s in installed],
        "running": [s for s, a in installed.items() if a["state"] == "running"],
    }
    if args.json:
        print(json.dumps(out))
    else:
        for k, v in out.items():
            print(f"{k}: {v}")


def cmd_doctor(_args):
    print(f"arch:        {host_arch()}")
    print(f"base dir:    {BASE_DIR}")
    out = run([DOCKER, "version", "--format", "{{.Server.Version}}"],
              capture=True, check=False)
    print(f"docker:      {out.stdout.strip() or 'NOT RUNNING'}")
    stub = run(
        [DOCKER, "inspect", "-f", "{{.State.Status}}", STUB_CONTAINER],
        capture=True, check=False,
    )
    print(f"stub:        {stub.stdout.strip() or 'not deployed'}")
    print(f"repos:       {[d.name for d in REPOS_DIR.iterdir() if d.is_dir()] if REPOS_DIR.is_dir() else 'catalog not fetched'}")
    print(f"installed:   {list(load_installed())}")


def main():
    parser = argparse.ArgumentParser(
        prog="ha-apps",
        description="Supervisor-free Home Assistant add-on store backend",
    )
    sub = parser.add_subparsers(dest="command", required=True)
    for name, helptext in (
        ("update-catalog", "clone/refresh the add-on repositories"),
        ("list", "list all catalog add-ons"),
        ("info", "show one add-on's normalized spec"),
        ("install", "pull + start an add-on container"),
        ("remove", "stop + delete an add-on container"),
        ("start", "start an installed add-on"),
        ("stop", "stop an installed add-on"),
        ("update", "pull latest image + recreate container"),
        ("logs", "show container logs"),
        ("status", "disk/catalog/install state summary"),
        ("doctor", "show environment diagnostics"),
    ):
        p = sub.add_parser(name, help=helptext)
        p.add_argument("slug", nargs="?", help="add-on slug")
        p.add_argument("--json", action="store_true", help="machine output")
        p.add_argument("--purge", action="store_true", help="also delete /data")
        p.add_argument("--tail", type=int, default=200)
        p.add_argument("--publish", action="append",
                       help="extra port mapping host:container[/proto]")
        p.add_argument("--option", action="append",
                       help="set add-on option key=value before start")
        p.add_argument("extra", nargs="*")
    args = parser.parse_args()
    handlers = {
        "update-catalog": cmd_update_catalog,
        "list": cmd_list,
        "info": cmd_info,
        "install": cmd_install,
        "remove": cmd_remove,
        "start": cmd_start_stop,
        "stop": cmd_start_stop,
        "update": cmd_update,
        "logs": cmd_logs,
        "status": cmd_status,
        "doctor": cmd_doctor,
    }
    handler = handlers[args.command]
    if args.command in ("info", "install", "remove", "start", "stop",
                        "update", "logs") and not args.slug:
        sys.exit(f"ha-apps: {args.command} needs a slug")
    handler(args)


if __name__ == "__main__":
    main()
