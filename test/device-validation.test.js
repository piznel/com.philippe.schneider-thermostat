'use strict';

/**
 * Tests for device data validation logic
 */

describe('ENV Data Validation', () => {
  const TEMP_MIN_CENTI = 400;
  const TEMP_MAX_CENTI = 3000;

  // Simulate the validation logic from device.js
  function validateEnvData(deviceInfo) {
    if (!deviceInfo || typeof deviceInfo !== 'string') {
      return { valid: false, reason: 'Invalid deviceInfo type' };
    }

    const parts = deviceInfo.split(',');
    if (parts.length < 4) {
      return { valid: false, reason: 'Insufficient parts' };
    }

    const setpointCenti = parseInt(parts[1], 10);
    const tempCenti = parseInt(parts[2], 10);
    const humidityCenti = parseInt(parts[3], 10);

    const isValidSetpoint = Number.isInteger(setpointCenti) &&
                            setpointCenti >= TEMP_MIN_CENTI &&
                            setpointCenti <= TEMP_MAX_CENTI &&
                            setpointCenti !== -32768;

    const isValidTemp = Number.isInteger(tempCenti) && tempCenti !== -32768;
    const isValidHumidity = Number.isInteger(humidityCenti) &&
                            humidityCenti >= 0 &&
                            humidityCenti <= 10000;

    if (!isValidSetpoint || !isValidTemp || !isValidHumidity) {
      return {
        valid: false,
        reason: 'Validation failed',
        details: { setpointCenti, tempCenti, humidityCenti }
      };
    }

    return {
      valid: true,
      data: {
        setpointCenti,
        tempCenti,
        humidityCenti,
        setpoint: setpointCenti / 100,
        temp: tempCenti / 100,
        humidity: humidityCenti / 100
      }
    };
  }

  describe('Valid ENV data', () => {
    test('accepts valid ENV data with normal values', () => {
      const result = validateEnvData('ENV,2000,2150,5000');
      expect(result.valid).toBe(true);
      expect(result.data.setpoint).toBe(20);
      expect(result.data.temp).toBe(21.5);
      expect(result.data.humidity).toBe(50);
    });

    test('accepts valid ENV data at minimum setpoint', () => {
      const result = validateEnvData('ENV,400,2000,3000');
      expect(result.valid).toBe(true);
      expect(result.data.setpoint).toBe(4);
    });

    test('accepts valid ENV data at maximum setpoint', () => {
      const result = validateEnvData('ENV,3000,2500,8000');
      expect(result.valid).toBe(true);
      expect(result.data.setpoint).toBe(30);
    });

    test('accepts valid ENV data with edge humidity values', () => {
      expect(validateEnvData('ENV,2000,2000,0').valid).toBe(true);
      expect(validateEnvData('ENV,2000,2000,10000').valid).toBe(true);
    });
  });

  describe('Invalid ENV data', () => {
    test('rejects non-string input', () => {
      expect(validateEnvData(null).valid).toBe(false);
      expect(validateEnvData(undefined).valid).toBe(false);
      expect(validateEnvData(123).valid).toBe(false);
      expect(validateEnvData({}).valid).toBe(false);
    });

    test('rejects insufficient parts', () => {
      expect(validateEnvData('ENV').valid).toBe(false);
      expect(validateEnvData('ENV,2000').valid).toBe(false);
      expect(validateEnvData('ENV,2000,2150').valid).toBe(false);
    });

    test('rejects invalid setpoint (too low)', () => {
      const result = validateEnvData('ENV,300,2000,5000');
      expect(result.valid).toBe(false);
    });

    test('rejects invalid setpoint (too high)', () => {
      const result = validateEnvData('ENV,3500,2000,5000');
      expect(result.valid).toBe(false);
    });

    test('rejects setpoint with "not available" value', () => {
      const result = validateEnvData('ENV,-32768,2000,5000');
      expect(result.valid).toBe(false);
    });

    test('rejects invalid temperature (not available)', () => {
      const result = validateEnvData('ENV,2000,-32768,5000');
      expect(result.valid).toBe(false);
    });

    test('rejects invalid humidity (negative)', () => {
      const result = validateEnvData('ENV,2000,2000,-100');
      expect(result.valid).toBe(false);
    });

    test('rejects invalid humidity (too high)', () => {
      const result = validateEnvData('ENV,2000,2000,15000');
      expect(result.valid).toBe(false);
    });

    test('rejects non-numeric values', () => {
      expect(validateEnvData('ENV,abc,2000,5000').valid).toBe(false);
      expect(validateEnvData('ENV,2000,def,5000').valid).toBe(false);
      expect(validateEnvData('ENV,2000,2000,ghi').valid).toBe(false);
    });
  });
});

describe('UI Action Parsing', () => {
  function parseDeviceInfo(deviceInfo) {
    if (!deviceInfo || typeof deviceInfo !== 'string') {
      return null;
    }

    const parts = deviceInfo.split(',');
    return {
      dataType: parts[0],
      action: parts[1],
      parts: parts
    };
  }

  test('parses UI actions correctly', () => {
    expect(parseDeviceInfo('UI,ScreenWake')).toEqual({
      dataType: 'UI',
      action: 'ScreenWake',
      parts: ['UI', 'ScreenWake']
    });

    expect(parseDeviceInfo('UI,ButtonPressPlusDown')).toEqual({
      dataType: 'UI',
      action: 'ButtonPressPlusDown',
      parts: ['UI', 'ButtonPressPlusDown']
    });
  });

  test('parses ENV data correctly', () => {
    const result = parseDeviceInfo('ENV,2000,2150,5000');
    expect(result.dataType).toBe('ENV');
    expect(result.parts.length).toBe(4);
  });

  test('handles invalid input', () => {
    expect(parseDeviceInfo(null)).toBeNull();
    expect(parseDeviceInfo(undefined)).toBeNull();
    expect(parseDeviceInfo(123)).toBeNull();
  });
});

describe('Setpoint Validation', () => {
  const TEMP_MIN_CENTI = 400;
  const TEMP_MAX_CENTI = 3000;

  function validateSetpoint(centiValue) {
    if (!Number.isInteger(centiValue)) {
      return { valid: false, reason: 'Not an integer' };
    }
    if (centiValue < TEMP_MIN_CENTI || centiValue > TEMP_MAX_CENTI) {
      return { valid: false, reason: 'Out of range' };
    }
    return { valid: true, value: centiValue, celsius: centiValue / 100 };
  }

  test('validates setpoint in range', () => {
    expect(validateSetpoint(2000).valid).toBe(true);
    expect(validateSetpoint(400).valid).toBe(true);
    expect(validateSetpoint(3000).valid).toBe(true);
  });

  test('rejects setpoint out of range', () => {
    expect(validateSetpoint(300).valid).toBe(false);
    expect(validateSetpoint(3500).valid).toBe(false);
    expect(validateSetpoint(-100).valid).toBe(false);
  });

  test('rejects non-integer values', () => {
    expect(validateSetpoint(20.5).valid).toBe(false);
    expect(validateSetpoint(NaN).valid).toBe(false);
    expect(validateSetpoint(null).valid).toBe(false);
  });
});
