# homeassistant-apps

An **app store for Home Assistant Core** on Debian/Ubuntu/Raspbian.

**No Home Assistant OS required.** It browses the official
`home-assistant/addons` and `hassio-addons/repository` catalogs and
installs add-ons on your existing Home Assistant Core instance.

Made for HA Core installs (`hass` in a venv, systemd unit) where the
built-in "Apps" section is missing.

## What it looks like

- Sidebar panel "Apps" inside Home Assistant: catalog, search,
  per-app detail page with inline docs, ports, options and download
  size.
- Tag, install-status and installable-only filters; the filter state
  and active tags persist across panel reloads.
- Install/Update/Start/Stop/Remove/Logs — all from the panel.
  Remove offers to keep or purge the app's `/data`.
- Install dialog shows a compatibility check (Supervisor API usage,
  CPU/arch requirements, free disk) before anything is pulled.
- Apps that call Supervisor APIs get a small **Supervisor stub**
  container that answers the `bashio` endpoints they need to boot.
- Apps with a **special installer** (currently: Piper) get their
  matching HA integration created automatically after install
  (Piper → Wyoming `127.0.0.1:10200`).
- Panel follows the Home Assistant language setting — English and
  German included.

## Architecture

```
HA Core (venv)                host
└── ha_apps integration  ──►  /usr/local/bin/ha-apps (CLI, Python)
       sidebar panel          ├── clones add-on catalogs → /var/lib/ha_apps/repos
       HTTP API /api/ha_apps  ├── docker run "ha_apps_<slug>" on ha_apps_net
                              ├── per-app data → /var/lib/ha_apps/data/<slug>
                              └── ha_apps_supervisor-stub container
                                  (minimal bashio API answers)
```

The integration runs the CLI as a subprocess; the CLI is the only part
that needs root (docker socket + `/var/lib/ha_apps`).

## Requirements

- Home Assistant Core ≥ 2025.1 on a Debian-family host
- Docker (add-ons run as containers)
- git, python3 with PyYAML for the CLI
- Root for the backend (docker socket)

## Install

### 1. The custom component (via HACS or manually)

Manual:

```bash
cd <ha-config>/custom_components
git clone https://github.com/rubo77/homeassistant-apps.git
cp -r homeassistant-apps/custom_components/ha_apps .
```

Then Settings → Devices & services → Add integration → "HA Apps",
and restart Home Assistant. An "Apps" entry appears in the sidebar.

### 2. The backend CLI (required, on the HA host)

```bash
cd homeassistant-apps
bash install.sh
```

`install.sh` copies `ha-apps.py` + `supervisor_stub.py` to
`/usr/local/lib/ha-apps`, the `ha-apps` wrapper to `/usr/local/bin`,
creates `/var/lib/ha_apps/*` and warms the add-on catalog.

### 3. The CLI

The same `ha-apps` command backs the panel and works standalone on
the HA host:

```bash
ha-apps update-catalog   # refresh the add-on catalogs
ha-apps list             # all add-ons with install state
ha-apps info <slug>      # details for one add-on
ha-apps install <slug>   # pull/build + create container
ha-apps start|stop <slug>
ha-apps update <slug>    # reinstall newer image
ha-apps remove <slug> [--purge]   # --purge deletes /data
ha-apps logs <slug>
ha-apps status           # installed.json + container states
ha-apps doctor           # health checks (docker, catalogs, stub)
```

### Configuration

All paths are environment-configurable:

| Variable | Default | Used by |
|---|---|---|
| `HA_APPS_LIB` | `/usr/local/lib/ha-apps` | `install.sh`, CLI lookup |
| `HA_APPS_BIN` | `/usr/local/bin` | `install.sh`, component |
| `HA_APPS_DIR` | `/var/lib/ha_apps` | CLI + component |
| `HA_APPS_LOCAL_REPO` | `$HA_APPS_DIR/local` | CLI + panel ("local" source) |

Set them in the systemd unit (`Environment=HA_APPS_DIR=...`) when
non-default locations are used.

### Local add-on repositories

Besides the official and community catalogs, ha-apps scans
`HA_APPS_LOCAL_REPO` for add-ons built locally (e.g. from a
`Dockerfile`). Apps there appear under the **local** source badge.
Each local repo is a directory of add-on folders containing
`config.yaml`; a `repository.yaml` at the root makes it a proper
repository.

Example: [rubo77/tidal-addon](https://github.com/rubo77/tidal-addon)
ships a Mopidy/Tidal add-on this way.

## Supported vs. best-effort

- Apps that only need plain `docker run` work directly
  (file explorer, code server, most utility add-ons).
- Apps that need Supervisor APIs boot through the stub; features that
  genuinely need a running Supervisor (discovery, `hassio_*` services,
  auth) are flagged in the UI — they may start but run limited.
- Apps with CPU requirements the host cannot satisfy (e.g. ONNX
  runtimes needing AVX on a pre-AVX CPU) are marked unsupported before
  install, not after a crash loop.
- Special installers handle port publishing + HA integration setup
  automatically; currently: **Piper** (Wyoming TTS).

## Data layout

```
/var/lib/ha_apps/
├── repos/        git clones of the add-on catalogs
├── local/        local add-on repo (HA_APPS_LOCAL_REPO)
├── data/<slug>/  per-app data (mounted at /data in the container)
├── cache/        image download-size cache
└── share|ssl|addons|media|backup/  bind-mounts for add-ons expecting them
```

## Development

- `custom_components/ha_apps/` — the HA integration (panel + HTTP API)
- `ha-apps.py` — the backend CLI (stdlib + PyYAML only)
- `supervisor_stub.py` — the supervisor API stub container script
- `install.sh` — backend installer

Contributions welcome — especially new special installers for
Supervisor-dependent add-ons.

## License

MIT — see `LICENSE`.
