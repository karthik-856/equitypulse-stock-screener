'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FilterConfig } from '@/types/stock';

interface FilterChipProps {
  filter: FilterConfig;
  onRemove: (filterId: string) => void;
}

export function FilterChip({ filter, onRemove }: FilterChipProps) {
  let displayValue = '';

  if (Array.isArray(filter.value)) {
    if (filter.operator === 'between') {
      displayValue = `${filter.value[0]} - ${filter.value[1]}`;
    } else {
      displayValue = filter.value.join(', ');
    }
  } else {
    displayValue = String(filter.value);
  }

  const label = filter.label || `${String(filter.field)}: ${displayValue}`;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-sm animate-scale-in">
      <span>{label}</span>
      <button
        onClick={() => onRemove(filter.id)}
        aria-label={`Remove filter ${label}`}
        className="p-0.5 rounded-full hover:bg-brand-200 dark:hover:bg-brand-800 text-brand-500 hover:text-brand-800 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
