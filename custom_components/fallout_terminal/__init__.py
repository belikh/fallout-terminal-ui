"""The Fallout Terminal UI integration.

This integration's job is to serve the Fallout design-system frontend assets and register the
Lovelace cards + Vault Boy engine so they're available on every dashboard. It intentionally creates
no entities — the cards bind to the user's own existing entities.
"""
from __future__ import annotations

import os

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN

# Served under /fallout_terminal_ui. Order matters: core defines the shared globals every card
# reads, and the vault-boy engine must register before the cards that embed it.
FRONTEND_SCRIPTS = (
    "cards/fallout-core.js",
    "assets/vault-boy-engine.js",
    "cards/fallout-gauge-card.js",
    "cards/fallout-status-card.js",
    "cards/fallout-control-card.js",
    "cards/fallout-vaultboy-card.js",
    "cards/fallout-stats-card.js",
    "cards/fallout-terminal-card.js",
)

URL_BASE = "/fallout_terminal_ui"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Fallout Terminal UI from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    await hass.http.async_register_static_paths(
        [StaticPathConfig(URL_BASE, frontend_dir, cache_headers=False)]
    )

    for script in FRONTEND_SCRIPTS:
        add_extra_js_url(hass, f"{URL_BASE}/{script}")

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True
