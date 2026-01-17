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
  constructor({ getSetpoint, setSetpoint, getMinSetpoint, getMaxSetpoint, getPiHeatingDemand, getLocalTemperature, logger }) {
    super();
    this._getSetpoint = getSetpoint;
    this._setSetpoint = setSetpoint;
    this._getMinSetpoint = getMinSetpoint || (() => 400);
    this._getMaxSetpoint = getMaxSetpoint || (() => 3000);
    this._getPiHeatingDemand = getPiHeatingDemand || (() => 0);
    this._getLocalTemperature = getLocalTemperature || (() => null);
    // Logger function from device (this.log or this.error)
    this._logger = logger || ((level, ...args) => {
      // Fallback to console if no logger provided
      if (level === 'error') {
        console.error('[BoundCluster]', ...args);
      } else {
        console.log('[BoundCluster]', ...args);
      }
    });
  }

  // Attribute getters - read by the thermostat
  // These are called when the thermostat reads attributes via binding
  get occupiedHeatingSetpoint() {
    const value = this._getSetpoint();
    this._logger('log', '[BoundCluster] Reading occupiedHeatingSetpoint:', value);
    return value;
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
    const value = this._getPiHeatingDemand();
    this._logger('log', '[BoundCluster] Reading pIHeatingDemand:', value);
    return value;
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
    const value = 4; // Heat
    this._logger('log', '[BoundCluster] Reading systemMode:', value);
    return value;
  }

  get controlSequenceOfOperation() {
    return 2; // Heating only
  }

  // Additional attributes that the thermostat might read to verify hub connectivity
  get occupiedCoolingSetpoint() {
    // Not used for heating-only thermostat, but return a valid value
    return 2500; // 25°C default cooling setpoint
  }

  get minCoolSetpointLimit() {
    return 1600; // 16°C minimum cooling
  }

  get maxCoolSetpointLimit() {
    return 3500; // 35°C maximum cooling
  }

  get absMinHeatSetpointLimit() {
    return 700; // 7°C absolute minimum (ZCL spec)
  }

  get absMaxHeatSetpointLimit() {
    return 3000; // 30°C absolute maximum
  }

  get absMinCoolSetpointLimit() {
    return 1600; // 16°C absolute minimum cooling
  }

  get absMaxCoolSetpointLimit() {
    return 3500; // 35°C absolute maximum cooling
  }

  get remoteSensing() {
    return 0; // No remote sensing
  }

  get outdoorTemperature() {
    return -32768; // Not available (0x8000)
  }

  get occupancy() {
    return 1; // Occupied
  }

  /**
   * Handle Schneider proprietary command 0xE0 - Setpoint change from thermostat
   * Format: zone (uint8) + temperature (uint16 LE centi-degrees) + end marker (0xFF)
   */
  schneiderSetpoint(args) {
    this._logger('log', '[BoundCluster] Received schneiderSetpoint command:', JSON.stringify(args));
    if (args && typeof args.temperature === 'number') {
      this._logger('log', '[BoundCluster] Setpoint from thermostat:', args.temperature / 100, '°C');
      if (this._setSetpoint) {
        this._setSetpoint(args.temperature);
      }
    } else {
      this._logger('error', '[BoundCluster] Invalid schneiderSetpoint command args:', args);
    }
  }

  // Catch-all for unknown commands
  unknownCommand(commandId, args) {
    this._logger('log', '[BoundCluster] Unknown command received:', commandId, 'args:', JSON.stringify(args));
  }
}

module.exports = SchneiderThermostatBoundCluster;
