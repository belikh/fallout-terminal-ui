"""The Fallout Terminal Integration."""
from __future__ import annotations

import random
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity import Entity

from .const import DOMAIN

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Fallout Terminal from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data
    
    await hass.config_entries.async_forward_entry_setups(entry, ["sensor"])
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, ["sensor"])
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return True

class VaultEntity(Entity):
    """Base class for vault entities."""
    _attr_has_entity_name = True
    _attr_should_poll = True

    def __init__(self, name: str, unique_id: str) -> None:
        """Initialize the entity."""
        self._attr_name = name
        self._attr_unique_id = unique_id
