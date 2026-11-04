import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const start = performance.now();
  const symbol = params.symbol?.toUpperCase();

  const years = ['FY20', 'FY21', 'FY22', 'FY23', 'FY24'];
  const baseRev = 25000 + Math.floor(Math.random() * 50000);
  const basePat = Math.round(baseRev * (0.10 + Math.random() * 0.08));

  const pnl = years.map((y, i) => {
    const factor = Math.pow(1.12, i);
    return {
      year: y,
      revenueCr: Math.round(baseRev * factor),
      operatingProfitCr: Math.round(baseRev * factor * 0.22),
      netProfitCr: Math.round(basePat * factor),
      eps: Math.round((basePat * factor * 10) / 1000 * 100) / 100,
      opmPercent: 22,
    };
  });

  const balanceSheet = years.map((y, i) => {
    const factor = Math.pow(1.1, i);
    return {
      year: y,
      equityShareCapital: 1200,
      reserves: Math.round(35000 * factor),
      borrowings: Math.round(8000 * factor * 0.9),
      otherLiabilities: Math.round(12000 * factor),
      fixedAssets: Math.round(28000 * factor),
      investments: Math.round(15000 * factor),
      otherAssets: Math.round(13200 * factor),
      totalAssets: Math.round(56200 * factor),
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      symbol,
      pnl,
      balanceSheet,
      shareholding: {
        promoters: 54.2,
        fii: 22.8,
        dii: 14.5,
        public: 8.5,
      },
    },
    meta: {
      total: 1,
      page: 1,
      pageSize: 1,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
