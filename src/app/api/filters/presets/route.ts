import { NextResponse } from 'next/server';
import { DEFAULT_PRESETS } from '@/lib/constants';
import { FilterPreset } from '@/types/stock';

let presetsStore: FilterPreset[] = [...DEFAULT_PRESETS];

export async function GET() {
  const start = performance.now();
  return NextResponse.json({
    success: true,
    data: presetsStore,
    meta: {
      total: presetsStore.length,
      page: 1,
      pageSize: presetsStore.length,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}

export async function POST(request: Request) {
  const start = performance.now();
  try {
    const body = await request.json();
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name: body.name || 'Custom Screener',
      description: body.description || '',
      filters: body.filters || [],
      isDefault: false,
    };
    presetsStore.push(newPreset);

    return NextResponse.json({
      success: true,
      data: newPreset,
      meta: {
        total: presetsStore.length,
        page: 1,
        pageSize: 1,
        timestamp: new Date().toISOString(),
        executionTimeMs: Math.round(performance.now() - start),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_REQUEST', message: err.message },
        meta: {
          total: 0,
          page: 1,
          pageSize: 0,
          timestamp: new Date().toISOString(),
          executionTimeMs: Math.round(performance.now() - start),
        },
      },
      { status: 400 }
    );
  }
}
