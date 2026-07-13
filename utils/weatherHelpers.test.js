
import { describe, it, expect } from 'vitest';
import { formatTemperature } from './weatherHelpers.js';

describe('Weather Utility Tests', () => {

  // Test Case 1: Standard decimal temperatures
  it('should round standard decimal temperatures to the nearest whole integer', () => {
    expect(formatTemperature(14.64)).toBe(15);
    expect(formatTemperature(22.12)).toBe(22);
  });

  // Test Case 2: Negative values
  it('should handle freezing or negative temperatures correctly', () => {
    expect(formatTemperature(-2.5)).toBe(-2);
  });

  // Test Case 3: Resiliency check
  it('should return 0 safely if an invalid temperature value is encountered', () => {
    expect(formatTemperature(undefined)).toBe(0);
    expect(formatTemperature('hot')).toBe(0);
  });

});