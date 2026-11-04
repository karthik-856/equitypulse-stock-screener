'use client';

import React from 'react';
import { Zap, Database, Clock, Terminal } from 'lucide-react';

interface FooterProps {
  totalCount: number;
  filteredCount: number;
  executionTimeMs: number;
  onOpenHelp: () => void;
  onOpenCommandPalette: () => void;
}

export function Footer({
  totalCount,
  filteredCount,
  executionTimeMs,
  onOpenHelp,
  onOpenCommandPalette,
}: FooterProps) {
  const isSub200 = executionTimeMs < 200;

  return (
    <footer className="h-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400 select-none z-20">
      {/* Telemetry Metrics */}
      <div className="flex items-center gap-4">
        {/* Sub-200ms Benchmark Indicator */}
        <div className="flex items-center gap-1.5">
          <Zap
            className={`w-3.5 h-3.5 ${
              isSub200 ? 'text-emerald-500 fill-emerald-500' : 'text-amber-500'
            }`}
          />
          <span>
            Filter Latency:{' '}
            <strong className={isSub200 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}>
              {executionTimeMs.toFixed(1)}ms
            </strong>
          </span>
          {isSub200 && (
            <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              SUB-200MS TARGET MET
            </span>
          )}
        </div>

        {/* Universe Counter */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Database className="w-3 h-3 text-brand-500" />
          <span>
            Universe: <strong className="text-gray-800 dark:text-gray-200">{filteredCount.toLocaleString('en-IN')}</strong> / {totalCount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Shortcuts Quick Access */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"
        >
          <Terminal className="w-3 h-3" />
          <span>Ctrl+K</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="hover:text-brand-600 dark:hover:text-brand-400"
        >
          Press <kbd className="px-1 py-0.2 rounded bg-gray-200 dark:bg-gray-800">?</kbd> for shortcuts
        </button>
      </div>
    </footer>
  );
}
