'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

// Register Schneider-specific clusters
require('./SchneiderThermostatCluster');
require('./WiserDeviceInfoCluster');
const SchneiderThermostatBoundCluster = require('./SchneiderThermostatBoundCluster');
const BasicBoundCluster = require('./BasicBoundCluster');

// Set to true to enable verbose debug logging
// Can be overridden via env.json or environment variable
// Note: Homey.env is only available in device/app context, not at module level
// So we check process.env which is set from env.json by Homey
const DEBUG_MODE = process.env.HOMEY_DEBUG === 'true' || false;

// Constants
const TEMP_MIN_CENTI = 400;  // 4°C minimum setpoint
const TEMP_MAX_CENTI = 3000; // 30°C maximum setpoint
const TEMP_DEFAULT_CENTI = 2000; // 20°C default setpoint
const TEMP_STEP_CENTI = 50;  // 0.5°C step for button presses
const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const READ_ATTRIBUTES_TIMEOUT_MS = 5000; // 5 seconds timeout for attribute reads

// Conversions
const centiToC = (v) => (Number.isFinite(v) ? v / 100 : null);
const centiPctToPct = (v) => (Number.isFinite(v) ? v / 100 : null);
// Schneider reports battery as 0-100%, not 0-200 (half percent) like ZCL spec
const batteryPct = (v) => (Number.isFinite(v) ? Math.min(100, v) : null);

// Safe number parsing/clamp
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

class SchneiderThermostatDevice extends ZigBeeDevice {
  // Debug logging helper - only logs when DEBUG_MODE is true
  debug(...args) {
    if (DEBUG_MODE) {
      this.log('[DEBUG]', ...args);
    }
  }

  async onNodeInit({ zclNode }) {
    this.log('Init', this.getData());

    const ep = zclNode.endpoints?.[1];
    if (!ep) {
      this.error('Endpoint 1 not found! Device might not be initialized correctly.');
      return;
    }

    this._zclNode = zclNode;
    this._endpoint = ep;

    // Restore setpoint from store, or use current capability value, or default to 20°C
    const storedSetpoint = this.getStoreValue('targetSetpointCenti');
    const capabilityValue = this.getCapabilityValue('target_temperature');
    if (storedSetpoint) {
      this._targetSetpointCenti = storedSetpoint;
      this.log('Restored setpoint from store:', storedSetpoint / 100, '°C');
    } else if (capabilityValue) {
      this._targetSetpointCenti = Math.round(capabilityValue * 100);
      this.log('Restored setpoint from capability:', capabilityValue, '°C');
    } else {
      this._targetSetpointCenti = TEMP_DEFAULT_CENTI;
      this.log('Using default setpoint: 20°C');
    }

    // Initialize flag to prevent feedback loops
    this._isUpdatingSetpoint = false;

    // Initialize capabilities with default values
    try {
      await this.setCapabilityValue('target_temperature', this._targetSetpointCenti / 100);
    } catch (err) {
      this.error('Failed to initialize target_temperature capability:', err);
    }

    // Initialize thermostat_mode instead of heating_demand
    if (this.hasCapability('thermostat_mode')) {
      try {
        await this.setCapabilityValue('thermostat_mode', 'off');
      } catch (err) {
        this.error('Failed to initialize thermostat_mode capability:', err);
      }
    }

    this.log('Available clusters:', Object.keys(ep.clusters || {}));

    // Initialize heating demand (0-100%, controls flame icon on thermostat)
    this._piHeatingDemand = 0;

    // Store measured temperature for BoundCluster (in centi-degrees)
    this._localTemperatureCenti = null;

    // ---- Bind as Thermostat server ----
    // The Schneider thermostat reads the setpoint from Homey via binding
    try {
      const boundCluster = new SchneiderThermostatBoundCluster({
        getSetpoint: () => this._targetSetpointCenti,
        setSetpoint: async (centiValue) => {
          const tempC = centiValue / 100;
          this.log('>>> SETPOINT FROM THERMOSTAT:', centiValue, '=', tempC, '°C');
          this._targetSetpointCenti = centiValue;
          try {
            await this.setStoreValue('targetSetpointCenti', centiValue);
            await this.setCapabilityValue('target_temperature', tempC);
          } catch (err) {
            this.error('Failed to update setpoint from thermostat:', err);
          }
        },
        getMinSetpoint: () => TEMP_MIN_CENTI,
        getMaxSetpoint: () => TEMP_MAX_CENTI,
        getPiHeatingDemand: () => this._piHeatingDemand,
        getLocalTemperature: () => this._localTemperatureCenti,
        logger: (level, ...args) => {
          if (level === 'error') {
            this.error(...args);
          } else {
            this.log(...args);
          }
        },
      });
      ep.bind('thermostat', boundCluster);
      this.log('✅ Bound thermostat cluster as server');
    } catch (err) {
      this.error('Failed to bind thermostat cluster:', err);
      // Continue initialization even if binding fails - device might still work
    }

    // ---- Bind Basic cluster (0x0000) ----
    // The thermostat might read Basic cluster attributes to verify hub connectivity
    try {
      const basicBoundCluster = new BasicBoundCluster({
        logger: (level, ...args) => {
          if (level === 'error') {
            this.error(...args);
          } else {
            this.log(...args);
          }
        },
      });
      ep.bind('basic', basicBoundCluster);
      this.log('✅ Bound Basic cluster as server');
      this.log('   The thermostat can now verify hub connectivity via Basic cluster');
    } catch (err) {
      this.error('Failed to bind Basic cluster:', err);
      // Continue initialization even if binding fails
    }

    // ---- Thermostat Mode ----
    // Controls the mode (heat/off) and maps to piHeatingDemand for flame icon
    if (this.hasCapability('thermostat_mode')) {
      this.registerCapabilityListener('thermostat_mode', async (value) => {
        this.log(`Setting thermostat mode to ${value}`);
        // Map mode to heating demand: "heat" = 100%, "off" = 0%
        if (value === 'heat') {
          this._piHeatingDemand = 100;
        } else if (value === 'off') {
          this._piHeatingDemand = 0;
        }
        return true;
      });
      // Initialize mode to "off" by default
      try {
        await this.setCapabilityValue('thermostat_mode', 'off');
      } catch (err) {
        this.error('Failed to initialize thermostat_mode capability:', err);
      }
    }

    // ---- Temperature ----
    if (this.hasCapability('measure_temperature')) {
      this.registerCapability('measure_temperature', CLUSTER.TEMPERATURE_MEASUREMENT, {
        get: 'measuredValue',
        report: 'measuredValue',
        reportParser: (value) => {
          // Store in centi-degrees for BoundCluster
          if (Number.isFinite(value)) {
            this._localTemperatureCenti = value;
          }
          return centiToC(value);
        },
        getParser: (value) => {
          // Store in centi-degrees for BoundCluster
          if (Number.isFinite(value)) {
            this._localTemperatureCenti = value;
          }
          return centiToC(value);
        },
      });
    }

    // ---- Humidity ----
    if (this.hasCapability('measure_humidity')) {
      this.registerCapability('measure_humidity', CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT, {
        get: 'measuredValue',
        report: 'measuredValue',
        reportParser: centiPctToPct,
        getParser: centiPctToPct,
      });
    }

    // ---- Battery ----
    if (this.hasCapability('measure_battery')) {
      this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
        get: 'batteryPercentageRemaining',
        report: 'batteryPercentageRemaining',
        reportParser: batteryPct,
        getParser: batteryPct,
      });
    }

    // ---- Target Temperature ----
    if (this.hasCapability('target_temperature')) {
      this.registerCapabilityListener('target_temperature', async (value) => {
        const c = clamp(toNumber(value) || 20, TEMP_MIN_CENTI / 100, TEMP_MAX_CENTI / 100);
        const centi = Math.round(c * 100);

        this.log(`Setting target_temperature to ${c}°C`);
        this._targetSetpointCenti = centi;

        // Persist to store
        try {
          await this.setStoreValue('targetSetpointCenti', centi);
        } catch (err) {
          this.error('Failed to persist setpoint to store:', err);
        }

        // The thermostat will read this value on its next poll
        return true;
      });
    }

    // ---- Debug: Listen for ALL thermostat cluster events ----
    if (ep.clusters?.thermostat && DEBUG_MODE) {
      this.debug('Setting up thermostat debug listeners');
      ep.clusters.thermostat.on('attr.*', (name, value) => {
        this.debug('THERMOSTAT ATTR:', name, '=', value);
      });
    }

    // ---- Listen for Wiser device info (button presses, screen events) ----
    // Cluster 65027 (0xFE03) = wiserDeviceInfo
    // Z2M approach: track button presses and adjust setpoint accordingly
    this._screenAwake = false;

    const wiserCluster = ep.clusters?.wiserDeviceInfo || ep.clusters?.['65027'] || ep.clusters?.draytonDeviceInfo;
    if (wiserCluster) {
      this.log('Setting up wiserDeviceInfo listener');

      wiserCluster.on('attr.deviceInfo', async (value) => {
        try {
          this.log('>>> WISER DEVICE INFO:', value);
          await this._handleDeviceInfo(value);
        } catch (err) {
          this.error('Error handling deviceInfo attribute:', err);
        }
      });

      // Also listen for report events
      wiserCluster.on('report', async (report) => {
        try {
          this.debug('WISER REPORT:', JSON.stringify(report));
          if (report?.deviceInfo) {
            await this._handleDeviceInfo(report.deviceInfo);
          }
        } catch (err) {
          this.error('Error handling deviceInfo report:', err);
        }
      });

      // Generic attribute listener (debug only)
      if (DEBUG_MODE) {
        wiserCluster.on('attr.*', (name, value) => {
          this.debug('WISER ATTR:', name, '=', value);
        });
      }
    } else {
      this.log('wiserDeviceInfo cluster not found, checking available clusters');
    }

    // ---- Listen to ALL clusters for debugging (only when DEBUG_MODE is true) ----
    if (DEBUG_MODE) {
      this.debug('Setting up global debug listeners on all clusters');
      for (const [clusterName, cluster] of Object.entries(ep.clusters || {})) {
        if (cluster && typeof cluster.on === 'function') {
          cluster.on('attr.*', (name, value) => {
            this.debug(`[${clusterName}] attr.${name} =`, value);
          });
        }
      }

      // Listen for raw frames on the node
      if (zclNode.on) {
        zclNode.on('frame', (frame) => {
          this.debug('RAW FRAME:', JSON.stringify(frame));
        });
      }
    }

    // ---- Periodic polling for anti-drift (every 10 minutes) ----
    // This helps detect and correct any setpoint drift between Homey and thermostat
    this._startAntiDriftPolling();

    this.log('Device initialization complete');
  }

  /**
   * Start periodic polling to detect setpoint drift
   * Reads ENV data periodically to ensure Homey and thermostat are in sync
   */
  _startAntiDriftPolling() {
    // Clear any existing interval
    if (this._antiDriftInterval) {
      clearInterval(this._antiDriftInterval);
    }

    this._antiDriftInterval = setInterval(async () => {
      try {
        // Try to read temperature measurement to keep connection alive
        // This also updates _localTemperatureCenti for the BoundCluster
        const tempCluster = this._endpoint?.clusters?.temperatureMeasurement;
        if (tempCluster) {
          // Add timeout to prevent indefinite blocking
          const readPromise = tempCluster.readAttributes(['measuredValue']);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Read attributes timeout')), READ_ATTRIBUTES_TIMEOUT_MS);
          });

          try {
            const result = await Promise.race([readPromise, timeoutPromise]);
            if (result?.measuredValue !== undefined) {
              this.log(`Anti-drift poll: temperature = ${result.measuredValue / 100}°C`);
              this._localTemperatureCenti = result.measuredValue;
            }
          } catch (err) {
            this.debug('Anti-drift poll: failed to read temperature (device may be offline):', err.message);
          }
        }

        // Log current state for debugging
        this.log(`Anti-drift check: Homey setpoint = ${this._targetSetpointCenti / 100}°C, heating demand = ${this._piHeatingDemand}%`);
      } catch (err) {
        this.error('Anti-drift poll error:', err);
      }
    }, POLL_INTERVAL_MS);

    this.log(`Anti-drift polling started (every ${POLL_INTERVAL_MS / 60000} minutes)`);
  }

  async onUninit() {
    // Clean up polling interval when device is uninitialized (disconnected)
    if (this._antiDriftInterval) {
      clearInterval(this._antiDriftInterval);
      this._antiDriftInterval = null;
      this.log('Anti-drift polling stopped (device uninitialized)');
    }
  }

  async onDeleted() {
    // Clean up polling interval
    if (this._antiDriftInterval) {
      clearInterval(this._antiDriftInterval);
      this._antiDriftInterval = null;
    }
    this.log('Device deleted');
  }

  /**
   * Handle deviceInfo attribute from wiserDeviceInfo cluster
   * Format: "UI,ActionName" or "ALG,..." or "ADC,..."
   *
   * UI Actions:
   * - ScreenWake / ScreenSleep: Screen state changes
   * - ButtonPressPlusDown: Plus button pressed (increase setpoint by 0.5°C)
   * - ButtonPressMinusDown: Minus button pressed (decrease setpoint by 0.5°C)
   * - ButtonPressCenterDown: Center button pressed
   */
  async _handleDeviceInfo(deviceInfo) {
    if (!deviceInfo || typeof deviceInfo !== 'string') {
      this.log('Invalid deviceInfo:', deviceInfo);
      return;
    }

    const parts = deviceInfo.split(',');
    const dataType = parts[0];
    const action = parts[1];

    this.log(`Parsed deviceInfo: type=${dataType}, action=${action}`);

    // Handle ENV data: ENV,setpoint,temperature,humidity (all in centi-units)
    if (dataType === 'ENV') {
      // Validate that we have enough parts
      if (parts.length < 4) {
        this.log('Invalid ENV data: insufficient parts', deviceInfo);
        return;
      }

      // Parse and validate each value strictly
      const setpointCenti = parseInt(parts[1], 10);
      const tempCenti = parseInt(parts[2], 10);
      const humidityCenti = parseInt(parts[3], 10);

      // Validate that all values are valid integers within expected ranges
      const isValidSetpoint = Number.isInteger(setpointCenti) && 
                              setpointCenti >= TEMP_MIN_CENTI && 
                              setpointCenti <= TEMP_MAX_CENTI &&
                              setpointCenti !== -32768; // -32768 means "not available" in ZCL

      const isValidTemp = Number.isInteger(tempCenti) && tempCenti !== -32768;
      const isValidHumidity = Number.isInteger(humidityCenti) && 
                              humidityCenti >= 0 && 
                              humidityCenti <= 10000; // 0-100% in centi-percent

      if (!isValidSetpoint || !isValidTemp || !isValidHumidity) {
        this.log(`ENV data validation failed: setpoint=${setpointCenti}, temp=${tempCenti}, humidity=${humidityCenti}`);
        return;
      }

      this.log(`ENV data: setpoint=${setpointCenti/100}°C, temp=${tempCenti/100}°C, humidity=${humidityCenti/100}%`);

      // Sync setpoint if it differs from current value
      if (setpointCenti !== this._targetSetpointCenti) {
        this.log(`Syncing setpoint from ENV: ${this._targetSetpointCenti/100}°C -> ${setpointCenti/100}°C`);
        await this._updateSetpoint(setpointCenti);
      }
      return;
    }

    if (dataType !== 'UI') {
      return;
    }

    // Track screen state
    if (action === 'ScreenWake') {
      this._screenAwake = true;
      this.log('Screen woke up');
      return;
    }

    if (action === 'ScreenSleep') {
      this._screenAwake = false;
      this.log('Screen went to sleep');
      return;
    }

    // Handle button presses - adjust setpoint by 0.5°C (50 centi-degrees)
    // Note: If screen was asleep, first button press only wakes screen (no temp change)
    if (action === 'ButtonPressPlusDown') {
      if (!this._screenAwake) {
        this.log('Plus button pressed (ignored - screen was asleep, this just wakes it)');
        this._screenAwake = true;
        return;
      }
      const newSetpoint = Math.min(this._targetSetpointCenti + TEMP_STEP_CENTI, TEMP_MAX_CENTI);
      this.log(`Plus button pressed: ${this._targetSetpointCenti / 100}°C -> ${newSetpoint / 100}°C`);
      await this._updateSetpoint(newSetpoint);
      return;
    }

    if (action === 'ButtonPressMinusDown') {
      if (!this._screenAwake) {
        this.log('Minus button pressed (ignored - screen was asleep, this just wakes it)');
        this._screenAwake = true;
        return;
      }
      const newSetpoint = Math.max(this._targetSetpointCenti - TEMP_STEP_CENTI, TEMP_MIN_CENTI);
      this.log(`Minus button pressed: ${this._targetSetpointCenti / 100}°C -> ${newSetpoint / 100}°C`);
      await this._updateSetpoint(newSetpoint);
      return;
    }

    if (action === 'ButtonPressCenterDown') {
      // Note: Boost mode on thermostat will be overwritten by Homey's setpoint
      // The thermostat doesn't report its boost temperature, so we can't sync it
      this.log('Center button pressed (boost mode - will be overwritten by Homey setpoint)');
      return;
    }

    this.log('Unknown UI action:', action);
  }

  /**
   * Update setpoint from button press or ENV message
   * Uses _isUpdatingSetpoint flag to prevent feedback loops
   */
  async _updateSetpoint(centiValue) {
    // Prevent feedback loop (in case setCapabilityValue triggers listener)
    if (this._isUpdatingSetpoint) {
      this.debug('Skipping setpoint update - already in progress');
      return;
    }

    // Validate setpoint range
    if (!Number.isInteger(centiValue) || centiValue < TEMP_MIN_CENTI || centiValue > TEMP_MAX_CENTI) {
      this.error(`Invalid setpoint value: ${centiValue} (must be between ${TEMP_MIN_CENTI} and ${TEMP_MAX_CENTI})`);
      return;
    }

    this._isUpdatingSetpoint = true;
    try {
      this._targetSetpointCenti = centiValue;
      try {
        await this.setStoreValue('targetSetpointCenti', centiValue);
      } catch (err) {
        this.error('Failed to persist setpoint to store:', err);
      }

      try {
        await this.setCapabilityValue('target_temperature', centiValue / 100);
        this.log(`Setpoint updated to ${centiValue / 100}°C`);
      } catch (err) {
        this.error('Failed to update target_temperature capability:', err);
      }
    } finally {
      this._isUpdatingSetpoint = false;
    }
  }
}

module.exports = SchneiderThermostatDevice;
