'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Filter, BarChart3, Moon, Sun, Download, Trash2, X } from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';
import { Stock } from '@/types/stock';
import { exportStocksToCSV } from '@/lib/exportUtils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
}

export function CommandPalette({ isOpen, onClose, stocks }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const setSelectedSymbol = useStockStore((s) => s.setSelectedSymbol);
  const setIsChartOpen = useStockStore((s) => s.setIsChartOpen);
  const presets = useStockStore((s) => s.presets);
  const applyPreset = useStockStore((s) => s.applyPreset);
  const clearAllFilters = useStockStore((s) => s.clearAllFilters);
  const viewMode = useStockStore((s) => s.viewMode);
  const setViewMode = useStockStore((s) => s.setViewMode);
  const darkMode = useStockStore((s) => s.darkMode);
  const toggleDarkMode = useStockStore((s) => s.toggleDarkMode);
  const highContrast = useStockStore((s) => s.highContrastMode);
  const toggleHighContrastMode = useStockStore((s) => s.toggleHighContrastMode);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStocks = query.trim()
    ? stocks
        .filter(
          (s) =>
            s.symbol.toLowerCase().includes(query.toLowerCase()) ||
            s.companyName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or stock symbol (e.g. RELIANCE, Value, Heatmap)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-gray-800/60">
          {/* Stock Matches */}
          {filteredStocks.length > 0 && (
            <div className="py-2">
              <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Instruments ({filteredStocks.length})
              </div>
              {filteredStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => {
                    setSelectedSymbol(s.symbol);
                    setIsChartOpen(true);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-500" />
                    <span className="font-mono font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {s.symbol}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      {s.companyName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                      ₹{s.lastPrice.toFixed(2)}
                    </span>
                    <span
                      className={`ml-2 text-[11px] font-mono ${
                        s.changePercent >= 0 ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {s.changePercent >= 0 ? '+' : ''}
                      {s.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions & Presets */}
          <div className="py-2">
            <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Filter Presets
            </div>
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  applyPreset(p);
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <span>Apply &quot;{p.name}&quot; Preset</span>
                <span className="text-gray-400 text-[11px] ml-auto">({p.filters.length} criteria)</span>
              </button>
            ))}
          </div>

          <div className="py-2">
            <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              View & Tools
            </div>
            <button
              onClick={() => {
                setViewMode(viewMode === 'grid' ? 'heatmap' : 'grid');
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
              <span>Toggle View Mode (Currently: {viewMode.toUpperCase()})</span>
            </button>

            <button
              onClick={() => {
                toggleDarkMode();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-gray-500" />}
              <span>Toggle Dark Mode</span>
            </button>

            <button
              onClick={() => {
                toggleHighContrastMode();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 border border-magenta-500 inline-block" />
              <span>Toggle High Contrast Chart Mode (Current: {highContrast ? 'ON' : 'OFF'})</span>
            </button>

            <button
              onClick={() => {
                exportStocksToCSV(stocks);
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export Screener Results to CSV</span>
            </button>

            <button
              onClick={() => {
                clearAllFilters();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset & Clear All Active Filters</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-400">
          <span>Navigate with arrows, Enter to execute</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
