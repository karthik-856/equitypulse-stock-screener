import { Stock, PriceUpdate } from '@/types/stock';

function gaussianRandom(): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Geometric Brownian Motion model for realistic stock price movement:
 * dS = mu * S * dt + sigma * S * dW
 */
export function simulateNextPrice(
  currentPrice: number,
  volatility: number = 0.02,
  drift: number = 0.0001,
  dt: number = 1 / 252,
  customShock?: number
): number {
  const randomShock = customShock !== undefined ? customShock : Math.sqrt(dt) * gaussianRandom();
  const priceChange = drift * dt + volatility * randomShock;
  const newPrice = currentPrice * (1 + priceChange);
  return Math.round(Math.max(1, newPrice) * 100) / 100;
}

/**
 * Correlated sector movement simulation:
 * Stocks within the same sector share a common market shock + idiosyncratic noise
 */
export function simulateSectorMovement(
  stocks: Stock[],
  sectorCorrelation: number = 0.6
): Map<string, PriceUpdate> {
  const sectorShocks = new Map<string, number>();
  const updates = new Map<string, PriceUpdate>();

  for (const stock of stocks) {
    if (!sectorShocks.has(stock.sector)) {
      sectorShocks.set(stock.sector, gaussianRandom());
    }
    const sectorShock = sectorShocks.get(stock.sector)!;
    const idiosyncratic = gaussianRandom();

    // Standard correlated shock combination
    const combinedShock =
      (sectorCorrelation * sectorShock +
        Math.sqrt(Math.max(0, 1 - Math.pow(sectorCorrelation, 2))) * idiosyncratic) *
      Math.sqrt(1 / 252);

    const newPrice = simulateNextPrice(
      stock.lastPrice,
      (stock.beta * 0.02) / Math.sqrt(252),
      0.0001,
      1 / 252,
      combinedShock
    );

    const changeAbsolute = Math.round((newPrice - stock.previousClose) * 100) / 100;
    const changePercent =
      stock.previousClose !== 0
        ? Math.round(((newPrice - stock.previousClose) / stock.previousClose) * 10000) / 100
        : 0;

    const volumeDelta = Math.round(500 + Math.random() * 5000);

    updates.set(stock.symbol, {
      symbol: stock.symbol,
      lastPrice: newPrice,
      changePercent,
      changeAbsolute,
      volume: stock.volume + volumeDelta,
      high: Math.max(stock.dayHigh, newPrice),
      low: Math.min(stock.dayLow, newPrice),
      timestamp: Date.now(),
    });
  }

  return updates;
}
