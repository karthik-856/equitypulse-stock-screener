import { NextResponse } from 'next/server';
import { generateOHLCV } from '@/lib/ohlcvGenerator';
import { generateMockStocks } from '@/lib/mockDataGenerator';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const start = performance.now();
  const symbol = params.symbol?.toUpperCase();
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '252', 10);

  // Find approximate price for stock
  const all = generateMockStocks(100);
  const found = all.find((s) => s.symbol.toUpperCase() === symbol);
  const basePrice = found ? found.lastPrice : 1500;
  const volatility = found ? (found.beta * 0.02) : 0.02;

  const candles = generateOHLCV(basePrice, days, volatility, found?.volume || 1000000);

  return NextResponse.json({
    success: true,
    data: candles,
    meta: {
      total: candles.length,
      page: 1,
      pageSize: candles.length,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
