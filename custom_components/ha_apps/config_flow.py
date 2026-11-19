"""Config flow for HA Apps — single-instance integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class HaAppsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the user step; there are no settings to ask for yet."""

    async def async_step_user(self, user_input=None) -> ConfigFlowResult:
        """Create the entry on confirmation."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            return self.async_create_entry(title="HA Apps", data={})
        return self.async_show_form(step_id="user")
