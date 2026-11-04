import { describe, it, expect } from 'vitest';
import { filterStocks, benchmarkFilterEngine } from '@/lib/filterEngine';
import { generateMockStocks } from '@/lib/mockDataGenerator';
import { FilterConfig } from '@/types/stock';

describe('Filter Engine & Performance', () => {
  const stocks = generateMockStocks(5000);

  it('filters 5000 stocks in under 200ms (Benchmark Requirement)', () => {
    const filters: FilterConfig[] = [
      {
        id: 'f1',
        field: 'marketCap',
        operator: 'gte',
        value: 10000,
        enabled: true,
      },
      {
        id: 'f2',
        field: 'pe',
        operator: 'between',
        value: [10, 30],
        enabled: true,
      },
      {
        id: 'f3',
        field: 'sector',
        operator: 'in',
        value: ['IT', 'Banking'],
        enabled: true,
      },
    ];

    const benchmark = benchmarkFilterEngine(stocks, filters);

    expect(benchmark.executionTimeMs).toBeLessThan(200);
    expect(benchmark.data.length).toBeGreaterThan(0);
    expect(benchmark.data.length).toBeLessThan(stocks.length);
  });

  it('correctly handles between range operator with boundaries', () => {
    const filters: FilterConfig[] = [
      {
        id: 'f-rsi',
        field: 'rsi14',
        operator: 'between',
        value: [30, 40],
        enabled: true,
      },
    ];

    const result = filterStocks(stocks, filters);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((stock) => {
      expect(stock.rsi14).toBeGreaterThanOrEqual(30);
      expect(stock.rsi14).toBeLessThanOrEqual(40);
    });
  });

  it('correctly handles null values (such as loss-making P/E)', () => {
    const filters: FilterConfig[] = [
      {
        id: 'f-pe-null',
        field: 'pe',
        operator: 'gt',
        value: 20,
        enabled: true,
      },
    ];

    const result = filterStocks(stocks, filters);
    result.forEach((stock) => {
      expect(stock.pe).not.toBeNull();
      expect(stock.pe).toBeGreaterThan(20);
    });
  });

  it('correctly sorts filtered results using stable sort', () => {
    const result = filterStocks(
      stocks.slice(0, 100),
      [],
      { column: 'marketCap', direction: 'desc' }
    );

    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].marketCap).toBeGreaterThanOrEqual(result[i].marketCap);
    }
  });

  it('filters by index membership array matching', () => {
    const filters: FilterConfig[] = [
      {
        id: 'f-nifty',
        field: 'indexMembership',
        operator: 'in',
        value: ['NIFTY 50'],
        enabled: true,
      },
    ];

    const result = filterStocks(stocks, filters);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((s) => {
      expect(s.indexMembership).toContain('NIFTY 50');
    });
  });
});
