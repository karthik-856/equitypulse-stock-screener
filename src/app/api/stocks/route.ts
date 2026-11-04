import { NextResponse } from 'next/server';
import { generateMockStocks } from '@/lib/mockDataGenerator';
import { Stock } from '@/types/stock';

let cachedStocks: Stock[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const start = performance.now();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '5000', 10);
  const search = searchParams.get('q')?.toLowerCase();

  const now = Date.now();
  if (!cachedStocks || now - lastCacheTime > CACHE_TTL) {
    cachedStocks = generateMockStocks(5000);
    lastCacheTime = now;
  }

  let filtered = cachedStocks;
  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.symbol.toLowerCase().includes(search) ||
        s.companyName.toLowerCase().includes(search)
    );
  }

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    success: true,
    data: paginated,
    meta: {
      total: filtered.length,
      page,
      pageSize,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
