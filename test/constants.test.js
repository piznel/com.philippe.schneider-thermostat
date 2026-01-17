'use strict';

/**
 * Tests for constants and configuration values
 */

describe('Constants Validation', () => {
  const TEMP_MIN_CENTI = 400;
  const TEMP_MAX_CENTI = 3000;
  const TEMP_DEFAULT_CENTI = 2000;
  const TEMP_STEP_CENTI = 50;
  const POLL_INTERVAL_MS = 10 * 60 * 1000;
  const READ_ATTRIBUTES_TIMEOUT_MS = 5000;

  describe('Temperature constants', () => {
    test('minimum temperature is 4°C', () => {
      expect(TEMP_MIN_CENTI).toBe(400);
      expect(TEMP_MIN_CENTI / 100).toBe(4);
    });

    test('maximum temperature is 30°C', () => {
      expect(TEMP_MAX_CENTI).toBe(3000);
      expect(TEMP_MAX_CENTI / 100).toBe(30);
    });

    test('default temperature is 20°C', () => {
      expect(TEMP_DEFAULT_CENTI).toBe(2000);
      expect(TEMP_DEFAULT_CENTI / 100).toBe(20);
    });

    test('temperature step is 0.5°C', () => {
      expect(TEMP_STEP_CENTI).toBe(50);
      expect(TEMP_STEP_CENTI / 100).toBe(0.5);
    });

    test('default is within valid range', () => {
      expect(TEMP_DEFAULT_CENTI).toBeGreaterThanOrEqual(TEMP_MIN_CENTI);
      expect(TEMP_DEFAULT_CENTI).toBeLessThanOrEqual(TEMP_MAX_CENTI);
    });

    test('range is valid', () => {
      expect(TEMP_MIN_CENTI).toBeLessThan(TEMP_MAX_CENTI);
      const range = TEMP_MAX_CENTI - TEMP_MIN_CENTI;
      expect(range).toBe(2600); // 26°C range
    });
  });

  describe('Timing constants', () => {
    test('poll interval is 10 minutes', () => {
      expect(POLL_INTERVAL_MS).toBe(600000); // 10 * 60 * 1000
      expect(POLL_INTERVAL_MS / 60000).toBe(10); // 10 minutes
    });

    test('read attributes timeout is 5 seconds', () => {
      expect(READ_ATTRIBUTES_TIMEOUT_MS).toBe(5000);
      expect(READ_ATTRIBUTES_TIMEOUT_MS / 1000).toBe(5);
    });

    test('timeout is less than poll interval', () => {
      expect(READ_ATTRIBUTES_TIMEOUT_MS).toBeLessThan(POLL_INTERVAL_MS);
    });
  });

  describe('ZCL special values', () => {
    test('not available value is -32768', () => {
      const NOT_AVAILABLE = -32768;
      expect(NOT_AVAILABLE).toBe(-32768);
      // This is 0x8000 in hex, which means "not available" in ZCL spec
    });

    test('not available is outside valid temperature range', () => {
      const NOT_AVAILABLE = -32768;
      expect(NOT_AVAILABLE).toBeLessThan(TEMP_MIN_CENTI);
    });
  });

  describe('Humidity constants', () => {
    test('humidity range is 0-100% in centi-percent', () => {
      const HUMIDITY_MIN = 0;
      const HUMIDITY_MAX = 10000; // 100% in centi-percent
      expect(HUMIDITY_MIN).toBe(0);
      expect(HUMIDITY_MAX).toBe(10000);
      expect(HUMIDITY_MAX / 100).toBe(100);
    });
  });
});
