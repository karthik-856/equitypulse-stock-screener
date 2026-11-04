'use client';

import React, { useRef, useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Stock, SortConfig } from '@/types/stock';
import { createStockColumns } from './stockColumns';
import { useStockStore } from '@/stores/stockStore';
import { ArrowUpDown, ArrowUp, ArrowDown, Pin, PinOff } from 'lucide-react';

interface DataGridProps {
  stocks: Stock[];
  totalUniverseCount: number;
  focusedIndex?: number;
  onScrollToRowRef?: React.MutableRefObject<((index: number) => void) | null>;
}

export function DataGrid({
  stocks,
  totalUniverseCount,
  focusedIndex = 0,
  onScrollToRowRef,
}: DataGridProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const sortConfig = useStockStore((s) => s.sortConfig);
  const setSortConfig = useStockStore((s) => s.setSortConfig);
  const selectedSymbol = useStockStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useStockStore((s) => s.setSelectedSymbol);
  const watchlist = useStockStore((s) => s.watchlist);
  const toggleWatchlist = useStockStore((s) => s.toggleWatchlist);
  const pinnedColumns = useStockStore((s) => s.pinnedColumns);
  const togglePinColumn = useStockStore((s) => s.togglePinColumn);

  // Context menu for column pinning
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    columnId: string;
    columnName: string;
  } | null>(null);

  // Convert sortConfig to TanStack sorting state
  const sortingState: SortingState = useMemo(() => {
    if (!sortConfig || sortConfig.direction === 'none') return [];
    return [{ id: sortConfig.column, desc: sortConfig.direction === 'desc' }];
  }, [sortConfig]);

  const handleSortingChange = useCallback(
    (updater: any) => {
      const nextSorting: SortingState =
        typeof updater === 'function' ? updater(sortingState) : updater;

      if (nextSorting.length === 0) {
        setSortConfig({ column: 'marketCap', direction: 'none' });
      } else {
        const first = nextSorting[0];
        setSortConfig({
          column: first.id as keyof Stock,
          direction: first.desc ? 'desc' : 'asc',
        });
      }
    },
    [sortingState, setSortConfig]
  );

  const columns = useMemo(
    () =>
      createStockColumns({
        watchlist,
        onToggleWatchlist: toggleWatchlist,
        onSelectStock: setSelectedSymbol,
      }),
    [watchlist, toggleWatchlist, setSelectedSymbol]
  );

  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      sorting: sortingState,
      columnPinning: {
        left: pinnedColumns,
      },
    },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  const { rows } = table.getRowModel();

  // TanStack Virtual row virtualizer (Fixed 36px row height)
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 36,
    overscan: 12,
  });

  // Provide scroll-to-row function
  if (onScrollToRowRef) {
    onScrollToRowRef.current = (index: number) => {
      rowVirtualizer.scrollToIndex(index, { align: 'auto' });
    };
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalHeight - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden select-none">
      {/* Screen Reader ARIA Live Status */}
      <div id="grid-status" role="status" aria-live="polite" className="sr-only">
        Showing {stocks.length} of {totalUniverseCount} stocks. Sorted by{' '}
        {sortConfig.column} {sortConfig.direction}.
      </div>

      {/* Grid Container */}
      <div
        ref={tableContainerRef}
        role="grid"
        aria-label="Stock Screener Data Grid"
        aria-rowcount={stocks.length}
        aria-colcount={columns.length}
        aria-describedby="grid-status"
        className="flex-1 overflow-auto focus:outline-none"
        tabIndex={0}
      >
        <table className="w-full border-collapse text-left" style={{ width: table.getTotalSize() }}>
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} role="row" aria-rowindex={1} className="h-9">
                {headerGroup.headers.map((header, index) => {
                  const isPinnedLeft = header.column.getIsPinned() === 'left';
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      role="columnheader"
                      aria-colindex={index + 1}
                      aria-sort={
                        isSorted === 'desc'
                          ? 'descending'
                          : isSorted === 'asc'
                          ? 'ascending'
                          : 'none'
                      }
                      style={{
                        width: header.getSize(),
                        left: isPinnedLeft ? `${header.column.getStart('left')}px` : undefined,
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          columnId: header.column.id,
                          columnName: String(header.column.columnDef.header || header.column.id),
                        });
                      }}
                      className={`relative px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 select-none ${
                        isPinnedLeft
                          ? 'sticky z-30 bg-gray-50 dark:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]'
                          : ''
                      }`}
                    >
                      <div
                        onClick={header.column.getToggleSortingHandler()}
                        className={`flex items-center gap-1.5 ${
                          header.column.getCanSort() ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100' : ''
                        }`}
                      >
                        <span className="truncate">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-gray-400 flex-shrink-0">
                            {isSorted === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                        {isPinnedLeft && header.column.id !== 'watchlist' && (
                          <Pin className="w-2.5 h-2.5 text-brand-500 ml-auto rotate-45 flex-shrink-0" />
                        )}
                      </div>

                      {/* Column Resizer Handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none hover:bg-brand-500 ${
                            header.column.getIsResizing() ? 'bg-brand-600 w-2' : 'bg-transparent'
                          }`}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Virtual Body */}
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}

            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;

              const isSelected = row.original.symbol === selectedSymbol;
              const isKeyboardFocused = virtualRow.index === focusedIndex;

              return (
                <tr
                  key={row.id}
                  role="row"
                  aria-rowindex={virtualRow.index + 2}
                  onClick={() => setSelectedSymbol(row.original.symbol)}
                  className={`h-9 border-b border-gray-100 dark:border-gray-800/60 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-50/70 dark:bg-brand-950/40 ring-1 ring-inset ring-brand-500/40'
                      : isKeyboardFocused
                      ? 'bg-blue-50/40 dark:bg-gray-800/80 ring-1 ring-inset ring-blue-400'
                      : virtualRow.index % 2 === 0
                      ? 'bg-white dark:bg-gray-900 hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
                      : 'bg-gray-50/30 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isPinnedLeft = cell.column.getIsPinned() === 'left';

                    return (
                      <td
                        key={cell.id}
                        role="gridcell"
                        aria-colindex={cellIndex + 1}
                        style={{
                          width: cell.column.getSize(),
                          left: isPinnedLeft ? `${cell.column.getStart('left')}px` : undefined,
                        }}
                        className={`px-3 py-1 text-xs truncate ${
                          isPinnedLeft
                            ? `sticky z-10 ${
                                isSelected
                                  ? 'bg-brand-50 dark:bg-brand-950'
                                  : virtualRow.index % 2 === 0
                                  ? 'bg-white dark:bg-gray-900'
                                  : 'bg-gray-50/80 dark:bg-gray-900'
                              } shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]`
                            : ''
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Context Menu for Column Pinning */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl py-1 text-xs text-gray-700 dark:text-gray-300 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={() => setContextMenu(null)}
        >
          <div className="px-3 py-1 font-semibold text-gray-400 border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase">
            {contextMenu.columnName}
          </div>
          <button
            onClick={() => {
              togglePinColumn(contextMenu.columnId);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
          >
            {pinnedColumns.includes(contextMenu.columnId) ? (
              <>
                <PinOff className="w-3.5 h-3.5 text-gray-400" />
                <span>Unpin Column</span>
              </>
            ) : (
              <>
                <Pin className="w-3.5 h-3.5 text-brand-500" />
                <span>Pin Column to Left</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
