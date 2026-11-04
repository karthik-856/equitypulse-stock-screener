import { useMemo } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { filterStocks, benchmarkFilterEngine } from '@/lib/filterEngine';
import { Stock } from '@/types/stock';

export function useStockScreener(allStocks: Stock[]) {
  const activeFilters = useStockStore((s) => s.activeFilters);
  const sortConfig = useStockStore((s) => s.sortConfig);
  const searchQuery = useStockStore((s) => s.searchQuery);
  const livePrices = useStockStore((s) => s.livePrices);
  const watchlist = useStockStore((s) => s.watchlist);

  // Merge live price updates into stock records with cell-level efficiency
  const stocksWithLive = useMemo(() => {
    if (Object.keys(livePrices).length === 0) return allStocks;

    return allStocks.map((stock) => {
      const update = livePrices[stock.symbol];
      if (!update) return stock;

      return {
        ...stock,
        lastPrice: update.lastPrice,
        changePercent: update.changePercent,
        changeAbsolute: update.changeAbsolute,
        volume: update.volume,
        dayHigh: update.high ?? stock.dayHigh,
        dayLow: update.low ?? stock.dayLow,
        updatedAt: update.timestamp,
      };
    });
  }, [allStocks, livePrices]);

  // Execute filtering & sorting
  const { data: filteredStocks, executionTimeMs } = useMemo(() => {
    let dataset = stocksWithLive;

    // Apply quick search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      dataset = dataset.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query) ||
          s.companyName.toLowerCase().includes(query) ||
          s.sector.toLowerCase().includes(query)
      );
    }

    // Apply active filter predicates & sorting
    return benchmarkFilterEngine(dataset, activeFilters, sortConfig);
  }, [stocksWithLive, activeFilters, sortConfig, searchQuery]);

  return {
    stocks: filteredStocks,
    totalCount: allStocks.length,
    filteredCount: filteredStocks.length,
    executionTimeMs,
    watchlist,
  };
}
