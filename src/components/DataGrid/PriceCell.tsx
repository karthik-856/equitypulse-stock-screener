'use client';

import React, { memo, useRef, useEffect, useState } from 'react';
import { formatINR } from '@/lib/formatters';

interface PriceCellProps {
  value: number;
}

export const PriceCell = memo(
  function PriceCell({ value }: PriceCellProps) {
    const prevValueRef = useRef<number>(value);
    const [flashClass, setFlashClass] = useState<string>('');

    useEffect(() => {
      if (prevValueRef.current !== value) {
        if (value > prevValueRef.current) {
          setFlashClass('bg-positive-light dark:bg-positive/30 text-positive-dark dark:text-positive-light');
        } else if (value < prevValueRef.current) {
          setFlashClass('bg-negative-light dark:bg-negative/30 text-negative-dark dark:text-negative-light');
        }
        prevValueRef.current = value;

        const timer = setTimeout(() => {
          setFlashClass('');
        }, 300); // Exactly 300ms as per Section A4.3 & A12.1

        return () => clearTimeout(timer);
      }
    }, [value]);

    return (
      <span
        className={`inline-block px-1.5 py-0.5 rounded font-mono font-medium text-xs text-gray-900 dark:text-gray-100 transition-colors duration-300 tabular-nums ${flashClass}`}
      >
        {formatINR(value)}
      </span>
    );
  },
  (prev, next) => prev.value === next.value
);
