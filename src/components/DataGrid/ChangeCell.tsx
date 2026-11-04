'use client';

import React, { memo } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface ChangeCellProps {
  value: number;
  absoluteChange?: number;
}

export const ChangeCell = memo(
  function ChangeCell({ value, absoluteChange }: ChangeCellProps) {
    const isPositive = value > 0;
    const isNegative = value < 0;

    const colorClass = isPositive
      ? 'text-positive dark:text-positive-light'
      : isNegative
      ? 'text-negative dark:text-negative-light'
      : 'text-gray-500';

    return (
      <div className={`inline-flex items-center gap-1 font-mono text-xs tabular-nums font-semibold ${colorClass}`}>
        {isPositive && <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />}
        {isNegative && <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" />}
        {!isPositive && !isNegative && <Minus className="w-3 h-3 flex-shrink-0" />}
        <span>
          {isPositive ? '+' : ''}
          {value.toFixed(2)}%
        </span>
        {absoluteChange !== undefined && (
          <span className="text-[10px] font-normal opacity-75">
            ({isPositive ? '+' : ''}₹{Math.abs(absoluteChange).toFixed(2)})
          </span>
        )}
      </div>
    );
  },
  (prev, next) => prev.value === next.value && prev.absoluteChange === next.absoluteChange
);
