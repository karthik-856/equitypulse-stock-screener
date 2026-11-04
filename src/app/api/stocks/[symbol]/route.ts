import { NextResponse } from 'next/server';
import { generateMockStocks } from '@/lib/mockDataGenerator';
import { Stock } from '@/types/stock';

let stockCache: Map<string, Stock> | null = null;

function getStockMap(): Map<string, Stock> {
  if (!stockCache) {
    const list = generateMockStocks(5000);
    stockCache = new Map(list.map((s) => [s.symbol.toUpperCase(), s]));
  }
  return stockCache;
}

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const start = performance.now();
  const symbol = params.symbol?.toUpperCase();
  const map = getStockMap();
  const stock = map.get(symbol);

  if (!stock) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STOCK_NOT_FOUND',
          message: `Stock with symbol '${symbol}' not found in universe`,
        },
        meta: {
          total: 0,
          page: 1,
          pageSize: 1,
          timestamp: new Date().toISOString(),
          executionTimeMs: Math.round(performance.now() - start),
        },
      },
      { status: 404 }
    );
  }

  // Extend with detailed overview metrics
  const extendedStock = {
    ...stock,
    about: `${stock.companyName} is an industry leader in the ${stock.sector} sector (${stock.industry}), listed on the NSE and BSE.`,
    metrics: {
      enterpriseValue: Math.round(stock.marketCap * (1 + stock.debtToEquity * 0.1)),
      bookValuePerShare: Math.round((stock.lastPrice / stock.pb) * 100) / 100,
      faceValue: 10,
      piotroskiScore: Math.floor(Math.random() * 4) + 6, // 6-9 range
      altmanZScore: Math.round((2.5 + Math.random() * 3) * 100) / 100,
      freeCashFlowCr: Math.round(stock.marketCap * 0.045),
    },
  };

  return NextResponse.json({
    success: true,
    data: extendedStock,
    meta: {
      total: 1,
      page: 1,
      pageSize: 1,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
