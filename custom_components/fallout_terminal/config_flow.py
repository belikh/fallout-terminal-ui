"""Config flow for Fallout Terminal UI.

There is nothing to configure — the integration only serves frontend assets — so this is a single
confirmation step, limited to one instance.
"""
from __future__ import annotations

from typing import Any

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DEFAULT_NAME, DOMAIN


class FalloutTerminalConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Fallout Terminal UI."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step.

        Nothing to ask, so the entry is created as soon as the integration is added.
        """
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title=DEFAULT_NAME, data={})
