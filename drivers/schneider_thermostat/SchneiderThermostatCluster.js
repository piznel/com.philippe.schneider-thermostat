'use strict';

const { Cluster, ThermostatCluster, ZCLDataTypes } = require('zigbee-clusters');

const SCHNEIDER_MANUFACTURER_ID = 0x105E;

/**
 * Extended Thermostat cluster with Schneider-specific commands.
 * Command 0xE0: Setpoint change from thermostat
 * Command 0xE1: FIP mode change
 */
class SchneiderThermostatCluster extends ThermostatCluster {
  static get COMMANDS() {
    return {
      ...super.COMMANDS,

      // Schneider setpoint command (sent by thermostat when user changes setpoint)
      schneiderSetpoint: {
        id: 0xE0,
        manufacturerId: SCHNEIDER_MANUFACTURER_ID,
        args: {
          zone: ZCLDataTypes.uint8,
          temperature: ZCLDataTypes.uint16, // centi-degrees
          endMarker: ZCLDataTypes.uint8,
        },
      },

      // Schneider FIP mode command
      schneiderFipMode: {
        id: 0xE1,
        manufacturerId: SCHNEIDER_MANUFACTURER_ID,
        args: {
          zone: ZCLDataTypes.uint8,
          mode: ZCLDataTypes.uint8,
          priority: ZCLDataTypes.uint8,
          endMarker: ZCLDataTypes.uint8,
        },
      },
    };
  }
}

// Register the custom cluster
Cluster.addCluster(SchneiderThermostatCluster);

module.exports = SchneiderThermostatCluster;
