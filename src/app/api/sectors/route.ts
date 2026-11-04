import { NextResponse } from 'next/server';
import { SECTOR_METADATA } from '@/lib/constants';

export async function GET() {
  const start = performance.now();
  const tree = Object.entries(SECTOR_METADATA).map(([sector, meta]) => ({
    sector,
    weightPercent: Math.round(meta.weight * 100),
    avgPE: meta.avgPE,
    avgBeta: meta.avgBeta,
    avgDividendYield: meta.avgDividendYield,
    industries: meta.industries,
  }));

  return NextResponse.json({
    success: true,
    data: tree,
    meta: {
      total: tree.length,
      page: 1,
      pageSize: tree.length,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
