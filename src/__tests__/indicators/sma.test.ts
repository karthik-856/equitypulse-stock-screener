import { describe, it, expect } from 'vitest';
import { calculateSMA } from '@/lib/indicators';

describe('Simple Moving Average (SMA)', () => {
  it('calculates SMA correctly for a basic dataset', () => {
    const prices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    const sma5 = calculateSMA(prices, 5);

    expect(sma5[4]).toBeCloseTo(14); // (10+12+14+16+18)/5 = 70/5 = 14
    expect(sma5[9]).toBeCloseTo(24); // (20+22+24+26+28)/5 = 120/5 = 24
  });

  it('returns undefined for periods with insufficient data', () => {
    const prices = [10, 12, 14];
    const sma5 = calculateSMA(prices, 5);

    expect(sma5[0]).toBeUndefined();
    expect(sma5[1]).toBeUndefined();
    expect(sma5[2]).toBeUndefined();
  });

  it('handles single-element period', () => {
    const prices = [42, 43, 44];
    const sma1 = calculateSMA(prices, 1);

    expect(sma1[0]).toBe(42);
    expect(sma1[1]).toBe(43);
    expect(sma1[2]).toBe(44);
  });

  it('matches PDF verification data', () => {
    const prices = [100, 102, 104, 103, 105, 107, 106, 108, 110, 109];
    const sma5 = calculateSMA(prices, 5);

    // Expected starting from index 4: [102.8, 104.2, 105.0, 105.8, 107.2, 108.0]
    expect(sma5[4]).toBeCloseTo(102.8, 1);
    expect(sma5[5]).toBeCloseTo(104.2, 1);
    expect(sma5[6]).toBeCloseTo(105.0, 1);
    expect(sma5[7]).toBeCloseTo(105.8, 1);
    expect(sma5[8]).toBeCloseTo(107.2, 1);
    expect(sma5[9]).toBeCloseTo(108.0, 1);
  });
});
