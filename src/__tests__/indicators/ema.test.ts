import { describe, it, expect } from 'vitest';
import { calculateEMA } from '@/lib/indicators';

describe('Exponential Moving Average (EMA)', () => {
  it('calculates initial EMA from SMA', () => {
    const prices = [100, 102, 104, 103, 105];
    const ema5 = calculateEMA(prices, 5);

    // Initial EMA is SMA of first 5 items: (100+102+104+103+105)/5 = 102.8
    expect(ema5[0]).toBeUndefined();
    expect(ema5[3]).toBeUndefined();
    expect(ema5[4]).toBeCloseTo(102.8, 1);
  });

  it('verifies recursive formula against Appendix B2 benchmark', () => {
    const prices = [100, 102, 104, 103, 105, 107, 106, 108, 110, 109];
    const ema5 = calculateEMA(prices, 5);

    // Multiplier k = 2 / (5 + 1) = 0.3333333333
    // EMA at index 4 = 102.8
    // EMA at index 5 = 107 * (1/3) + 102.8 * (2/3) = 35.66667 + 68.53333 = 104.20
    expect(ema5[4]).toBeCloseTo(102.8, 1);
    expect(ema5[5]).toBeCloseTo(104.2, 1);
  });

  it('returns empty array when prices length < period', () => {
    const prices = [10, 20];
    const ema5 = calculateEMA(prices, 5);
    expect(ema5[0]).toBeUndefined();
    expect(ema5[1]).toBeUndefined();
  });
});
