# homeassistant-apps — Supervisor-free add-on store

## Rules

- **Do not hand-build or hand-repair individual apps.** Anything an app
  needs (ports, devices, mounts, tokens, warnings, install notes) must
  work through the app store itself — catalog normalization, install
  path, capability grants, post_install notes. Fix `ha-apps.py` /
  `custom_components/ha_apps/` generically instead of special-casing
  one add-on or fixing a container by hand. If the store can't express
  it yet, extend the store.
- If an app installed via the store works as expected, give it the
  "verified" tag by adding it to `SPECIAL_INSTALLERS` in `ha-apps.py`
  (the panel shows it as "verified"/"getestet" and the tested filter
  picks it up).

## Layout

- `ha-apps.py` — CLI + backend (catalog scan, normalize, install/run)
- `ha-apps` — CLI wrapper
- `supervisor_stub.py` — Supervisor API stub + HA API proxy
- `custom_components/ha_apps/` — HA integration + sidebar panel
- `dev/` — CHANGES.md (doc duty), prompts_log.md (local only)
- install.sh — host installer; deploy via `bash dev/deploy-ha-apps.sh`
  in the nebelhaufen repo (HA_APPS_REPO points here)
