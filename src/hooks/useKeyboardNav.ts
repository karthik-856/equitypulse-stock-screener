import { useEffect, useState, useCallback } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { Stock } from '@/types/stock';

export function useKeyboardNav(
  stocks: Stock[],
  onScrollToRow?: (index: number) => void
) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const setSelectedSymbol = useStockStore((s) => s.setSelectedSymbol);
  const toggleWatchlist = useStockStore((s) => s.toggleWatchlist);
  const toggleFilterSidebar = useStockStore((s) => s.toggleFilterSidebar);
  const isChartOpen = useStockStore((s) => s.isChartOpen);
  const setIsChartOpen = useStockStore((s) => s.setIsChartOpen);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // 1. Command Palette / Search shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('screener-search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          setIsCommandPaletteOpen(true);
        }
        return;
      }

      // 2. Help Modal shortcut
      if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // 3. Filter and Chart Toggles
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggleFilterSidebar();
        return;
      }

      if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsChartOpen(!isChartOpen);
        return;
      }

      if (e.key === 'Escape') {
        setIsHelpOpen(false);
        setIsCommandPaletteOpen(false);
        return;
      }

      // 4. Grid Navigation
      if (stocks.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.min(stocks.length - 1, prev + 1);
          onScrollToRow?.(next);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.max(0, prev - 1);
          onScrollToRow?.(next);
          return next;
        });
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.min(stocks.length - 1, prev + 15);
          onScrollToRow?.(next);
          return next;
        });
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.max(0, prev - 15);
          onScrollToRow?.(next);
          return next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
        onScrollToRow?.(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        const last = stocks.length - 1;
        setFocusedIndex(last);
        onScrollToRow?.(last);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const currentStock = stocks[focusedIndex];
        if (currentStock) {
          setSelectedSymbol(currentStock.symbol);
          setIsChartOpen(true);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        const currentStock = stocks[focusedIndex];
        if (currentStock) {
          toggleWatchlist(currentStock.symbol);
        }
      }
    },
    [
      stocks,
      focusedIndex,
      onScrollToRow,
      setSelectedSymbol,
      toggleWatchlist,
      toggleFilterSidebar,
      isChartOpen,
      setIsChartOpen,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex,
    isHelpOpen,
    setIsHelpOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
  };
}
