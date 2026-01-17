'use strict';

const { BoundCluster } = require('zigbee-clusters');

/**
 * Bound cluster for Basic cluster (0x0000)
 * The thermostat might read Basic cluster attributes to verify hub connectivity
 */
class BasicBoundCluster extends BoundCluster {
  constructor({ logger }) {
    super();
    this._logger = logger || ((level, ...args) => {
      if (level === 'error') {
        console.error('[BasicBoundCluster]', ...args);
      } else {
        console.log('[BasicBoundCluster]', ...args);
      }
    });
  }

  // Basic cluster attributes that the thermostat might read
  get zclVersion() {
    this._logger('log', '[BasicBoundCluster] Reading zclVersion');
    return 3; // ZCL version 3
  }

  get applicationVersion() {
    this._logger('log', '[BasicBoundCluster] Reading applicationVersion');
    return 1;
  }

  get stackVersion() {
    this._logger('log', '[BasicBoundCluster] Reading stackVersion');
    return 2;
  }

  get hardwareVersion() {
    this._logger('log', '[BasicBoundCluster] Reading hardwareVersion');
    return 1;
  }

  get manufacturerName() {
    this._logger('log', '[BasicBoundCluster] Reading manufacturerName');
    return 'Homey';
  }

  get modelIdentifier() {
    this._logger('log', '[BasicBoundCluster] Reading modelIdentifier');
    return 'Homey Pro';
  }

  get dateCode() {
    this._logger('log', '[BasicBoundCluster] Reading dateCode');
    return '20240101';
  }

  get powerSource() {
    this._logger('log', '[BasicBoundCluster] Reading powerSource');
    return 4; // Mains power
  }

  get locationDescription() {
    this._logger('log', '[BasicBoundCluster] Reading locationDescription');
    return '';
  }

  get physicalEnvironment() {
    this._logger('log', '[BasicBoundCluster] Reading physicalEnvironment');
    return 0; // Unknown
  }

  get deviceEnabled() {
    this._logger('log', '[BasicBoundCluster] Reading deviceEnabled');
    return true;
  }

  get alarmMask() {
    this._logger('log', '[BasicBoundCluster] Reading alarmMask');
    return 0;
  }

  get disableLocalConfig() {
    this._logger('log', '[BasicBoundCluster] Reading disableLocalConfig');
    return 0;
  }
}

module.exports = BasicBoundCluster;
