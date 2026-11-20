# CHANGES

## 26-11-19 — local add-on repos + docker build support

- `ha-apps.py`: `LOCAL_REPO_DIR` (`HA_APPS_LOCAL_REPO`, default
  `$HA_APPS_DIR/local`) scanned as extra catalog source `local` — no git,
  plain `*/config.yaml` dirs. `find_addon` searches it too.
- `normalize()`: `build: true` or a `Dockerfile` next to `config.yaml`
  marks an add-on as locally built — image defaults to
  `ha-apps-local/<slug>:<version>`, no manifest/arch check.
- `cmd_install`/`cmd_update`: `build_dir` add-ons run
  `docker build --network host` instead of `docker pull`
  (--network host works around broken DNS on docker0 at nebelhaufen;
  runtime DNS via the internal resolver on ha_apps_net is unaffected).
- `build_run_args`: `devices:` list passed through as `--device`
  (needed for `/dev/snd` audio).
- `prefetch_sizes` skips locally built images (no registry manifest).
- `POST_INSTALL_NOTES["tidal"]`: PKCE login flow (Iris on 6680,
  login.tidal.com URL from logs, callback server on 8989), ALSA option,
  subscription requirement.
- Panel: `local` repo filter option + teal badge + tooltip
  (en/de + PANEL_I18N), customElements.define guard for double-eval,
  version 0.2.3.
- First local add-on: `tidal` (separate repo /var/www/tidal-addon) —
  Mopidy + mopidy-tidal + Iris + mopidy-mpd on debian:trixie-slim;
  mopidy pinned <4 (iris needs mopidy.models.serialize, removed in v4)
  and setuptools<81 (pkg_resources removed in v81). Verified on
  nebelhaufen: container up, Iris 200 on :6680, MPD OK on :6600,
  /dev/snd mapped, HDA Intel ALC262 present.
- 20.11.2026 installability gates: audio (no /dev/snd), bluetooth (no
  hci*), services `x:need` without an installed provider add-on
  (phpmyadmin -> mariadb); capability grants now actually wired into
  docker run args — docker.sock/dbus/udev mounts, --pid/--uts/--ipc
  host, --privileged (privileged/full_access), SYS_MODULE cap,
  usb/serial/devicetree/gpio/dri/snd device maps, NET_ADMIN for
  /dev/net/* add-ons
