# Schneider Thermostat (CCTFR6400) - Homey App

Homey app for the Schneider Electric CCTFR6400 Zigbee thermostat (also known as Wiser Room Thermostat).

## Features

- **Bidirectional communication** via Zigbee binding
- **Temperature monitoring** (from thermostat sensor)
- **Humidity monitoring**
- **Battery level** tracking
- **Target temperature control** (4-30°C)
- **Heating demand** slider (0-100%) - controls the flame icon on the thermostat
- **Button press detection** - syncs setpoint when user adjusts on device
- **Screen wake/sleep tracking**
- **Anti-drift polling** every 10 minutes

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

### From source (development)
```bash
git clone https://github.com/your-username/com.philippe.schneider-thermostat.git
cd com.philippe.schneider-thermostat
npm install
npx homey app run
```

### Pairing
1. Remove the batteries from the thermostat
2. Reinsert the batteries
3. When the "Wiser" startup screen appears, press and hold the **+** and **-** buttons simultaneously for 20 seconds
4. The thermostat will restart and enter pairing mode
5. Add the device in Homey

## Known limitations

### Boost mode
When the user presses the center button, the thermostat enters Boost mode locally. However, **the thermostat does not report its Boost temperature**, so Homey cannot sync it. The Boost will be overwritten by Homey's setpoint on the next poll.

### No OTA firmware updates
Firmware updates require the official Wiser Hub or Zigbee2MQTT with extracted firmware files. Homey does not support OTA updates for this device.

## Zigbee clusters

| Cluster | ID | Usage |
|---------|-----|-------|
| Thermostat | 0x0201 (513) | Setpoint binding |
| Temperature Measurement | 0x0402 (1026) | Temperature reading |
| Relative Humidity | 0x0405 (1029) | Humidity reading |
| Power Configuration | 0x0001 (1) | Battery level |
| wiserDeviceInfo | 0xFE03 (65027) | UI events, ENV data |

## Development

```bash
npx homey app run        # Run in development mode
npx homey app validate   # Validate the app
npx homey app build      # Build the app
```

## License

MIT

## Credits

- Schneider Electric for the CCTFR6400 thermostat
- [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/CCTFR6400.html) documentation for cluster information
- Homey community for Zigbee driver examples
