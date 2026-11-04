'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useStockData } from '@/hooks/useStockData';
import { useStockScreener } from '@/hooks/useStockScreener';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { useStockStore } from '@/stores/stockStore';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { FilterPanel } from '@/components/FilterPanel/FilterPanel';
import { FilterChip } from '@/components/FilterPanel/FilterChip';
import { DataGrid } from '@/components/DataGrid/DataGrid';
import { HeatmapView } from '@/components/Heatmap/HeatmapView';
import { KeyboardHelpModal } from '@/components/Layout/KeyboardHelpModal';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { WifiOff, Loader2 } from 'lucide-react';

// Lazy-load chart component via React Suspense / Next dynamic (Section A1.1 & Task 6.2)
const StockChart = dynamic(
  () => import('@/components/Chart/StockChart').then((mod) => mod.StockChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    ),
  }
);

export default function ScreenerPage() {
  const { stocks: allStocks, isLoading, isOffline } = useStockData();

  // Initialize real-time WebSocket connection
  useWebSocket(allStocks);

  const {
    stocks: filteredStocks,
    totalCount,
    filteredCount,
    executionTimeMs,
  } = useStockScreener(allStocks);

  // Zustand selectors
  const activeFilters = useStockStore((s) => s.activeFilters);
  const removeFilter = useStockStore((s) => s.removeFilter);
  const selectedSymbol = useStockStore((s) => s.selectedSymbol);
  const isChartOpen = useStockStore((s) => s.isChartOpen);
  const viewMode = useStockStore((s) => s.viewMode);

  // Scroll to row callback ref for keyboard navigation
  const scrollToRowRef = useRef<((index: number) => void) | null>(null);

  const {
    focusedIndex,
    isHelpOpen,
    setIsHelpOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
  } = useKeyboardNav(filteredStocks, (index) => {
    scrollToRowRef.current?.(index);
  });

  const selectedStock = useMemo(() => {
    return allStocks.find((s) => s.symbol === selectedSymbol) ?? filteredStocks[0] ?? null;
  }, [allStocks, filteredStocks, selectedSymbol]);

  if (isLoading && allStocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg mb-4 animate-bounce">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Loading 5,000+ Indian Equity Instruments
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Initialising institutional screener universe, pre-computing technical indicators, and caching into IndexedDB...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <Header
        stocks={allStocks}
        isOffline={isOffline}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Offline Mode Alert Banner (Task 5.4) */}
      {isOffline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm z-30">
          <WifiOff className="w-4 h-4" />
          <span>Working offline - prices may be stale. Full filter and sort engine is active locally.</span>
        </div>
      )}

      {/* Applied Filter Chips Bar */}
      {activeFilters.length > 0 && (
        <div className="px-4 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 overflow-x-auto z-10 flex-shrink-0">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">
            Active Filters ({activeFilters.length}):
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                filter={filter}
                onRemove={removeFilter}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Filter Panel */}
        <ErrorBoundary fallbackTitle="Filter Panel Error">
          <FilterPanel
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        </ErrorBoundary>

        {/* Center / Right: Screen Area */}
        <main className="flex-1 flex overflow-hidden p-3 gap-3">
          {viewMode === 'grid' ? (
            <div className="flex-1 flex overflow-hidden gap-3">
              {/* Virtual Data Grid (60% when chart open, 100% when closed) */}
              <div
                className={`transition-all duration-200 flex flex-col overflow-hidden ${
                  isChartOpen ? 'w-full lg:w-[58%] xl:w-[60%]' : 'w-full'
                }`}
              >
                <ErrorBoundary fallbackTitle="Data Grid Error">
                  <DataGrid
                    stocks={filteredStocks}
                    totalUniverseCount={totalCount}
                    focusedIndex={focusedIndex}
                    onScrollToRowRef={scrollToRowRef}
                  />
                </ErrorBoundary>
              </div>

              {/* Real-time Lightweight Candlestick Chart (40% width) */}
              {isChartOpen && (
                <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
                  <ErrorBoundary fallbackTitle="Technical Chart Error">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900 rounded-xl">
                          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                        </div>
                      }
                    >
                      <StockChart stock={selectedStock} />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              )}
            </div>
          ) : (
            /* Finviz Heatmap View */
            <ErrorBoundary fallbackTitle="Heatmap Error">
              <HeatmapView stocks={filteredStocks} />
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Footer Status Bar */}
      <Footer
        totalCount={totalCount}
        filteredCount={filteredCount}
        executionTimeMs={executionTimeMs}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Modals & Palettes */}
      <KeyboardHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        stocks={allStocks}
      />
    </div>
  );
}
