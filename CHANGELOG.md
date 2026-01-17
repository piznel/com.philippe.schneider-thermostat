# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 2024

### Added
- Basic cluster binding for hub connectivity verification
- Additional thermostat cluster attributes (occupiedCoolingSetpoint, absMinHeatSetpointLimit, etc.)
- Comprehensive test suite with unit tests
- Improved error handling throughout the codebase
- Timeout support for async operations
- Debug mode via environment variable (`HOMEY_DEBUG`)
- Better validation of ENV data from device
- `onUninit()` method for proper resource cleanup
- Support for `thermostat_mode` capability (replacing custom `heating_demand`)
- Homey Compose structure (`.homeycompose/app.json`)

### Changed
- Replaced magic numbers with named constants
- Improved error logging with context
- Enhanced data validation for ENV messages
- Better error handling in event listeners
- Switched from custom `heating_demand` capability to system `thermostat_mode` capability
- Updated project structure to use Homey Compose

### Fixed
- Fixed logging in BoundCluster (replaced `console.log` with Homey logger)
- Fixed error handling in capability initialization
- Fixed potential memory leaks with proper cleanup in `onUninit()`
- Fixed validation issues with ENV data parsing
- Fixed driver icon and images configuration
- Fixed Zigbee endpoints configuration in driver.compose.json

## [0.0.1] - 2024

### Added
- Initial release
- Support for Schneider CCTFR6400 thermostat
- Bidirectional communication via Zigbee binding
- Temperature and humidity monitoring
- Battery level tracking
- Target temperature control (4-30°C)
- Heating demand slider (0-100%)
- Button press detection and synchronization
- Screen wake/sleep tracking
- Anti-drift polling every 10 minutes
- Custom Zigbee clusters for Schneider-specific features

### Known Issues
- Boost mode temperature cannot be synced from device to Homey
- No OTA firmware update support
