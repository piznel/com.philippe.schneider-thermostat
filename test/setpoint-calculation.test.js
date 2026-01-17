'use strict';

/**
 * Tests for setpoint calculation logic (button presses, steps, etc.)
 */

describe('Setpoint Calculations', () => {
  const TEMP_MIN_CENTI = 400;
  const TEMP_MAX_CENTI = 3000;
  const TEMP_STEP_CENTI = 50; // 0.5°C

  describe('Button press calculations', () => {
    test('increases setpoint by step (plus button)', () => {
      const current = 2000; // 20°C
      const newSetpoint = Math.min(current + TEMP_STEP_CENTI, TEMP_MAX_CENTI);
      expect(newSetpoint).toBe(2050); // 20.5°C
    });

    test('decreases setpoint by step (minus button)', () => {
      const current = 2000; // 20°C
      const newSetpoint = Math.max(current - TEMP_STEP_CENTI, TEMP_MIN_CENTI);
      expect(newSetpoint).toBe(1950); // 19.5°C
    });

    test('respects minimum limit', () => {
      const current = 400; // 4°C (minimum)
      const newSetpoint = Math.max(current - TEMP_STEP_CENTI, TEMP_MIN_CENTI);
      expect(newSetpoint).toBe(400); // Should not go below minimum
    });

    test('respects maximum limit', () => {
      const current = 3000; // 30°C (maximum)
      const newSetpoint = Math.min(current + TEMP_STEP_CENTI, TEMP_MAX_CENTI);
      expect(newSetpoint).toBe(3000); // Should not go above maximum
    });

    test('handles multiple steps', () => {
      let current = 2000; // 20°C
      current = Math.min(current + TEMP_STEP_CENTI, TEMP_MAX_CENTI); // +0.5
      expect(current).toBe(2050);
      current = Math.min(current + TEMP_STEP_CENTI, TEMP_MAX_CENTI); // +0.5
      expect(current).toBe(2100);
      current = Math.min(current + TEMP_STEP_CENTI, TEMP_MAX_CENTI); // +0.5
      expect(current).toBe(2150);
    });
  });

  describe('Temperature conversion', () => {
    test('converts centi-degrees to Celsius for display', () => {
      expect(2000 / 100).toBe(20);
      expect(2050 / 100).toBe(20.5);
      expect(1950 / 100).toBe(19.5);
    });

    test('converts Celsius to centi-degrees for storage', () => {
      expect(Math.round(20 * 100)).toBe(2000);
      expect(Math.round(20.5 * 100)).toBe(2050);
      expect(Math.round(19.5 * 100)).toBe(1950);
    });
  });

  describe('Setpoint clamping', () => {
    function clampSetpoint(value) {
      return Math.max(TEMP_MIN_CENTI, Math.min(TEMP_MAX_CENTI, value));
    }

    test('clamps values within range', () => {
      expect(clampSetpoint(2000)).toBe(2000);
      expect(clampSetpoint(400)).toBe(400);
      expect(clampSetpoint(3000)).toBe(3000);
    });

    test('clamps values below minimum', () => {
      expect(clampSetpoint(300)).toBe(400);
      expect(clampSetpoint(0)).toBe(400);
      expect(clampSetpoint(-100)).toBe(400);
    });

    test('clamps values above maximum', () => {
      expect(clampSetpoint(3500)).toBe(3000);
      expect(clampSetpoint(5000)).toBe(3000);
    });
  });

  describe('Setpoint synchronization logic', () => {
    test('detects setpoint changes', () => {
      const homeySetpoint = 2000;
      const envSetpoint = 2050;
      const hasChanged = envSetpoint !== homeySetpoint;
      expect(hasChanged).toBe(true);
    });

    test('detects no setpoint change', () => {
      const homeySetpoint = 2000;
      const envSetpoint = 2000;
      const hasChanged = envSetpoint !== homeySetpoint;
      expect(hasChanged).toBe(false);
    });

    test('validates setpoint before syncing', () => {
      const setpoint = 2000;
      const isValid = Number.isInteger(setpoint) &&
                     setpoint >= TEMP_MIN_CENTI &&
                     setpoint <= TEMP_MAX_CENTI;
      expect(isValid).toBe(true);
    });
  });
});
