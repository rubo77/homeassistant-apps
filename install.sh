#!/bin/bash
# ha-apps installer — installs the Supervisor-free add-on store backend
# on a Debian/Ubuntu/Raspbian host running Home Assistant Core.
#
# Installs:
#   ha-apps.py + supervisor_stub.py -> /usr/local/lib/ha-apps/
#   ha-apps (wrapper)               -> /usr/local/bin/ha-apps
#   state directories               -> /var/lib/ha_apps/{repos,data,share,ssl,addons,media,backup,cache}
#
# Requires: root, docker, git, python3 with PyYAML.
# Usage: bash install.sh [-h|--help]

set -e
cd "$(dirname "$0")"

for arg in "$@"; do
    case $arg in
        -h|--help) sed -n '2,11p' "$0"; exit 0 ;;
        *) echo "Unknown option: $arg" >&2; exit 1 ;;
    esac
done

LIB_DIR="${HA_APPS_LIB:-/usr/local/lib/ha-apps}"
BIN_DIR="${HA_APPS_BIN:-/usr/local/bin}"
BASE_DIR="${HA_APPS_DIR:-/var/lib/ha_apps}"

if [ "$(id -u)" -ne 0 ]; then
    echo "ERROR: run as root (docker socket + system paths)" >&2
    exit 1
fi
for cmd in docker git; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "ERROR: $cmd is required but not installed" >&2
        exit 1
    fi
done
if ! python3 -c 'import yaml' 2>/dev/null; then
    echo "ERROR: PyYAML missing — apt install python3-yaml" >&2
    exit 1
fi

echo "=== ha-apps install ==="
echo "Step 1: library -> $LIB_DIR"
mkdir -p "$LIB_DIR"
cp ha-apps.py supervisor_stub.py "$LIB_DIR/"

echo "Step 2: wrapper -> $BIN_DIR/ha-apps"
cp ha-apps "$BIN_DIR/ha-apps"

echo "Step 3: state dirs -> $BASE_DIR"
mkdir -p "$BASE_DIR"/{repos,data,share,ssl,addons,media,backup,cache}

echo "Step 4: fetching the add-on catalog (git clone, takes a moment)"
bash "$BIN_DIR/ha-apps" update-catalog

echo "=== done ==="
echo "Next: install the ha_apps custom component (HACS or copy"
echo "custom_components/ha_apps into your HA config dir), add the"
echo "integration via Settings -> Devices & services, restart HA and"
echo "open the 'Apps' sidebar panel."
