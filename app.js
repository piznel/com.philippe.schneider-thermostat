'use strict';

const Homey = require('homey');

class SchneiderThermostatApp extends Homey.App {
  async onInit() {
    this.log('Schneider Thermostat app init');
  }
}

module.exports = SchneiderThermostatApp;
