"""Diagnostic core status sensor processing platform."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    async_add_entities([VaultDiagnosticSensor()], update_before_add=True)

class VaultDiagnosticSensor(SensorEntity):
    """Representation of an internal Vault-Tec Mainframe System Diagnostic."""

    _attr_name = "Vault Mainframe Core Status"
    _attr_unique_id = "vault_mainframe_core_status_001"
    _attr_icon = "mdi:terminal"

    def update(self) -> None:
        """Fetch updated operational data parameters."""
        self._attr_native_value = "Operational"
        self._attr_extra_state_attributes = {
            "mainframe_load": "14.2%",
            "radiation_scrubber_efficiency": "99.8%",
            "water_purifier_integrity": "100.0%",
            "fusion_core_charge": "98.4%"
        }
