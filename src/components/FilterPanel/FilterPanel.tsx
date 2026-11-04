'use client';

import React, { useState } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { RangeFilter } from './RangeFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { SingleSelectFilter } from './SingleSelectFilter';
import { BooleanFilter } from './BooleanFilter';
import { PresetSelector } from './PresetSelector';
import { SECTOR_METADATA, INDICES } from '@/lib/constants';
import {
  ChevronRight,
  Filter,
  Trash2,
  PieChart,
  BarChart,
  Activity,
  Layers,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { FilterConfig, Sector } from '@/types/stock';

interface FilterPanelProps {
  totalCount: number;
  filteredCount: number;
}

export function FilterPanel({ totalCount, filteredCount }: FilterPanelProps) {
  const activeFilters = useStockStore((s) => s.activeFilters);
  const addFilter = useStockStore((s) => s.addFilter);
  const removeFilter = useStockStore((s) => s.removeFilter);
  const clearAllFilters = useStockStore((s) => s.clearAllFilters);
  const isSidebarOpen = useStockStore((s) => s.isFilterSidebarOpen);
  const toggleSidebar = useStockStore((s) => s.toggleFilterSidebar);

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Fundamentals: true,
    MarketData: true,
    Classification: true,
    Technical: true,
    Custom: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getFilter = (id: string): FilterConfig | undefined => {
    return activeFilters.find((f) => f.id === id);
  };

  const setRangeFilter = (
    id: string,
    field: any,
    value: [number, number],
    label: string,
    category: any
  ) => {
    addFilter({
      id,
      field,
      operator: 'between',
      value,
      enabled: true,
      label,
      category,
    });
  };

  const setMultiFilter = (
    id: string,
    field: any,
    selected: string[],
    label: string,
    category: any
  ) => {
    if (selected.length === 0) {
      removeFilter(id);
    } else {
      addFilter({
        id,
        field,
        operator: 'in',
        value: selected,
        enabled: true,
        label: `${label} (${selected.length})`,
        category,
      });
    }
  };

  const setSingleFilter = (
    id: string,
    field: any,
    value: string,
    label: string,
    category: any
  ) => {
    addFilter({
      id,
      field,
      operator: 'eq',
      value,
      enabled: true,
      label: `${label}: ${value}`,
      category,
    });
  };

  if (!isSidebarOpen) {
    return (
      <div className="w-12 h-full flex flex-col items-center py-4 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          aria-label="Expand filter panel"
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <Filter className="w-5 h-5" />
        </button>
        {activeFilters.length > 0 && (
          <span className="mt-3 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
            {activeFilters.length}
          </span>
        )}
      </div>
    );
  }

  // All Industries combined
  const allIndustries = Array.from(
    new Set(Object.values(SECTOR_METADATA).flatMap((m) => m.industries))
  );

  return (
    <aside
      aria-label="Filter Controls"
      className="w-80 h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Screener Filters
          </h2>
          {activeFilters.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-500 text-white font-bold">
              {activeFilters.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              title="Clear all active filters"
              className="text-xs text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1 mr-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Match Banner */}
      <div className="px-4 py-2 bg-brand-50/60 dark:bg-brand-950/30 border-b border-brand-100 dark:border-brand-900/50 flex items-center justify-between text-xs">
        <span className="text-brand-900 dark:text-brand-200 font-medium">
          Showing <span className="font-bold font-mono">{filteredCount.toLocaleString('en-IN')}</span> of{' '}
          <span className="font-mono">{totalCount.toLocaleString('en-IN')}</span> stocks
        </span>
      </div>

      {/* Preset Selector */}
      <PresetSelector />

      {/* Accordion Filter Sections */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
        {/* 1. FUNDAMENTALS */}
        <div>
          <button
            onClick={() => toggleSection('Fundamentals')}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-left"
          >
            <span className="flex items-center gap-2">
              <PieChart className="w-3.5 h-3.5 text-brand-500" />
              <span>Fundamentals (12)</span>
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                openSections.Fundamentals ? 'rotate-90' : ''
              }`}
            />
          </button>

          {openSections.Fundamentals && (
            <div className="px-2 pb-3 space-y-1">
              <RangeFilter
                label="Market Cap"
                field="marketCap"
                min={50}
                max={2000000}
                unit="Cr"
                activeFilter={getFilter('f-mcap')}
                onChange={(val) =>
                  setRangeFilter('f-mcap', 'marketCap', val, `MCap: ₹${val[0]}-₹${val[1]}Cr`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-mcap')}
              />

              <RangeFilter
                label="Price to Earnings (P/E)"
                field="pe"
                min={-100}
                max={500}
                activeFilter={getFilter('f-pe')}
                onChange={(val) =>
                  setRangeFilter('f-pe', 'pe', val, `P/E: ${val[0]} to ${val[1]}`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-pe')}
              />

              <RangeFilter
                label="Price to Book (P/B)"
                field="pb"
                min={0}
                max={100}
                activeFilter={getFilter('f-pb')}
                onChange={(val) =>
                  setRangeFilter('f-pb', 'pb', val, `P/B: ${val[0]} to ${val[1]}`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-pb')}
              />

              <RangeFilter
                label="Dividend Yield"
                field="dividendYield"
                min={0}
                max={25}
                unit="%"
                activeFilter={getFilter('f-div')}
                onChange={(val) =>
                  setRangeFilter('f-div', 'dividendYield', val, `Div: ${val[0]}% - ${val[1]}%`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-div')}
              />

              <RangeFilter
                label="Earnings Per Share (EPS)"
                field="eps"
                min={-500}
                max={5000}
                unit="₹"
                activeFilter={getFilter('f-eps')}
                onChange={(val) =>
                  setRangeFilter('f-eps', 'eps', val, `EPS: ₹${val[0]} - ₹${val[1]}`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-eps')}
              />

              <RangeFilter
                label="Return on Equity (ROE)"
                field="roe"
                min={-100}
                max={200}
                unit="%"
                activeFilter={getFilter('f-roe')}
                onChange={(val) =>
                  setRangeFilter('f-roe', 'roe', val, `ROE: ${val[0]}% - ${val[1]}%`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-roe')}
              />

              <RangeFilter
                label="ROCE"
                field="roce"
                min={-100}
                max={200}
                unit="%"
                activeFilter={getFilter('f-roce')}
                onChange={(val) =>
                  setRangeFilter('f-roce', 'roce', val, `ROCE: ${val[0]}% - ${val[1]}%`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-roce')}
              />

              <RangeFilter
                label="Debt to Equity"
                field="debtToEquity"
                min={0}
                max={10}
                step={0.1}
                activeFilter={getFilter('f-de')}
                onChange={(val) =>
                  setRangeFilter('f-de', 'debtToEquity', val, `D/E: ${val[0]} - ${val[1]}`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-de')}
              />

              <RangeFilter
                label="Current Ratio"
                field="currentRatio"
                min={0}
                max={20}
                step={0.1}
                activeFilter={getFilter('f-cr')}
                onChange={(val) =>
                  setRangeFilter('f-cr', 'currentRatio', val, `Current Ratio: ${val[0]}-${val[1]}`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-cr')}
              />

              <RangeFilter
                label="Promoter Holding"
                field="promoterHolding"
                min={0}
                max={100}
                unit="%"
                activeFilter={getFilter('f-promoter')}
                onChange={(val) =>
                  setRangeFilter('f-promoter', 'promoterHolding', val, `Promoter: ${val[0]}%-${val[1]}%`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-promoter')}
              />

              <RangeFilter
                label="Revenue Growth (YoY)"
                field="revenueGrowthYoY"
                min={-100}
                max={500}
                unit="%"
                activeFilter={getFilter('f-revgrowth')}
                onChange={(val) =>
                  setRangeFilter('f-revgrowth', 'revenueGrowthYoY', val, `Rev Growth: ${val[0]}%-${val[1]}%`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-revgrowth')}
              />

              <RangeFilter
                label="Profit Growth (YoY)"
                field="profitGrowthYoY"
                min={-100}
                max={1000}
                unit="%"
                activeFilter={getFilter('f-profitgrowth')}
                onChange={(val) =>
                  setRangeFilter('f-profitgrowth', 'profitGrowthYoY', val, `Profit Growth: ${val[0]}%-${val[1]}%`, 'Fundamentals')
                }
                onClear={() => removeFilter('f-profitgrowth')}
              />
            </div>
          )}
        </div>

        {/* 2. MARKET DATA */}
        <div>
          <button
            onClick={() => toggleSection('MarketData')}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-left"
          >
            <span className="flex items-center gap-2">
              <BarChart className="w-3.5 h-3.5 text-emerald-500" />
              <span>Market Data (6)</span>
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                openSections.MarketData ? 'rotate-90' : ''
              }`}
            />
          </button>

          {openSections.MarketData && (
            <div className="px-2 pb-3 space-y-1">
              <RangeFilter
                label="Last Traded Price"
                field="lastPrice"
                min={0}
                max={500000}
                unit="₹"
                activeFilter={getFilter('f-ltp')}
                onChange={(val) =>
                  setRangeFilter('f-ltp', 'lastPrice', val, `LTP: ₹${val[0]}-₹${val[1]}`, 'Market Data')
                }
                onClear={() => removeFilter('f-ltp')}
              />

              <RangeFilter
                label="Day Change (%)"
                field="changePercent"
                min={-20}
                max={20}
                unit="%"
                activeFilter={getFilter('f-change')}
                onChange={(val) =>
                  setRangeFilter('f-change', 'changePercent', val, `Change: ${val[0]}% to ${val[1]}%`, 'Market Data')
                }
                onClear={() => removeFilter('f-change')}
              />

              <RangeFilter
                label="Beta"
                field="beta"
                min={-2}
                max={5}
                step={0.1}
                activeFilter={getFilter('f-beta')}
                onChange={(val) =>
                  setRangeFilter('f-beta', 'beta', val, `Beta: ${val[0]} to ${val[1]}`, 'Market Data')
                }
                onClear={() => removeFilter('f-beta')}
              />

              <RangeFilter
                label="Average Volume (20D)"
                field="avgVolume20D"
                min={0}
                max={100000000}
                activeFilter={getFilter('f-vol')}
                onChange={(val) =>
                  setRangeFilter('f-vol', 'avgVolume20D', val, `Avg Vol: ${val[0]}-${val[1]}`, 'Market Data')
                }
                onClear={() => removeFilter('f-vol')}
              />

              <RangeFilter
                label="52-Week High Proximity"
                field="week52High"
                min={0}
                max={100}
                unit="%"
                activeFilter={getFilter('f-52whigh')}
                onChange={(val) =>
                  setRangeFilter('f-52whigh', 'week52High', val, `Within ${val[1]}% of 52W High`, 'Market Data')
                }
                onClear={() => removeFilter('f-52whigh')}
              />

              <RangeFilter
                label="52-Week Low Proximity"
                field="week52Low"
                min={0}
                max={100}
                unit="%"
                activeFilter={getFilter('f-52wlow')}
                onChange={(val) =>
                  setRangeFilter('f-52wlow', 'week52Low', val, `Within ${val[1]}% of 52W Low`, 'Market Data')
                }
                onClear={() => removeFilter('f-52wlow')}
              />
            </div>
          )}
        </div>

        {/* 3. CLASSIFICATION */}
        <div>
          <button
            onClick={() => toggleSection('Classification')}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-left"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Classification (4)</span>
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                openSections.Classification ? 'rotate-90' : ''
              }`}
            />
          </button>

          {openSections.Classification && (
            <div className="px-2 pb-3 space-y-1">
              <MultiSelectFilter
                label="Sector"
                field="sector"
                options={Object.keys(SECTOR_METADATA)}
                activeFilter={getFilter('f-sector')}
                onChange={(selected) =>
                  setMultiFilter('f-sector', 'sector', selected, 'Sector', 'Classification')
                }
                onClear={() => removeFilter('f-sector')}
              />

              <MultiSelectFilter
                label="Industry"
                field="industry"
                options={allIndustries}
                activeFilter={getFilter('f-industry')}
                onChange={(selected) =>
                  setMultiFilter('f-industry', 'industry', selected, 'Industry', 'Classification')
                }
                onClear={() => removeFilter('f-industry')}
              />

              <MultiSelectFilter
                label="Market Cap Category"
                field="marketCapCategory"
                options={['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap']}
                activeFilter={getFilter('f-capcategory')}
                onChange={(selected) =>
                  setMultiFilter('f-capcategory', 'marketCapCategory', selected, 'Cap Category', 'Classification')
                }
                onClear={() => removeFilter('f-capcategory')}
              />

              <MultiSelectFilter
                label="Index Membership"
                field="indexMembership"
                options={INDICES}
                activeFilter={getFilter('f-index')}
                onChange={(selected) =>
                  setMultiFilter('f-index', 'indexMembership', selected, 'Index', 'Classification')
                }
                onClear={() => removeFilter('f-index')}
              />
            </div>
          )}
        </div>

        {/* 4. TECHNICAL INDICATORS */}
        <div>
          <button
            onClick={() => toggleSection('Technical')}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-left"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-purple-500" />
              <span>Technical (7)</span>
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                openSections.Technical ? 'rotate-90' : ''
              }`}
            />
          </button>

          {openSections.Technical && (
            <div className="px-2 pb-3 space-y-1">
              <RangeFilter
                label="RSI (14)"
                field="rsi14"
                min={0}
                max={100}
                activeFilter={getFilter('f-rsi')}
                onChange={(val) =>
                  setRangeFilter('f-rsi', 'rsi14', val, `RSI: ${val[0]} - ${val[1]}`, 'Technical')
                }
                onClear={() => removeFilter('f-rsi')}
              />

              <SingleSelectFilter
                label="MACD Signal"
                field="macdSignal"
                options={[
                  { label: 'Bullish', value: 'Bullish' },
                  { label: 'Bearish', value: 'Bearish' },
                  { label: 'Neutral', value: 'Neutral' },
                ]}
                activeFilter={getFilter('f-macd')}
                onChange={(val) =>
                  setSingleFilter('f-macd', 'macdSignal', val, 'MACD', 'Technical')
                }
                onClear={() => removeFilter('f-macd')}
              />

              <SingleSelectFilter
                label="Bollinger Band Position"
                field="bollingerPosition"
                options={[
                  { label: 'Above Upper', value: 'Above' },
                  { label: 'Within Bands', value: 'Within' },
                  { label: 'Below Lower', value: 'Below' },
                ]}
                activeFilter={getFilter('f-bbpos')}
                onChange={(val) =>
                  setSingleFilter('f-bbpos', 'bollingerPosition', val, 'Bollinger', 'Technical')
                }
                onClear={() => removeFilter('f-bbpos')}
              />

              <SingleSelectFilter
                label="Volume vs 20D Average"
                field="volumeVsAvg"
                options={[
                  { label: 'Above Avg', value: 'Above' },
                  { label: 'Below Avg', value: 'Below' },
                  { label: '2x Above', value: '2x' },
                  { label: '3x Above', value: '3x' },
                ]}
                activeFilter={getFilter('f-volavg')}
                onChange={(val) =>
                  setSingleFilter('f-volavg', 'volumeVsAvg', val, 'Volume vs Avg', 'Technical')
                }
                onClear={() => removeFilter('f-volavg')}
              />

              <RangeFilter
                label="Average True Range (ATR)"
                field="atr"
                min={0}
                max={500}
                activeFilter={getFilter('f-atr')}
                onChange={(val) =>
                  setRangeFilter('f-atr', 'atr', val, `ATR: ${val[0]}-${val[1]}`, 'Technical')
                }
                onClear={() => removeFilter('f-atr')}
              />
            </div>
          )}
        </div>

        {/* 5. CUSTOM FILTERS */}
        <div>
          <button
            onClick={() => toggleSection('Custom')}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-left"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Custom Rules (2)</span>
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                openSections.Custom ? 'rotate-90' : ''
              }`}
            />
          </button>

          {openSections.Custom && (
            <div className="px-2 pb-3 space-y-1">
              <BooleanFilter
                label="Watchlist Only"
                description="Show only stocks bookmarked in your watchlist"
                checked={activeFilters.some((f) => f.id === 'f-custom-watchlist')}
                onChange={(checked) => {
                  if (checked) {
                    const watchlist = useStockStore.getState().watchlist;
                    addFilter({
                      id: 'f-custom-watchlist',
                      field: 'symbol',
                      operator: 'in',
                      value: watchlist,
                      enabled: true,
                      label: `Watchlist (${watchlist.length})`,
                      category: 'Custom',
                    });
                  } else {
                    removeFilter('f-custom-watchlist');
                  }
                }}
              />

              <BooleanFilter
                label="Recently Updated (Live)"
                description="Highlight stocks updated by the WebSocket stream"
                checked={activeFilters.some((f) => f.id === 'f-custom-recent')}
                onChange={(checked) => {
                  if (checked) {
                    addFilter({
                      id: 'f-custom-recent',
                      field: 'changePercent',
                      operator: 'neq',
                      value: 0,
                      enabled: true,
                      label: 'Active Market Ticks',
                      category: 'Custom',
                    });
                  } else {
                    removeFilter('f-custom-recent');
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
