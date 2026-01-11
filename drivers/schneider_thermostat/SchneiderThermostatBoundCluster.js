'use strict';

const { BoundCluster } = require('zigbee-clusters');

/**
 * Bound cluster that acts as a Thermostat server.
 * The Schneider CCTFR6400 thermostat:
 * - Reads the setpoint from Homey via binding (attribute read)
 * - Reads piHeatingDemand to display the flame icon
 * - Sends setpoint changes via Command 0xE0 when user changes on device
 */
class SchneiderThermostatBoundCluster extends BoundCluster {
  constructor({ getSetpoint, setSetpoint, getMinSetpoint, getMaxSetpoint, getPiHeatingDemand, getLocalTemperature }) {
    super();
    this._getSetpoint = getSetpoint;
    this._setSetpoint = setSetpoint;
    this._getMinSetpoint = getMinSetpoint || (() => 400);
    this._getMaxSetpoint = getMaxSetpoint || (() => 3000);
    this._getPiHeatingDemand = getPiHeatingDemand || (() => 0);
    this._getLocalTemperature = getLocalTemperature || (() => null);
  }

  // Attribute getters - read by the thermostat
  get occupiedHeatingSetpoint() {
    return this._getSetpoint();
  }

  get minHeatSetpointLimit() {
    return this._getMinSetpoint();
  }

  get maxHeatSetpointLimit() {
    return this._getMaxSetpoint();
  }

  // PI Heating Demand (0-100%) - controls the flame icon on the thermostat
  // 0 = flame off, 100 = flame on (full heat demand)
  get pIHeatingDemand() {
    return this._getPiHeatingDemand();
  }

  get localTemperature() {
    // Return the actual measured temperature if available
    const temp = this._getLocalTemperature();
    if (temp !== null && Number.isFinite(temp)) {
      return temp;
    }
    // Return 0x8000 (-32768) which means "not available" per ZCL spec
    return -32768;
  }

  get systemMode() {
    return 4; // Heat
  }

  get controlSequenceOfOperation() {
    return 2; // Heating only
  }

  /**
   * Handle Schneider proprietary command 0xE0 - Setpoint change from thermostat
   * Format: zone (uint8) + temperature (uint16 LE centi-degrees) + end marker (0xFF)
   */
  schneiderSetpoint(args) {
    console.log('[BoundCluster] Received schneiderSetpoint command:', JSON.stringify(args));
    if (args && typeof args.temperature === 'number') {
      console.log('[BoundCluster] Setpoint from thermostat:', args.temperature / 100, '°C');
      if (this._setSetpoint) {
        this._setSetpoint(args.temperature);
      }
    }
  }

  // Catch-all for unknown commands
  unknownCommand(commandId, args) {
    console.log('[BoundCluster] Unknown command received:', commandId, 'args:', JSON.stringify(args));
  }
}

module.exports = SchneiderThermostatBoundCluster;
