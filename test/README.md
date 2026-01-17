# Tests

This directory contains unit tests for the Schneider Thermostat Homey app.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

- `utils.test.js` - Tests for utility functions (temperature conversions, clamping, etc.)
- `device-validation.test.js` - Tests for data validation logic (ENV data, setpoint validation)
- `setpoint-calculation.test.js` - Tests for setpoint calculation logic (button presses, steps)
- `constants.test.js` - Tests for constants and configuration values

## Test Coverage

The test suite covers:
- ✅ Temperature conversion utilities
- ✅ Data validation (ENV messages, setpoints)
- ✅ Setpoint calculations and clamping
- ✅ Constants and configuration values
- ✅ Edge cases and error handling

## Adding New Tests

When adding new functionality:
1. Create a new test file in this directory
2. Follow the existing test structure
3. Use descriptive test names
4. Test both success and error cases
5. Run `npm test` to ensure all tests pass

## Notes

- Tests use Jest as the test framework
- Tests run in Node.js environment (not Homey environment)
- Some Homey-specific functionality may require mocking
- Coverage reports are generated in the `coverage/` directory
