import { describe, it, expect } from 'vitest';
import { calculateBollingerBands, OHLCVCandle } from '@/lib/indicators';

describe('Bollinger Bands', () => {
  it('calculates middle, upper, and lower bands correctly using population std dev', () => {
    const candles: OHLCVCandle[] = Array.from({ length: 30 }, (_, i) => ({
      time: 1700000000 + i * 86400,
      open: 100 + i,
      high: 105 + i,
      low: 95 + i,
      close: 100 + i,
      volume: 10000,
    }));

    const bb = calculateBollingerBands(candles, 20, 2);

    expect(bb[18]).toBeUndefined();
    expect(bb[19]).toBeDefined();

    const val = bb[19]!;
    expect(val.middle).toBeGreaterThan(0);
    expect(val.upper).toBeGreaterThan(val.middle);
    expect(val.lower).toBeLessThan(val.middle);
    expect(val.upper - val.middle).toBeCloseTo(val.middle - val.lower, 1);
  });
});
