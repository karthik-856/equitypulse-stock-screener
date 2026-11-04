import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FilterConfig, SortConfig, PriceUpdate, FilterPreset } from '@/types/stock';
import { DEFAULT_PRESETS } from '@/lib/constants';

export type ViewMode = 'grid' | 'heatmap';

interface StockState {
  // Filter state
  activeFilters: FilterConfig[];
  searchQuery: string;
  addFilter: (filter: FilterConfig) => void;
  updateFilter: (filterId: string, value: any) => void;
  removeFilter: (filterId: string) => void;
  clearAllFilters: () => void;
  setSearchQuery: (query: string) => void;
  applyPreset: (preset: FilterPreset) => void;

  // Presets
  presets: FilterPreset[];
  savePreset: (preset: Omit<FilterPreset, 'id'>) => void;
  deletePreset: (presetId: string) => void;

  // Sort state
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;

  // Selection & UI state
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isFilterSidebarOpen: boolean;
  toggleFilterSidebar: () => void;
  isChartOpen: boolean;
  setIsChartOpen: (open: boolean) => void;
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Column pinning
  pinnedColumns: string[];
  togglePinColumn: (columnId: string) => void;

  // Real-time price cache
  livePrices: Record<string, PriceUpdate>;
  lastPriceUpdate: number;
  batchUpdatePrices: (updates: Map<string, PriceUpdate>) => void;

  // WebSocket Connection status
  wsStatus: 'connected' | 'reconnecting' | 'disconnected';
  setWsStatus: (status: 'connected' | 'reconnecting' | 'disconnected') => void;

  // Watchlist (persisted)
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
}

export const useStockStore = create<StockState>()(
  devtools(
    persist(
      (set, get) => ({
        // Filter state
        activeFilters: [],
        searchQuery: '',
        addFilter: (filter) =>
          set((state) => {
            const existingIndex = state.activeFilters.findIndex((f) => f.id === filter.id);
            if (existingIndex >= 0) {
              const updated = [...state.activeFilters];
              updated[existingIndex] = filter;
              return { activeFilters: updated };
            }
            return { activeFilters: [...state.activeFilters, filter] };
          }),
        updateFilter: (filterId, value) =>
          set((state) => ({
            activeFilters: state.activeFilters.map((f) =>
              f.id === filterId ? { ...f, value, enabled: true } : f
            ),
          })),
        removeFilter: (filterId) =>
          set((state) => ({
            activeFilters: state.activeFilters.filter((f) => f.id !== filterId),
          })),
        clearAllFilters: () =>
          set({
            activeFilters: [],
            searchQuery: '',
          }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        applyPreset: (preset) =>
          set({
            activeFilters: [...preset.filters],
          }),

        // Presets
        presets: DEFAULT_PRESETS,
        savePreset: (newPreset) =>
          set((state) => ({
            presets: [
              ...state.presets,
              { ...newPreset, id: `custom-${Date.now()}` },
            ],
          })),
        deletePreset: (presetId) =>
          set((state) => ({
            presets: state.presets.filter((p) => p.id !== presetId || p.isDefault),
          })),

        // Sort state
        sortConfig: { column: 'marketCap', direction: 'desc' },
        setSortConfig: (config) => set({ sortConfig: config }),

        // Selection & UI state
        selectedSymbol: 'RELIANCE',
        setSelectedSymbol: (symbol) =>
          set({
            selectedSymbol: symbol,
            isChartOpen: symbol !== null,
          }),
        viewMode: 'grid',
        setViewMode: (mode) => set({ viewMode: mode }),
        isFilterSidebarOpen: true,
        toggleFilterSidebar: () =>
          set((state) => ({ isFilterSidebarOpen: !state.isFilterSidebarOpen })),
        isChartOpen: true,
        setIsChartOpen: (open) => set({ isChartOpen: open }),
        highContrastMode: false,
        toggleHighContrastMode: () =>
          set((state) => ({ highContrastMode: !state.highContrastMode })),
        darkMode: false,
        toggleDarkMode: () =>
          set((state) => {
            const nextMode = !state.darkMode;
            if (typeof document !== 'undefined') {
              if (nextMode) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
            return { darkMode: nextMode };
          }),

        // Column Pinning
        pinnedColumns: ['symbol'],
        togglePinColumn: (columnId) =>
          set((state) => {
            if (columnId === 'symbol') return state; // Symbol is permanently pinned
            const isPinned = state.pinnedColumns.includes(columnId);
            return {
              pinnedColumns: isPinned
                ? state.pinnedColumns.filter((id) => id !== columnId)
                : [...state.pinnedColumns, columnId],
            };
          }),

        // Real-time prices
        livePrices: {},
        lastPriceUpdate: 0,
        batchUpdatePrices: (updates) =>
          set((state) => {
            const updated = { ...state.livePrices };
            updates.forEach((val, key) => {
              updated[key] = val;
            });
            return {
              livePrices: updated,
              lastPriceUpdate: Date.now(),
            };
          }),

        // WebSocket status
        wsStatus: 'connected',
        setWsStatus: (status) => set({ wsStatus: status }),

        // Watchlist
        watchlist: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS'],
        toggleWatchlist: (symbol) =>
          set((state) => {
            const hasSymbol = state.watchlist.includes(symbol);
            return {
              watchlist: hasSymbol
                ? state.watchlist.filter((s) => s !== symbol)
                : [...state.watchlist, symbol],
            };
          }),
      }),
      {
        name: 'equitypulse-store',
        partialize: (state) => ({
          watchlist: state.watchlist,
          presets: state.presets,
          darkMode: state.darkMode,
          pinnedColumns: state.pinnedColumns,
        }),
      }
    ),
    { name: 'EquityPulseStore' }
  )
);
