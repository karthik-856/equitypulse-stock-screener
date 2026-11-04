export type Sector =
  | 'IT'
  | 'Banking'
  | 'Pharma'
  | 'Auto'
  | 'FMCG'
  | 'Metal'
  | 'Energy'
  | 'Realty'
  | 'Telecom'
  | 'Infrastructure'
  | 'Chemicals'
  | 'Media'
  | 'Others';

export type MarketCapCategory = 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap';

export type MacdSignal = 'Bullish' | 'Bearish' | 'Neutral';
export type BollingerPosition = 'Above' | 'Within' | 'Below';
export type VolumeVsAvg = 'Below' | 'Above' | '2x' | '3x';

export interface Stock {
  symbol: string;
  companyName: string;
  sector: Sector;
  industry: string;
  marketCapCategory: MarketCapCategory;
  indexMembership: string[];

  // Price data (INR ₹)
  lastPrice: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  changePercent: number;
  changeAbsolute: number;
  volume: number;
  avgVolume20D: number;
  week52High: number;
  week52Low: number;

  // Fundamentals
  marketCap: number; // INR Crores
  pe: number | null;
  pb: number;
  dividendYield: number;
  eps: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  currentRatio: number;
  promoterHolding: number;
  revenueGrowthYoY: number;
  profitGrowthYoY: number;

  // Technical
  rsi14: number;
  sma50: number;
  sma200: number;
  beta: number;
  atr: number;
  macdSignal: MacdSignal;
  bollingerPosition: BollingerPosition;
  volumeVsAvg: VolumeVsAvg;

  // Real-time tracking
  updatedAt?: number;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'notIn'
  | 'contains'
  | 'startsWith';

export type FilterValue =
  | number
  | string
  | boolean
  | [number, number]
  | number[]
  | string[]
  | null;

export interface FilterConfig {
  id: string;
  field: keyof Stock;
  operator: FilterOperator;
  value: FilterValue;
  enabled: boolean;
  label?: string;
  category?: 'Fundamentals' | 'Market Data' | 'Classification' | 'Technical' | 'Custom';
}

export interface SortConfig {
  column: keyof Stock;
  direction: 'asc' | 'desc' | 'none';
}

export interface PriceUpdate {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  changeAbsolute: number;
  volume: number;
  high?: number;
  low?: number;
  timestamp: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: FilterConfig[];
  isDefault?: boolean;
}
