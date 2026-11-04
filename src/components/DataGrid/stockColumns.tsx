'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Stock } from '@/types/stock';
import { PriceCell } from './PriceCell';
import { ChangeCell } from './ChangeCell';
import { VolumeCell } from './VolumeCell';
import { MarketCapCell } from './MarketCapCell';
import { RSICell } from './RSICell';
import { Star } from 'lucide-react';

export interface StockColumnsOptions {
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (symbol: string) => void;
}

export function createStockColumns(options: StockColumnsOptions): ColumnDef<Stock>[] {
  const { watchlist, onToggleWatchlist, onSelectStock } = options;

  return [
    {
      id: 'watchlist',
      header: '',
      size: 40,
      enableSorting: false,
      cell: ({ row }) => {
        const symbol = row.original.symbol;
        const isWatchlisted = watchlist.includes(symbol);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(symbol);
            }}
            aria-label={`Toggle ${symbol} on watchlist`}
            className="p-1 hover:scale-110 text-gray-400 hover:text-amber-500 transition-transform"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                isWatchlisted ? 'fill-amber-400 text-amber-500' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        );
      },
    },
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      size: 110,
      enableSorting: true,
      cell: ({ getValue, row }) => (
        <button
          onClick={() => onSelectStock(row.original.symbol)}
          className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400 hover:underline text-left"
        >
          {getValue() as string}
        </button>
      ),
    },
    {
      accessorKey: 'companyName',
      header: 'Company Name',
      size: 190,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="truncate block text-xs text-gray-800 dark:text-gray-200 font-medium">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'lastPrice',
      header: 'LTP (₹)',
      size: 110,
      enableSorting: true,
      cell: ({ getValue }) => <PriceCell value={getValue() as number} />,
    },
    {
      accessorKey: 'changePercent',
      header: '% Change',
      size: 110,
      enableSorting: true,
      cell: ({ row }) => (
        <ChangeCell
          value={row.original.changePercent}
          absoluteChange={row.original.changeAbsolute}
        />
      ),
    },
    {
      accessorKey: 'marketCap',
      header: 'Market Cap',
      size: 120,
      enableSorting: true,
      cell: ({ getValue }) => <MarketCapCell value={getValue() as number} />,
    },
    {
      accessorKey: 'sector',
      header: 'Sector',
      size: 130,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-600 dark:text-gray-400 truncate block">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'pe',
      header: 'P/E',
      size: 80,
      enableSorting: true,
      cell: ({ getValue }) => {
        const val = getValue() as number | null;
        return (
          <span className="font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">
            {val !== null ? val.toFixed(1) : <span className="text-gray-400 italic">Loss</span>}
          </span>
        );
      },
    },
    {
      accessorKey: 'pb',
      header: 'P/B',
      size: 75,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">
          {(getValue() as number).toFixed(1)}
        </span>
      ),
    },
    {
      accessorKey: 'volume',
      header: 'Volume',
      size: 100,
      enableSorting: true,
      cell: ({ getValue }) => <VolumeCell value={getValue() as number} />,
    },
    {
      accessorKey: 'rsi14',
      header: 'RSI (14)',
      size: 90,
      enableSorting: true,
      cell: ({ getValue }) => <RSICell value={getValue() as number} />,
    },
    {
      accessorKey: 'roe',
      header: 'ROE %',
      size: 80,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">
          {(getValue() as number).toFixed(1)}%
        </span>
      ),
    },
    {
      accessorKey: 'debtToEquity',
      header: 'Debt/Eq',
      size: 80,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">
          {(getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'dividendYield',
      header: 'Div Yield',
      size: 85,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">
          {(getValue() as number).toFixed(1)}%
        </span>
      ),
    },
    {
      accessorKey: 'macdSignal',
      header: 'MACD',
      size: 85,
      enableSorting: true,
      cell: ({ getValue }) => {
        const val = getValue() as string;
        const color =
          val === 'Bullish'
            ? 'text-positive dark:text-positive-light'
            : val === 'Bearish'
            ? 'text-negative dark:text-negative-light'
            : 'text-gray-500';
        return <span className={`text-[11px] font-semibold ${color}`}>{val}</span>;
      },
    },
    {
      accessorKey: 'beta',
      header: 'Beta',
      size: 70,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">
          {(getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'week52High',
      header: '52W High',
      size: 95,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs tabular-nums text-gray-600 dark:text-gray-400">
          ₹{(getValue() as number).toFixed(2)}
        </span>
      ),
    },
  ];
}
