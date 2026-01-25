# Schneider Thermostat (CCTFR6400) - Homey App

Homey app for the Schneider Electric CCTFR6400 Zigbee thermostat (also known as Wiser Room Thermostat).

[![Homey SDK](https://img.shields.io/badge/Homey%20SDK-3-blue.svg)](https://apps.athom.com/)
[![Version](https://img.shields.io/badge/version-0.0.2-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

- **Bidirectional communication** via Zigbee binding
- **Temperature monitoring** (from thermostat sensor)
- **Humidity monitoring**
- **Battery level** tracking
- **Target temperature control** (4-30°C)
- **Thermostat mode** (Heat/Off) - controls the flame icon on the thermostat
- **Button press detection** - syncs setpoint when user adjusts on device
- **Screen wake/sleep tracking**
- **Anti-drift polling** every 10 minutes
- **Automatic synchronization** of setpoint changes from device to Homey

## How it works

### Homey → Thermostat
The thermostat reads the setpoint from Homey via Zigbee binding. It periodically polls the `occupiedHeatingSetpoint` attribute.

### Thermostat → Homey
The thermostat sends UI events via the proprietary **wiserDeviceInfo** cluster (0xFE03 / 65027):
- Button presses (+, -, center)
- Screen wake/sleep events
- ENV data (setpoint, temperature, humidity)

## Supported devices

| Model | Description |
|-------|-------------|
| CCTFR6400 | Schneider Electric / Wiser Room Thermostat |

## Installation

### Prerequisites
- Homey with firmware >= 12.2.0
- Zigbee dongle (built-in or USB)
- Schneider CCTFR6400 thermostat

### From Homey App Store
1. Open the Homey app
2. Go to Settings → Apps
3. Search for "Schneider Thermostat"
4. Install the app

### From source (development)
```bash
git clone https://github.com/piznel/com.philippe.schneider-thermostat.git
cd com.philippe.schneider-thermostat
npm install
npx homey app run
```

### Pairing
1. Remove the batteries from the thermostat
2. Reinsert the batteries
3. When the "Wiser" startup screen appears, press and hold the **+** and **-** buttons simultaneously for 20 seconds
4. The thermostat will restart and enter pairing mode
5. Add the device in Homey using the app's pairing flow

**Note**: The thermostat must be within range of your Homey's Zigbee network (typically 10-20 meters indoors).

## Configuration

### Capabilities

The app exposes the following capabilities:

| Capability | Type | Range | Description |
|------------|------|-------|-------------|
| `measure_temperature` | Number | -40 to 125°C | Current room temperature |
| `measure_humidity` | Number | 0-100% | Current room humidity |
| `measure_battery` | Number | 0-100% | Battery level |
| `target_temperature` | Number | 4-30°C | Desired temperature setpoint |
| `thermostat_mode` | Enum | Heat/Off | Thermostat mode (controls flame icon) |

### Debug Mode

To enable verbose debug logging, set the environment variable:
```bash
export HOMEY_DEBUG=true
npx homey app run
```

This will log all Zigbee cluster events and raw frames for troubleshooting.

## Usage

### Setting Target Temperature

You can set the target temperature in several ways:
- Via the Homey app (slider or input)
- Via Homey flows (set capability action)
- Via the thermostat buttons (automatically synced to Homey)

### Thermostat Mode

The `thermostat_mode` capability controls the flame icon on the thermostat display:
- **"Off"**: Flame icon off (no heating needed)
- **"Heat"**: Full flame (heating mode active)

This is useful for visual feedback in Homey flows or automation rules.

### Button Press Synchronization

When you adjust the temperature using the thermostat's **+** or **-** buttons, the change is automatically detected and synced to Homey within a few seconds.

**Note**: The first button press after the screen sleeps only wakes the screen and does not change the temperature.

## Known limitations

### Boost mode
When the user presses the center button, the thermostat enters Boost mode locally. However, **the thermostat does not report its Boost temperature**, so Homey cannot sync it. The Boost will be overwritten by Homey's setpoint on the next poll (within 10 minutes).

### No OTA firmware updates
Firmware updates require the official Wiser Hub or Zigbee2MQTT with extracted firmware files. Homey does not support OTA updates for this device.

### Battery life
The thermostat uses 2x AAA batteries. Battery life depends on usage but typically lasts 1-2 years. The battery level is reported to Homey and can be monitored in flows.

## Zigbee clusters

| Cluster | ID | Usage |
|---------|-----|-------|
| Basic | 0x0000 (0) | Hub connectivity verification |
| Thermostat | 0x0201 (513) | Setpoint binding, mode control |
| Temperature Measurement | 0x0402 (1026) | Temperature reading |
| Relative Humidity | 0x0405 (1029) | Humidity reading |
| Power Configuration | 0x0001 (1) | Battery level |
| wiserDeviceInfo | 0xFE03 (65027) | UI events, ENV data |

## Troubleshooting

### Device won't pair
- Ensure the thermostat is in pairing mode (see Pairing section)
- Check that the thermostat is within range (try moving it closer to Homey)
- Remove and reinsert batteries to reset the device
- Check Homey's Zigbee network status in Settings

### Setpoint not syncing
- Wait a few seconds - the thermostat polls Homey periodically
- Check the device logs in Homey Settings → System → Logs
- Ensure the device is online (green status in Homey app)
- Try setting the temperature from Homey first, then from the device

### Temperature readings incorrect
- The thermostat sensor may need calibration (not supported in this app)
- Ensure the thermostat is not in direct sunlight or near heat sources
- Check that the device firmware is up to date (via Wiser Hub if available)

### Device goes offline
- Check battery level (replace if below 20%)
- Move the device closer to Homey or add a Zigbee router/repeater
- Check for interference from other 2.4GHz devices (WiFi, Bluetooth)
- Try removing and re-adding the device

## Development

### Setup
```bash
npm install
```

### Running
```bash
npx homey app run        # Run in development mode
```

### Testing
```bash
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Building
```bash
npx homey app validate   # Validate the app
npx homey app build      # Build the app for distribution
```

### Code Quality
```bash
npm run lint             # Run linter (if configured)
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Schneider Electric for the CCTFR6400 thermostat
- [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/CCTFR6400.html) documentation for cluster information
- Homey community for Zigbee driver examples

## Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/piznel/com.philippe.schneider-thermostat/issues)
- **Discussions**: Join the [Homey Community Forum](https://community.athom.com/)
- **Email**: philippe@gmail.com

## Acknowledgments

Special thanks to the Homey community for their support and the Zigbee2MQTT project for their excellent device documentation.
