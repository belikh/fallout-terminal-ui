"""Diagnostic core status sensor processing platform."""
from __future__ import annotations

import random
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
    sensors = [
        VaultDiagnosticSensor("Vault Mainframe Core Status", "vault_mainframe_core_status_001"),
        VaultDiagnosticSensor("Radiation Levels", "vault_rad_levels_001", "rads"),
        VaultDiagnosticSensor("Purified Water Supply", "vault_water_supply_001", "%"),
        VaultDiagnosticSensor("Fusion Core Charge", "vault_fusion_core_001", "%"),
        VaultDiagnosticSensor("Defensive Turret Status", "vault_defense_001"),
        VaultDiagnosticSensor("Oxygen Scrubber Efficiency", "vault_o2_scrubber_001", "%"),
        VaultDiagnosticSensor("Vault Population", "vault_population_001", "Dwellers"),
        VaultDiagnosticSensor("Caps in Reserve", "vault_caps_001", "Caps"),
        VaultDiagnosticSensor("Food Paste Production", "vault_food_001", "kg/h"),
        VaultDiagnosticSensor("Structural Breach Probability", "vault_hull_001", "%")
    ]
    async_add_entities(sensors, update_before_add=True)

class VaultDiagnosticSensor(SensorEntity):
    """Representation of an internal Vault-Tec Mainframe System Diagnostic."""

    def __init__(self, name: str, unique_id: str, unit: str | None = None) -> None:
        """Initialize the sensor."""
        self._attr_name = name
        self._attr_unique_id = unique_id
        self._attr_native_unit_of_measurement = unit
        self._attr_icon = "mdi:terminal"

    def update(self) -> None:
        """Fetch updated operational data parameters."""
        animations = ["idle", "walking", "thumbs_up", "alert"]
        if self._attr_native_unit_of_measurement == "%":
            self._attr_native_value = round(random.uniform(85.0, 100.0), 1)
        elif self._attr_native_unit_of_measurement == "rads":
            self._attr_native_value = round(random.uniform(0.1, 5.0), 2)
        elif self._attr_native_unit_of_measurement == "Caps":
            self._attr_native_value = random.randint(1000, 50000)
        elif self._attr_native_unit_of_measurement == "Dwellers":
            self._attr_native_value = random.randint(10, 200)
        else:
            self._attr_native_value = "Operational"
        
        self._attr_extra_state_attributes = {
            "last_diagnostic": "SUCCESS",
            "robco_os_version": "2287.4",
            "vault_id": "Vault 111",
            "suggested_animation": random.choice(animations)
        }
