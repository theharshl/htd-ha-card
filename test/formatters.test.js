import { describe, it, expect } from 'vitest';
import { levelToVol, volToLevel, formatVolume, formatEq, sliderPercent } from '../src/formatters.js';

describe('levelToVol', () => {
  it('converts HA volume_level (0.0-1.0) to HTD volume (0-60)', () => {
    expect(levelToVol(0)).toBe(0);
    expect(levelToVol(1)).toBe(60);
    expect(levelToVol(0.5)).toBe(30);
    expect(levelToVol(0.533333)).toBe(32);
  });

  it('handles null/undefined by returning 0', () => {
    expect(levelToVol(null)).toBe(0);
    expect(levelToVol(undefined)).toBe(0);
  });
});

describe('volToLevel', () => {
  it('converts HTD volume (0-60) to HA volume_level (0.0-1.0)', () => {
    expect(volToLevel(0)).toBe(0);
    expect(volToLevel(60)).toBe(1);
    expect(volToLevel(30)).toBeCloseTo(0.5);
  });
});

describe('formatVolume', () => {
  it('returns integer string', () => {
    expect(formatVolume(32)).toBe('32');
    expect(formatVolume(0)).toBe('0');
  });
});

describe('formatEq', () => {
  it('prefixes positive values with +', () => {
    expect(formatEq(3)).toBe('+3');
    expect(formatEq(12)).toBe('+12');
  });

  it('returns plain string for negative values', () => {
    expect(formatEq(-1)).toBe('-1');
    expect(formatEq(-12)).toBe('-12');
  });

  it('returns "0" for zero', () => {
    expect(formatEq(0)).toBe('0');
  });

  it('handles string input from HA number entity state', () => {
    expect(formatEq('3')).toBe('+3');
    expect(formatEq('-5')).toBe('-5');
  });
});

describe('sliderPercent', () => {
  it('returns percent position for volume (0-60)', () => {
    expect(sliderPercent(0, 0, 60)).toBe(0);
    expect(sliderPercent(60, 0, 60)).toBe(100);
    expect(sliderPercent(30, 0, 60)).toBe(50);
  });

  it('returns percent position for EQ (-12 to +12)', () => {
    expect(sliderPercent(-12, -12, 12)).toBe(0);
    expect(sliderPercent(12, -12, 12)).toBe(100);
    expect(sliderPercent(0, -12, 12)).toBe(50);
  });

  it('returns 0 when min equals max', () => {
    expect(sliderPercent(5, 5, 5)).toBe(0);
  });
});
