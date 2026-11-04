import { NextResponse } from 'next/server';
import { INDICES } from '@/lib/constants';

export async function GET() {
  const start = performance.now();
  const indices = INDICES.map((name) => ({
    name,
    exchange: name.includes('BSE') ? 'BSE' : 'NSE',
    category: name.includes('Smallcap')
      ? 'Small Cap'
      : name.includes('Midcap')
      ? 'Mid Cap'
      : 'Large Cap',
  }));

  return NextResponse.json({
    success: true,
    data: indices,
    meta: {
      total: indices.length,
      page: 1,
      pageSize: indices.length,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
