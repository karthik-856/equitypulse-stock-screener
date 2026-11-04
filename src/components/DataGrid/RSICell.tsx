'use client';

import React, { memo } from 'react';

interface RSICellProps {
  value: number;
}

export const RSICell = memo(
  function RSICell({ value }: RSICellProps) {
    // Green < 30 (Oversold), Yellow 30-70 (Neutral), Red > 70 (Overbought)
    let badgeClass = 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    let status = 'Neutral';

    if (value < 30) {
      badgeClass = 'bg-positive-light text-positive-dark dark:bg-positive/20 dark:text-positive-light border-positive/30';
      status = 'Oversold';
    } else if (value > 70) {
      badgeClass = 'bg-negative-light text-negative-dark dark:bg-negative/20 dark:text-negative-light border-negative/30';
      status = 'Overbought';
    }

    return (
      <div className="inline-flex items-center gap-1.5">
        <span
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-medium border ${badgeClass} tabular-nums`}
          title={`RSI(14): ${value.toFixed(1)} (${status})`}
        >
          {value.toFixed(1)}
        </span>
      </div>
    );
  },
  (prev, next) => prev.value === next.value
);
