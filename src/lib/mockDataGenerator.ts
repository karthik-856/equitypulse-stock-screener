import { Stock, Sector, MarketCapCategory, MacdSignal, BollingerPosition, VolumeVsAvg } from '@/types/stock';
import { SECTOR_METADATA, INDICES } from './constants';

function gaussianRandom(): number {
  // Box-Muller transform for standard normal distribution
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

export function generateMockStocks(count: number = 5000): Stock[] {
  const stocks: Stock[] = [];
  const sectors = Object.keys(SECTOR_METADATA) as Sector[];

  // Allocation targets:
  // Large Cap: 2% (100)
  // Mid Cap: 8% (400)
  // Small Cap: 30% (1,500)
  // Micro Cap: 60% (3,000)
  const largeCapCount = Math.round(count * 0.02);
  const midCapCount = Math.round(count * 0.08);
  const smallCapCount = Math.round(count * 0.30);
  const microCapCount = count - largeCapCount - midCapCount - smallCapCount;

  let createdCount = 0;

  const generateSingleStock = (
    index: number,
    capCategory: MarketCapCategory,
    sector: Sector
  ): Stock => {
    const meta = SECTOR_METADATA[sector];
    const isNamedCompany = index < meta.companies.length;
    const baseName = isNamedCompany
      ? meta.companies[index]
      : `${sector.toUpperCase().slice(0, 4)} Corp ${index + 1}`;

    const symbol = isNamedCompany
      ? baseName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10)
      : `${sector.slice(0, 3).toUpperCase()}${index + 100}`;

    const industry = meta.industries[index % meta.industries.length];

    // 1. Market Cap (INR Cr)
    let marketCap = 0;
    if (capCategory === 'Large Cap') {
      marketCap = 50000 + Math.pow(Math.random(), 2) * 1950000;
    } else if (capCategory === 'Mid Cap') {
      marketCap = 10000 + Math.random() * 39999;
    } else if (capCategory === 'Small Cap') {
      marketCap = 1000 + Math.random() * 8999;
    } else {
      marketCap = 50 + Math.random() * 949;
    }
    marketCap = round2(marketCap);

    // 2. Beta (Negative correlation with market cap: Large cap 0.5-1.2, Micro cap 0.3-2.5)
    let beta = 0;
    if (capCategory === 'Large Cap') {
      beta = clamp(meta.avgBeta * (0.8 + 0.4 * Math.random()), 0.5, 1.2);
    } else if (capCategory === 'Mid Cap') {
      beta = clamp(meta.avgBeta * (0.85 + 0.5 * Math.random()), 0.7, 1.6);
    } else if (capCategory === 'Small Cap') {
      beta = clamp(meta.avgBeta * (0.9 + 0.7 * Math.random()), 0.8, 2.0);
    } else {
      beta = clamp(meta.avgBeta * (0.7 + 1.4 * Math.random()), 0.3, 2.5);
    }
    beta = round2(beta);

    // 3. Promoter Holding (%)
    let promoterHolding = 0;
    if (capCategory === 'Large Cap') {
      promoterHolding = clamp(40 + Math.random() * 35, 40, 75);
    } else {
      promoterHolding = clamp(20 + Math.random() * 70, 20, 90);
    }
    promoterHolding = round2(promoterHolding);

    // 4. Growth Ratios
    const revenueGrowthYoY = round2(clamp(gaussianRandom() * 20 + 12, -40, 350));
    const profitGrowthYoY = round2(clamp(revenueGrowthYoY * 1.2 + gaussianRandom() * 15, -60, 500));

    // 5. P/E Ratio (High growth -> higher P/E; slow/declining -> lower or null)
    let pe: number | null = null;
    if (profitGrowthYoY < -20 && Math.random() < 0.25) {
      pe = null; // Loss making
    } else {
      const growthFactor = Math.max(0, revenueGrowthYoY) * 0.4;
      const basePE = meta.avgPE + growthFactor + gaussianRandom() * 5;
      pe = round2(clamp(basePE, 6, 250));
    }

    const pb = round2(clamp(pe ? pe * 0.18 + Math.random() * 3 : 1.2 + Math.random() * 5, 0.5, 60));
    const dividendYield = round2(clamp(meta.avgDividendYield * (0.4 + Math.random() * 1.4), 0, 12));

    // 6. Return on Equity & ROCE
    const roe = round2(clamp(15 + gaussianRandom() * 8 + (pe ? pe * 0.1 : 0), -30, 85));
    const roce = round2(clamp(roe * 1.1 + gaussianRandom() * 4, -20, 95));

    // 7. Debt to Equity (Banking high: 5-15, IT/FMCG low: 0-0.5, Infra: 0.5-2.0)
    let debtToEquity = 0;
    if (sector === 'Banking') {
      debtToEquity = round2(5.0 + Math.random() * 9.5);
    } else if (sector === 'IT' || sector === 'FMCG') {
      debtToEquity = round2(Math.random() * 0.45);
    } else if (sector === 'Infrastructure' || sector === 'Realty') {
      debtToEquity = round2(0.5 + Math.random() * 1.5);
    } else {
      debtToEquity = round2(Math.random() * 1.8);
    }

    const currentRatio = round2(clamp(1.2 + gaussianRandom() * 0.6, 0.4, 8.5));

    // 8. Price & Technicals
    const lastPrice = round2(
      capCategory === 'Large Cap'
        ? 500 + Math.random() * 4500
        : capCategory === 'Mid Cap'
        ? 200 + Math.random() * 2500
        : 20 + Math.random() * 1200
    );

    const eps = pe && pe > 0 ? round2(lastPrice / pe) : round2(lastPrice * 0.04);

    // Day change with correlation to volume
    const dayChangePct = round2(clamp(gaussianRandom() * (beta * 1.2), -15, 18));
    const changeAbsolute = round2((lastPrice * dayChangePct) / 100);
    const previousClose = round2(lastPrice - changeAbsolute);
    const dayHigh = round2(Math.max(lastPrice, previousClose) * (1 + Math.random() * 0.015));
    const dayLow = round2(Math.min(lastPrice, previousClose) * (1 - Math.random() * 0.015));
    const dayOpen = round2(dayLow + Math.random() * (dayHigh - dayLow));

    // Volume correlated with price movement
    const baseVolume =
      capCategory === 'Large Cap'
        ? 3000000 + Math.random() * 15000000
        : capCategory === 'Mid Cap'
        ? 800000 + Math.random() * 5000000
        : 100000 + Math.random() * 1500000;

    const volumeImpact = 1 + Math.abs(dayChangePct) * 0.15;
    const volume = Math.round(baseVolume * volumeImpact);
    const avgVolume20D = Math.round(baseVolume);

    const week52High = round2(Math.max(dayHigh, lastPrice * (1 + Math.random() * 0.45)));
    const week52Low = round2(Math.min(dayLow, lastPrice * (1 - Math.random() * 0.35)));

    // RSI correlated with 5-day return
    const fiveDayReturn = dayChangePct + gaussianRandom() * 2;
    let rsi14 = round2(clamp(50 + fiveDayReturn * 2.5 + gaussianRandom() * 6, 12, 92));
    if (rsi14 === 50) rsi14 = 51.2; // Never exactly 50

    const sma50 = round2(lastPrice * (1 + gaussianRandom() * 0.04));
    const sma200 = round2(lastPrice * (1 + gaussianRandom() * 0.09));
    const atr = round2(clamp(lastPrice * 0.02 * beta, 0.5, 300));

    const macdSignal: MacdSignal =
      dayChangePct > 0.8 ? 'Bullish' : dayChangePct < -0.8 ? 'Bearish' : 'Neutral';

    const bollingerPosition: BollingerPosition =
      lastPrice > sma50 * 1.05 ? 'Above' : lastPrice < sma50 * 0.95 ? 'Below' : 'Within';

    const volRatio = volume / avgVolume20D;
    const volumeVsAvg: VolumeVsAvg =
      volRatio >= 3 ? '3x' : volRatio >= 2 ? '2x' : volRatio >= 1.05 ? 'Above' : 'Below';

    // Index membership
    const indexMembership: string[] = [];
    if (capCategory === 'Large Cap') {
      if (index < 50) indexMembership.push('NIFTY 50');
      if (index < 30) indexMembership.push('BSE Sensex');
      if (index >= 50 && index < 100) indexMembership.push('NIFTY Next 50');
    } else if (capCategory === 'Mid Cap' && index < 250) {
      indexMembership.push('NIFTY Midcap 100');
    } else if (capCategory === 'Small Cap' && index < 1000) {
      indexMembership.push('NIFTY Smallcap 250');
    }

    return {
      symbol,
      companyName: isNamedCompany ? `${baseName} Ltd` : `${baseName} Limited`,
      sector,
      industry,
      marketCapCategory: capCategory,
      indexMembership,
      lastPrice,
      previousClose,
      dayOpen,
      dayHigh,
      dayLow,
      changePercent: dayChangePct,
      changeAbsolute,
      volume,
      avgVolume20D,
      week52High,
      week52Low,
      marketCap,
      pe,
      pb,
      dividendYield,
      eps,
      roe,
      roce,
      debtToEquity,
      currentRatio,
      promoterHolding,
      revenueGrowthYoY,
      profitGrowthYoY,
      rsi14,
      sma50,
      sma200,
      beta,
      atr,
      macdSignal,
      bollingerPosition,
      volumeVsAvg,
      updatedAt: Date.now(),
    };
  };

  // 1. Large Cap Generation
  for (let i = 0; i < largeCapCount; i++) {
    const sector = sectors[i % sectors.length];
    stocks.push(generateSingleStock(i, 'Large Cap', sector));
    createdCount++;
  }

  // 2. Mid Cap Generation
  for (let i = 0; i < midCapCount; i++) {
    const sector = sectors[(i + 3) % sectors.length];
    stocks.push(generateSingleStock(createdCount, 'Mid Cap', sector));
    createdCount++;
  }

  // 3. Small Cap Generation
  for (let i = 0; i < smallCapCount; i++) {
    const sector = sectors[(i + 7) % sectors.length];
    stocks.push(generateSingleStock(createdCount, 'Small Cap', sector));
    createdCount++;
  }

  // 4. Micro Cap Generation
  for (let i = 0; i < microCapCount; i++) {
    const sector = sectors[(i + 11) % sectors.length];
    stocks.push(generateSingleStock(createdCount, 'Micro Cap', sector));
    createdCount++;
  }

  return stocks;
}
