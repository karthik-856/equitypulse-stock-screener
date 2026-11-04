import { OHLCVCandle } from './indicators';

function gaussianRandom(): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

export function generateOHLCV(
  startPrice: number,
  days: number = 252,
  volatility: number = 0.02,
  avgVolume: number = 1000000
): OHLCVCandle[] {
  const candles: OHLCVCandle[] = [];
  let currentPrice = Math.max(10, startPrice);

  const startDate = new Date();
  // Go back sufficient calendar days to cover the requested trading days
  const calendarDays = Math.ceil(days * 1.55);
  startDate.setDate(startDate.getDate() - calendarDays);

  const currentDate = new Date(startDate);
  const now = new Date();

  while (currentDate <= now && candles.length < days) {
    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dailyReturn = gaussianRandom() * volatility;
      const open = currentPrice;
      const intraday1 = open * (1 + gaussianRandom() * volatility * 0.5);
      const intraday2 = open * (1 + gaussianRandom() * volatility * 0.5);
      const close = Math.max(1, open * (1 + dailyReturn));

      const high = Math.max(open, close, intraday1, intraday2) * (1 + Math.abs(gaussianRandom()) * 0.005);
      const low = Math.max(0.5, Math.min(open, close, intraday1, intraday2) * (1 - Math.abs(gaussianRandom()) * 0.005));

      const volumeMultiplier = 1 + Math.abs(dailyReturn) * 10;
      const volume = Math.round(avgVolume * volumeMultiplier * (0.5 + Math.random()));

      candles.push({
        time: Math.floor(currentDate.getTime() / 1000),
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(close),
        volume,
      });

      currentPrice = close;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return candles;
}

export function aggregateOHLCV(
  candles: OHLCVCandle[],
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'
): OHLCVCandle[] {
  if (candles.length === 0 || timeframe === '1D') return candles;

  const grouped = new Map<string, OHLCVCandle[]>();

  for (const c of candles) {
    const d = new Date(c.time * 1000);
    let key: string;

    if (timeframe === '1W') {
      // Group by year and ISO week
      const year = d.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      key = `${year}-W${weekNumber}`;
    } else if (timeframe === '1M' || timeframe === '3M') {
      key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    } else {
      key = `${d.getFullYear()}`;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(c);
  }

  const result: OHLCVCandle[] = [];
  for (const [, bucketCandles] of grouped) {
    if (bucketCandles.length === 0) continue;
    const open = bucketCandles[0].open;
    const close = bucketCandles[bucketCandles.length - 1].close;
    let high = -Infinity;
    let low = Infinity;
    let volume = 0;

    for (const bc of bucketCandles) {
      if (bc.high > high) high = bc.high;
      if (bc.low < low) low = bc.low;
      volume += bc.volume;
    }

    result.push({
      time: bucketCandles[bucketCandles.length - 1].time,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return result;
}
