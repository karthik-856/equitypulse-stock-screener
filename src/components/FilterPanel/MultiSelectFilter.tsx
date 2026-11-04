'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { FilterConfig } from '@/types/stock';

interface MultiSelectFilterProps {
  label: string;
  field: string;
  options: string[];
  activeFilter?: FilterConfig;
  onChange: (selected: string[]) => void;
  onClear: () => void;
}

export function MultiSelectFilter({
  label,
  options,
  activeFilter,
  onChange,
  onClear,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedValues: string[] =
    activeFilter && Array.isArray(activeFilter.value)
      ? (activeFilter.value as string[])
      : [];

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      const next = selectedValues.filter((v) => v !== option);
      onChange(next);
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="py-2.5 px-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-colors">
      <div className="flex items-center justify-between text-xs font-medium mb-1.5">
        <label className="text-gray-700 dark:text-gray-300">
          {label}
          {selectedValues.length > 0 && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-semibold">
              {selectedValues.length}
            </span>
          )}
        </label>
        {selectedValues.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? 'All Selected'
            : selectedValues.length === 1
            ? selectedValues[0]
            : `${selectedValues.length} selected`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-20">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="text-[11px] text-gray-400 p-2 text-center">No options match</div>
            ) : (
              filteredOptions.map((opt) => {
                const checked = selectedValues.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className="w-full flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-gray-700 dark:text-gray-300"
                  >
                    <span className="truncate">{opt}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        checked
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
