'use client';

import React, { useMemo } from 'react';
import { Stock, Sector } from '@/types/stock';
import { useStockStore } from '@/stores/stockStore';
import { formatPercent, formatMarketCap } from '@/lib/formatters';

interface HeatmapViewProps {
  stocks: Stock[];
}

export function HeatmapView({ stocks }: HeatmapViewProps) {
  const setSelectedSymbol = useStockStore((s) => s.setSelectedSymbol);
  const setIsChartOpen = useStockStore((s) => s.setIsChartOpen);

  // Group stocks by sector
  const groupedBySector = useMemo(() => {
    const map = new Map<Sector, Stock[]>();
    for (const s of stocks) {
      if (!map.has(s.sector)) {
        map.set(s.sector, []);
      }
      map.get(s.sector)!.push(s);
    }
    return map;
  }, [stocks]);

  const getColorClass = (changePct: number): string => {
    if (changePct >= 4) return 'bg-emerald-600 hover:bg-emerald-500 text-white';
    if (changePct >= 2) return 'bg-emerald-500 hover:bg-emerald-400 text-white';
    if (changePct >= 0.5) return 'bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100';
    if (changePct > -0.5) return 'bg-gray-700 hover:bg-gray-600 text-gray-200';
    if (changePct > -2) return 'bg-red-800/80 hover:bg-red-700 text-red-100';
    if (changePct > -4) return 'bg-red-600 hover:bg-red-500 text-white';
    return 'bg-red-700 hover:bg-red-600 text-white';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-950 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-100">Market Heatmap</h2>
          <p className="text-xs text-gray-400">
            Sized by Market Capitalization, colored by Intraday Performance
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-600 inline-block" /> &lt; -3%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-700 inline-block" /> 0%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> &gt; +3%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from(groupedBySector.entries()).map(([sector, sectorStocks]) => {
          // Sort sector stocks by market cap
          const sorted = [...sectorStocks].sort((a, b) => b.marketCap - a.marketCap);
          const topStocks = sorted.slice(0, 16);

          return (
            <div
              key={sector}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-800">
                <span className="text-xs font-bold text-gray-200 tracking-wide uppercase">
                  {sector}
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  {sectorStocks.length} stocks
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 flex-1 min-h-[140px]">
                {topStocks.map((s, index) => {
                  const isTopLarge = index < 2;
                  const colSpan = isTopLarge ? 'col-span-2 row-span-2' : 'col-span-1';

                  return (
                    <button
                      key={s.symbol}
                      onClick={() => {
                        setSelectedSymbol(s.symbol);
                        setIsChartOpen(true);
                      }}
                      className={`${colSpan} ${getColorClass(
                        s.changePercent
                      )} rounded p-1.5 flex flex-col justify-between text-left transition-transform hover:scale-[1.02] shadow-sm overflow-hidden`}
                    >
                      <div>
                        <div className="font-mono font-bold text-xs truncate">{s.symbol}</div>
                        <div className="text-[9px] opacity-75 truncate">{s.companyName}</div>
                      </div>
                      <div className="mt-1 font-mono font-semibold text-[11px]">
                        {formatPercent(s.changePercent)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
