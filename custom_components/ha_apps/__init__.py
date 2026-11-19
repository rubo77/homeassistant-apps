"""HA Apps — Supervisor-free add-on store for Home Assistant Core."""

from __future__ import annotations

from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_JS_URL, PANEL_JS_VERSION, PANEL_URL_PATH
from .http import (
    HaAppsActionView,
    HaAppsIconView,
    HaAppsInfoView,
    HaAppsListView,
    HaAppsLogsView,
    HaAppsPanelView,
    HaAppsRawView,
    HaAppsReadmeView,
    HaAppsRefreshView,
    HaAppsStatusView,
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register the store API views and the sidebar panel once."""
    if not hass.data.get(DOMAIN):
        hass.data[DOMAIN] = True
        for view in (
            HaAppsListView,
            HaAppsInfoView,
            HaAppsActionView,
            HaAppsLogsView,
            HaAppsStatusView,
            HaAppsRefreshView,
            HaAppsIconView,
            HaAppsReadmeView,
            HaAppsRawView,
            HaAppsPanelView,
        ):
            hass.http.register_view(view())
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Apps",
        sidebar_icon="mdi:puzzle",
        frontend_url_path=PANEL_URL_PATH,
        require_admin=True,
        update=True,
        config={
            "_panel_custom": {
                "name": "ha-apps-panel",
                "embed_iframe": False,
                "trust_external": False,
                "handle_safe_area": False,
                "module_url": f"{PANEL_JS_URL}?v={PANEL_JS_VERSION}",
            }
        },
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove the sidebar panel; views stay registered for the process."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
    return True

