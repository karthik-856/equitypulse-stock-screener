'use client';

import React from 'react';
import { FilterConfig } from '@/types/stock';

interface RangeFilterProps {
  label: string;
  field: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  activeFilter?: FilterConfig;
  onChange: (value: [number, number]) => void;
  onClear: () => void;
}

export function RangeFilter({
  label,
  min,
  max,
  step = 1,
  unit = '',
  activeFilter,
  onChange,
  onClear,
}: RangeFilterProps) {
  const currentValue: [number, number] =
    activeFilter && Array.isArray(activeFilter.value)
      ? (activeFilter.value as [number, number])
      : [min, max];

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange([Math.min(val, currentValue[1]), currentValue[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange([currentValue[0], Math.max(val, currentValue[0])]);
  };

  const isFiltered = activeFilter && (currentValue[0] > min || currentValue[1] < max);

  return (
    <div className="py-2.5 px-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-colors">
      <div className="flex items-center justify-between text-xs font-medium mb-1.5">
        <label className="text-gray-700 dark:text-gray-300">
          {label} {unit && <span className="text-gray-400 font-normal">({unit})</span>}
        </label>
        {isFiltered && (
          <button
            onClick={onClear}
            className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <span className="text-[10px] text-gray-400 block mb-0.5">Min</span>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={currentValue[0]}
            onChange={handleMinChange}
            aria-label={`${label} minimum value`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue[0]}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs font-mono tabular-nums text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <span className="text-[10px] text-gray-400 block mb-0.5">Max</span>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={currentValue[1]}
            onChange={handleMaxChange}
            aria-label={`${label} maximum value`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue[1]}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs font-mono tabular-nums text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Dual slider */}
      <div className="relative flex items-center pt-1 pb-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={handleMinChange}
          aria-label={`${label} range min`}
          className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[1]}
          onChange={handleMaxChange}
          aria-label={`${label} range max`}
          className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500 ml-2"
        />
      </div>
    </div>
  );
}
