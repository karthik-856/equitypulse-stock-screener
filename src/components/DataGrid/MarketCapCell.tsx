'use client';

import React, { memo } from 'react';
import { formatMarketCap } from '@/lib/formatters';

interface MarketCapCellProps {
  value: number;
}

export const MarketCapCell = memo(
  function MarketCapCell({ value }: MarketCapCellProps) {
    return (
      <span className="font-mono text-xs text-gray-800 dark:text-gray-200 tabular-nums">
        {formatMarketCap(value)}
      </span>
    );
  },
  (prev, next) => prev.value === next.value
);
