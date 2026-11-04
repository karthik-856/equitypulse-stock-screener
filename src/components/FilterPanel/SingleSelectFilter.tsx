'use client';

import React from 'react';
import { FilterConfig } from '@/types/stock';

interface SingleSelectFilterProps {
  label: string;
  field: string;
  options: { label: string; value: string }[];
  activeFilter?: FilterConfig;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SingleSelectFilter({
  label,
  options,
  activeFilter,
  onChange,
  onClear,
}: SingleSelectFilterProps) {
  const currentValue = activeFilter ? String(activeFilter.value) : '';

  return (
    <div className="py-2.5 px-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-colors">
      <div className="flex items-center justify-between text-xs font-medium mb-1.5">
        <label className="text-gray-700 dark:text-gray-300">{label}</label>
        {currentValue && (
          <button
            onClick={onClear}
            className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isSelected = currentValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => (isSelected ? onClear() : onChange(opt.value))}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                isSelected
                  ? 'bg-brand-500 border-brand-500 text-white font-semibold'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
