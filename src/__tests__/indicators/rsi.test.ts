import { describe, it, expect } from 'vitest';
import { calculateRSI, OHLCVCandle } from '@/lib/indicators';

describe('Relative Strength Index (RSI)', () => {
  it('handles 100% gain edge case', () => {
    // Prices continuously rising -> AvgLoss == 0 => RSI should be 100
    const candles: OHLCVCandle[] = Array.from({ length: 20 }, (_, i) => ({
      time: 1700000000 + i * 86400,
      open: 100 + i * 2,
      high: 102 + i * 2,
      low: 99 + i * 2,
      close: 100 + (i + 1) * 2,
      volume: 5000,
    }));

    const rsi = calculateRSI(candles, 14);
    expect(rsi[14]?.value).toBe(100);
  });

  it('handles 100% loss edge case', () => {
    // Prices continuously falling -> AvgGain == 0 => RSI should be 0
    const candles: OHLCVCandle[] = Array.from({ length: 20 }, (_, i) => ({
      time: 1700000000 + i * 86400,
      open: 200 - i * 2,
      high: 201 - i * 2,
      low: 195 - i * 2,
      close: 200 - (i + 1) * 2,
      volume: 5000,
    }));

    const rsi = calculateRSI(candles, 14);
    expect(rsi[14]?.value).toBe(0);
  });

  it('calculates oscillating RSI within 0 to 100 boundary', () => {
    const candles: OHLCVCandle[] = Array.from({ length: 40 }, (_, i) => ({
      time: 1700000000 + i * 86400,
      open: 100 + Math.sin(i) * 10,
      high: 105 + Math.sin(i) * 10,
      low: 95 + Math.sin(i) * 10,
      close: 100 + Math.sin(i + 0.5) * 10,
      volume: 5000,
    }));

    const rsi = calculateRSI(candles, 14);
    for (let i = 14; i < rsi.length; i++) {
      const val = rsi[i]?.value;
      expect(val).toBeDefined();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });
});
