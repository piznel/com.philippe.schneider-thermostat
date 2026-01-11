'use strict';

const { Cluster, ZCLDataTypes } = require('zigbee-clusters');

const SCHNEIDER_MANUFACTURER_ID = 0x105E; // 4190
const CLUSTER_ID = 0xFE03; // 65027

/**
 * Wiser Device Info Cluster (0xFE03 / 65027)
 * Used by Schneider/Drayton devices to report UI events like button presses
 *
 * The deviceInfo attribute contains comma-separated values like:
 * - "UI,ScreenWake" - Screen turned on
 * - "UI,ScreenSleep" - Screen turned off
 * - "UI,ButtonPressPlusDown" - Plus button pressed
 * - "UI,ButtonPressMinusDown" - Minus button pressed
 * - "UI,ButtonPressCenterDown" - Center button pressed
 * - "ENV,setpoint,temp,humidity" - Environment data (centi-units)
 * - "ALG,..." - Algorithm data
 * - "ADC,..." - ADC data
 */
class WiserDeviceInfoCluster extends Cluster {
  static get ID() {
    return CLUSTER_ID;
  }

  static get NAME() {
    return 'wiserDeviceInfo';
  }

  // Manufacturer-specific cluster
  static get MANUFACTURER_ID() {
    return SCHNEIDER_MANUFACTURER_ID;
  }

  static get ATTRIBUTES() {
    return {
      deviceInfo: {
        id: 32,
        type: ZCLDataTypes.string,
      },
    };
  }

  static get COMMANDS() {
    return {};
  }
}

// Register the custom cluster
Cluster.addCluster(WiserDeviceInfoCluster);

module.exports = WiserDeviceInfoCluster;
