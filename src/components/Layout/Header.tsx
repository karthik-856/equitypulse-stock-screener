'use client';

import React from 'react';
import {
  TrendingUp,
  Search,
  Download,
  Printer,
  Moon,
  Sun,
  HelpCircle,
  BarChart2,
  Table,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';
import { Stock } from '@/types/stock';
import { exportStocksToCSV, printOrExportPDF } from '@/lib/exportUtils';

interface HeaderProps {
  stocks: Stock[];
  onOpenHelp: () => void;
  onOpenCommandPalette: () => void;
  isOffline?: boolean;
}

export function Header({
  stocks,
  onOpenHelp,
  onOpenCommandPalette,
  isOffline = false,
}: HeaderProps) {
  const wsStatus = useStockStore((s) => s.wsStatus);
  const searchQuery = useStockStore((s) => s.searchQuery);
  const setSearchQuery = useStockStore((s) => s.setSearchQuery);
  const viewMode = useStockStore((s) => s.viewMode);
  const setViewMode = useStockStore((s) => s.setViewMode);
  const darkMode = useStockStore((s) => s.darkMode);
  const toggleDarkMode = useStockStore((s) => s.toggleDarkMode);

  const getStatusBadge = () => {
    if (isOffline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <WifiOff className="w-3 h-3 text-amber-500" />
          <span>Offline Mode</span>
        </span>
      );
    }
    if (wsStatus === 'connected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Ticks</span>
        </span>
      );
    }
    if (wsStatus === 'reconnecting') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <span>Reconnecting</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span>Disconnected</span>
      </span>
    );
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between gap-4 select-none z-30">
      {/* Brand & Market Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
                EquityPulse
              </h1>
              <span className="text-[10px] font-semibold px-1 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-gray-400">NSE &amp; BSE Real-Time Screener</p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="hidden sm:block">{getStatusBadge()}</div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            id="screener-search-input"
            type="text"
            placeholder="Search symbol, company, or sector (Press '/' or Ctrl+K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-brand-500 rounded-lg pl-9 pr-14 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors"
          />
          <kbd
            onClick={onOpenCommandPalette}
            className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50"
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls & Toggles */}
      <div className="flex items-center gap-2">
        {/* View Switcher (Grid / Heatmap) */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('grid')}
            title="Data Grid View"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-300 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            title="Heatmap View"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-300 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>

        {/* CSV Export */}
        <button
          onClick={() => exportStocksToCSV(stocks)}
          title="Export Filtered Universe to CSV"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Print / PDF */}
        <button
          onClick={() => printOrExportPDF()}
          title="Print or Export to PDF"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title="Toggle Dark / Light Mode"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Keyboard Help */}
        <button
          onClick={onOpenHelp}
          title="Keyboard Shortcuts ('?')"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
