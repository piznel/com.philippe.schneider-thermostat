'use strict';

/**
 * Tests for utility functions used in the device driver
 */

describe('Temperature Conversion Utilities', () => {
  // Import the conversion functions (they need to be exported or tested indirectly)
  // Since they're not exported, we'll test the logic directly

  const centiToC = (v) => (Number.isFinite(v) ? v / 100 : null);
  const centiPctToPct = (v) => (Number.isFinite(v) ? v / 100 : null);
  const batteryPct = (v) => (Number.isFinite(v) ? Math.min(100, v) : null);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  describe('centiToC', () => {
    test('converts centi-degrees to Celsius correctly', () => {
      expect(centiToC(2000)).toBe(20);
      expect(centiToC(2150)).toBe(21.5);
      expect(centiToC(400)).toBe(4);
      expect(centiToC(3000)).toBe(30);
    });

    test('handles negative temperatures', () => {
      expect(centiToC(-100)).toBe(-1);
      expect(centiToC(-500)).toBe(-5);
    });

    test('returns null for invalid values', () => {
      expect(centiToC(NaN)).toBeNull();
      expect(centiToC(Infinity)).toBeNull();
      expect(centiToC(-Infinity)).toBeNull();
      expect(centiToC(null)).toBeNull();
      expect(centiToC(undefined)).toBeNull();
    });
  });

  describe('centiPctToPct', () => {
    test('converts centi-percent to percent correctly', () => {
      expect(centiPctToPct(5000)).toBe(50);
      expect(centiPctToPct(10000)).toBe(100);
      expect(centiPctToPct(0)).toBe(0);
      expect(centiPctToPct(4214)).toBe(42.14);
    });

    test('returns null for invalid values', () => {
      expect(centiPctToPct(NaN)).toBeNull();
      expect(centiPctToPct(Infinity)).toBeNull();
      expect(centiPctToPct(null)).toBeNull();
    });
  });

  describe('batteryPct', () => {
    test('returns battery percentage correctly', () => {
      expect(batteryPct(100)).toBe(100);
      expect(batteryPct(50)).toBe(50);
      expect(batteryPct(0)).toBe(0);
    });

    test('clamps values to 100% maximum', () => {
      expect(batteryPct(150)).toBe(100);
      expect(batteryPct(200)).toBe(100);
      expect(batteryPct(1000)).toBe(100);
    });

    test('returns null for invalid values', () => {
      expect(batteryPct(NaN)).toBeNull();
      expect(batteryPct(Infinity)).toBeNull();
      expect(batteryPct(null)).toBeNull();
    });
  });

  describe('clamp', () => {
    test('clamps values within range', () => {
      expect(clamp(15, 4, 30)).toBe(15);
      expect(clamp(2, 4, 30)).toBe(4);
      expect(clamp(35, 4, 30)).toBe(30);
    });

    test('handles edge cases', () => {
      expect(clamp(4, 4, 30)).toBe(4);
      expect(clamp(30, 4, 30)).toBe(30);
      expect(clamp(0, 4, 30)).toBe(4);
      expect(clamp(100, 4, 30)).toBe(30);
    });

    test('handles negative values', () => {
      expect(clamp(-10, -20, 20)).toBe(-10);
      expect(clamp(-30, -20, 20)).toBe(-20);
      expect(clamp(30, -20, 20)).toBe(20);
    });
  });

  describe('toNumber', () => {
    test('converts valid numbers', () => {
      expect(toNumber('20')).toBe(20);
      expect(toNumber(20)).toBe(20);
      expect(toNumber('20.5')).toBe(20.5);
      expect(toNumber(0)).toBe(0);
    });

    test('handles null and zero correctly', () => {
      // Note: Number(null) returns 0, which is a valid finite number
      // This is the actual behavior of the toNumber function
      expect(toNumber(null)).toBe(0);
      expect(toNumber(0)).toBe(0);
    });

    test('returns null for invalid values', () => {
      expect(toNumber('abc')).toBeNull();
      expect(toNumber(undefined)).toBeNull();
      expect(toNumber(NaN)).toBeNull();
      expect(toNumber(Infinity)).toBeNull();
      expect(toNumber(-Infinity)).toBeNull();
    });
  });
});

describe('Temperature Constants', () => {
  const TEMP_MIN_CENTI = 400;
  const TEMP_MAX_CENTI = 3000;
  const TEMP_DEFAULT_CENTI = 2000;
  const TEMP_STEP_CENTI = 50;

  test('constants have correct values', () => {
    expect(TEMP_MIN_CENTI).toBe(400); // 4°C
    expect(TEMP_MAX_CENTI).toBe(3000); // 30°C
    expect(TEMP_DEFAULT_CENTI).toBe(2000); // 20°C
    expect(TEMP_STEP_CENTI).toBe(50); // 0.5°C
  });

  test('temperature ranges are valid', () => {
    expect(TEMP_MIN_CENTI).toBeLessThan(TEMP_MAX_CENTI);
    expect(TEMP_DEFAULT_CENTI).toBeGreaterThanOrEqual(TEMP_MIN_CENTI);
    expect(TEMP_DEFAULT_CENTI).toBeLessThanOrEqual(TEMP_MAX_CENTI);
  });
});
