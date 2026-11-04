/**
 * Technical Indicator Calculation Library
 * Implemented from scratch according to mathematical specifications
 * (Zero external indicator dependencies)
 */

export interface OHLCVCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerResult {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface RSIResult {
  time: number;
  value: number;
}

export interface VolumeProfileBucket {
  priceLower: number;
  priceUpper: number;
  priceCenter: number;
  volume: number;
  percentage: number;
}

/**
 * 1. Simple Moving Average (SMA)
 * SMA(n, t) = (1/n) * sum(i=0..n-1) Close(t-i)
 * Undefined for index < n - 1
 */
export function calculateSMA(prices: number[], period: number): (number | undefined)[] {
  if (period <= 0) throw new Error('Period must be greater than 0');
  const result: (number | undefined)[] = new Array(prices.length).fill(undefined);

  let sum = 0;
  for (let i = 0; i < prices.length; i++) {
    sum += prices[i];
    if (i >= period) {
      sum -= prices[i - period];
    }
    if (i >= period - 1) {
      result[i] = Math.round((sum / period) * 10000) / 10000;
    }
  }

  return result;
}

/**
 * 2. Exponential Moving Average (EMA)
 * Multiplier: k = 2 / (period + 1)
 * Initial EMA at index (period - 1) = SMA(period)
 * Recursive: EMA(t) = Close(t) * k + EMA(t-1) * (1 - k)
 */
export function calculateEMA(prices: number[], period: number): (number | undefined)[] {
  if (period <= 0) throw new Error('Period must be greater than 0');
  const result: (number | undefined)[] = new Array(prices.length).fill(undefined);
  if (prices.length < period) return result;

  const k = 2 / (period + 1);

  // Initial EMA is SMA of first 'period' values
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += prices[i];
  }
  let prevEma = initialSum / period;
  result[period - 1] = Math.round(prevEma * 10000) / 10000;

  for (let i = period; i < prices.length; i++) {
    const currentEma = prices[i] * k + prevEma * (1 - k);
    result[i] = Math.round(currentEma * 10000) / 10000;
    prevEma = currentEma;
  }

  return result;
}

/**
 * 3. Bollinger Bands
 * Middle Band = SMA(20)
 * Standard Deviation = sqrt( (1/n) * sum(Close - SMA)^2 ) (Population standard deviation)
 * Upper = Middle + 2 * stdDev
 * Lower = Middle - 2 * stdDev
 */
export function calculateBollingerBands(
  candles: OHLCVCandle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): (BollingerResult | undefined)[] {
  const result: (BollingerResult | undefined)[] = new Array(candles.length).fill(undefined);
  const closes = candles.map((c) => c.close);
  const smaValues = calculateSMA(closes, period);

  for (let i = period - 1; i < candles.length; i++) {
    const mb = smaValues[i];
    if (mb === undefined) continue;

    // Population standard deviation over the last 'period' candles
    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      const diff = candles[i - j].close - mb;
      varianceSum += diff * diff;
    }
    const stdDev = Math.sqrt(varianceSum / period);

    result[i] = {
      time: candles[i].time,
      middle: Math.round(mb * 100) / 100,
      upper: Math.round((mb + stdDevMultiplier * stdDev) * 100) / 100,
      lower: Math.round((mb - stdDevMultiplier * stdDev) * 100) / 100,
    };
  }

  return result;
}

/**
 * 4. Relative Strength Index (RSI - Wilder's Smoothed)
 * Default period: 14
 * Handled edge cases: AvgLoss == 0 => RSI 100, AvgGain == 0 => RSI 0
 */
export function calculateRSI(candles: OHLCVCandle[], period: number = 14): (RSIResult | undefined)[] {
  const result: (RSIResult | undefined)[] = new Array(candles.length).fill(undefined);
  if (candles.length <= period) return result;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    gains.push(Math.max(change, 0));
    losses.push(Math.max(-change, 0));
  }

  // Initial average using simple mean of first 'period' changes
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  let rsi: number;
  if (avgLoss === 0) {
    rsi = 100;
  } else if (avgGain === 0) {
    rsi = 0;
  } else {
    const rs = avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);
  }
  result[period] = { time: candles[period].time, value: Math.round(rsi * 100) / 100 };

  // Subsequent values using Wilder's smoothing
  for (let i = period + 1; i < candles.length; i++) {
    const currentGain = gains[i - 1];
    const currentLoss = losses[i - 1];

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      rsi = 100;
    } else if (avgGain === 0) {
      rsi = 0;
    } else {
      const rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
    }

    result[i] = { time: candles[i].time, value: Math.round(rsi * 100) / 100 };
  }

  return result;
}

/**
 * 5. Volume Profile
 * Aggregates volume into price buckets over visible candle range
 */
export function calculateVolumeProfile(
  candles: OHLCVCandle[],
  numBuckets: number = 40
): VolumeProfileBucket[] {
  if (candles.length === 0) return [];

  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let totalVolume = 0;

  for (const c of candles) {
    if (c.low < minPrice) minPrice = c.low;
    if (c.high > maxPrice) maxPrice = c.high;
    totalVolume += c.volume;
  }

  if (minPrice === maxPrice || totalVolume === 0) return [];

  const priceSpan = maxPrice - minPrice;
  const bucketSize = priceSpan / numBuckets;

  const buckets: VolumeProfileBucket[] = Array.from({ length: numBuckets }, (_, i) => {
    const lower = minPrice + i * bucketSize;
    const upper = lower + bucketSize;
    return {
      priceLower: Math.round(lower * 100) / 100,
      priceUpper: Math.round(upper * 100) / 100,
      priceCenter: Math.round(((lower + upper) / 2) * 100) / 100,
      volume: 0,
      percentage: 0,
    };
  });

  // Distribute each candle's volume across intersected price buckets
  for (const c of candles) {
    const candleSpan = Math.max(c.high - c.low, bucketSize * 0.1);

    for (let b = 0; b < numBuckets; b++) {
      const bucket = buckets[b];
      // Overlap between candle [low, high] and bucket [lower, upper]
      const overlapMin = Math.max(c.low, bucket.priceLower);
      const overlapMax = Math.min(c.high, bucket.priceUpper);

      if (overlapMax > overlapMin) {
        const fraction = (overlapMax - overlapMin) / candleSpan;
        bucket.volume += c.volume * fraction;
      }
    }
  }

  // Compute percentage of max volume for visualization
  let maxBucketVolume = 0;
  for (const b of buckets) {
    if (b.volume > maxBucketVolume) maxBucketVolume = b.volume;
  }

  for (const b of buckets) {
    b.percentage = maxBucketVolume > 0 ? (b.volume / maxBucketVolume) * 100 : 0;
    b.volume = Math.round(b.volume);
  }

  return buckets;
}
