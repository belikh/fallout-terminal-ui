"""The Fallout Terminal UI integration.

This integration's job is to serve the Fallout design-system frontend assets and register the
Lovelace cards + Vault Boy engine so they're available on every dashboard. It intentionally creates
no entities — the cards bind to the user's own existing entities.
"""
from __future__ import annotations

import filecmp
import os
import shutil

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
    "cards/fallout-header-card.js",
    "cards/fallout-nav-card.js",
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

    # Register the Fallout themes the supported way: install the bundled theme file into the
    # user's themes/ directory (configuration.yaml merges it via
    # `frontend: themes: !include_dir_merge_named themes`) and ask the frontend to reload.
    # Runtime injection into hass.data is unsupported and silently no-ops — which is why earlier
    # builds fell back to the green defaults. Copy + reload actually registers the themes.
    await hass.async_add_executor_job(_install_theme, hass, frontend_dir)
    if hass.services.has_service("frontend", "reload_themes"):
        await hass.services.async_call("frontend", "reload_themes", blocking=False)

    return True


def _install_theme(hass: HomeAssistant, frontend_dir: str) -> None:
    """Copy the bundled Fallout theme into <config>/themes so HA loads it on (re)start.

    Copies only when missing or changed, so shipped theme updates propagate on upgrade without
    rewriting the file on every boot. Best-effort: failures leave cards on their green defaults.
    """
    src = os.path.join(frontend_dir, "themes", "fallout_retro.yaml")
    if not os.path.exists(src):
        return
    dest_dir = hass.config.path("themes")
    try:
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, "fallout_retro.yaml")
        if not os.path.exists(dest) or not filecmp.cmp(src, dest, shallow=False):
            shutil.copyfile(src, dest)
    except OSError:
        pass


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True
