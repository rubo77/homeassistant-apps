"""Constants for the HA Apps integration."""

from __future__ import annotations

import os
import sys

DOMAIN = "ha_apps"

# installed on the host by install.sh; run with the HA venv python
# (guaranteed PyYAML) because the systemd unit has a minimal PATH.
# HA_APPS_LIB overrides the library dir for non-standard installs.
CLI_CMD = (
    sys.executable,
    os.environ.get("HA_APPS_LIB", "/usr/local/lib/ha-apps") + "/ha-apps.py",
)
REPOS_DIR = os.environ.get("HA_APPS_DIR", "/var/lib/ha_apps") + "/repos"
LOCAL_REPO_DIR = os.environ.get(
    "HA_APPS_LOCAL_REPO",
    os.environ.get("HA_APPS_DIR", "/var/lib/ha_apps") + "/local",
)
PANEL_JS_URL = "/api/ha_apps/panel.js"
# bump on every panel.js change — the module_url is cached aggressively
PANEL_JS_VERSION = "0.2.22"
PANEL_URL_PATH = "ha-apps"
