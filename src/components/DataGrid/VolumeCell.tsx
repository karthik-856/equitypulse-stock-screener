'use client';

import React, { memo } from 'react';
import { formatVolume } from '@/lib/formatters';

interface VolumeCellProps {
  value: number;
}

export const VolumeCell = memo(
  function VolumeCell({ value }: VolumeCellProps) {
    return (
      <span className="font-mono text-xs text-gray-700 dark:text-gray-300 tabular-nums">
        {formatVolume(value)}
      </span>
    );
  },
  (prev, next) => prev.value === next.value
);
