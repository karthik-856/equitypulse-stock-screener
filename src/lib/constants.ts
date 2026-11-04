import { FilterPreset, Sector } from '@/types/stock';

export const SECTOR_METADATA: Record<
  Sector,
  {
    companies: string[];
    industries: string[];
    weight: number;
    avgPE: number;
    avgBeta: number;
    avgDividendYield: number;
  }
> = {
  Banking: {
    companies: [
      'HDFC Bank', 'ICICI Bank', 'SBI', 'Kotak Mahindra', 'Axis Bank',
      'IndusInd Bank', 'Bank of Baroda', 'Punjab National Bank', 'Federal Bank', 'Canara Bank'
    ],
    industries: ['Private Banks', 'Public Banks', 'NBFCs', 'Housing Finance', 'Credit Cards'],
    weight: 0.15,
    avgPE: 18.5,
    avgBeta: 1.1,
    avgDividendYield: 1.2,
  },
  IT: {
    companies: [
      'TCS', 'Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra',
      'LTIMindtree', 'Persistent Systems', 'Coforge', 'Mphasis', 'KPIT Tech'
    ],
    industries: ['IT Consulting', 'Software Products', 'Cloud Solutions', 'Digital Services', 'BPO'],
    weight: 0.12,
    avgPE: 25.0,
    avgBeta: 0.85,
    avgDividendYield: 1.5,
  },
  Pharma: {
    companies: [
      'Sun Pharma', 'Dr Reddy Labs', 'Cipla', 'Divi Labs', 'Aurobindo Pharma',
      'Lupin', 'Torrent Pharma', 'Alkem Labs', 'Biocon', 'Zydus Lifesciences'
    ],
    industries: ['Formulations', 'APIs', 'Biotechnology', 'Diagnostic Services', 'Contract Research'],
    weight: 0.10,
    avgPE: 30.0,
    avgBeta: 0.7,
    avgDividendYield: 0.8,
  },
  FMCG: {
    companies: [
      'Hindustan Unilever', 'ITC', 'Nestle India', 'Britannia', 'Tata Consumer',
      'Marico', 'Dabur India', 'Godrej Consumer', 'Colgate-Palmolive', 'Varun Beverages'
    ],
    industries: ['Food & Beverages', 'Personal Care', 'Household Products', 'Tobacco Products', 'Agro Products'],
    weight: 0.08,
    avgPE: 35.0,
    avgBeta: 0.6,
    avgDividendYield: 1.8,
  },
  Auto: {
    companies: [
      'Tata Motors', 'Mahindra & Mahindra', 'Maruti Suzuki', 'Bajaj Auto', 'Eicher Motors',
      'TVS Motor', 'Hero MotoCorp', 'Bharat Forge', 'Ashok Leyland', 'Apollo Tyres'
    ],
    industries: ['Passenger Cars', 'Commercial Vehicles', 'Two Wheelers', 'Auto Ancillaries', 'Tyres'],
    weight: 0.07,
    avgPE: 22.0,
    avgBeta: 1.05,
    avgDividendYield: 1.0,
  },
  Metal: {
    companies: [
      'Tata Steel', 'JSW Steel', 'Hindalco', 'Vedanta', 'Jindal Steel',
      'NMDC', 'Coal India', 'National Aluminium', 'SAIL', 'APL Apollo Tubes'
    ],
    industries: ['Steel & Iron', 'Aluminium', 'Mining & Minerals', 'Pipes & Tubes', 'Precious Metals'],
    weight: 0.06,
    avgPE: 12.0,
    avgBeta: 1.4,
    avgDividendYield: 2.5,
  },
  Energy: {
    companies: [
      'Reliance Industries', 'ONGC', 'NTPC', 'Power Grid Corp', 'BPCL',
      'IOCL', 'Tata Power', 'Adani Green', 'Adani Power', 'GAIL'
    ],
    industries: ['Oil Exploration', 'Refineries', 'Power Generation', 'Renewable Energy', 'Gas Distribution'],
    weight: 0.06,
    avgPE: 14.0,
    avgBeta: 0.95,
    avgDividendYield: 3.0,
  },
  Realty: {
    companies: [
      'DLF', 'Godrej Properties', 'Macrotech Developers (Lodha)', 'Oberoi Realty', 'Phoenix Mills',
      'Prestige Estates', 'Sobha', 'Brigade Enterprises', 'Sun Teck Realty', 'Mahindra Lifespaces'
    ],
    industries: ['Residential Real Estate', 'Commercial Real Estate', 'REITs', 'Construction Infra'],
    weight: 0.07,
    avgPE: 20.0,
    avgBeta: 1.3,
    avgDividendYield: 0.5,
  },
  Telecom: {
    companies: [
      'Bharti Airtel', 'Tata Communications', 'Indus Towers', 'Vodafone Idea', 'Route Mobile',
      'Tejas Networks', 'Sterlite Tech', 'RailTel', 'Tanla Platforms'
    ],
    industries: ['Telecom Services', 'Telecom Towers', 'CPaaS', 'Network Equipment', 'Data Centers'],
    weight: 0.04,
    avgPE: 28.0,
    avgBeta: 0.9,
    avgDividendYield: 0.3,
  },
  Infrastructure: {
    companies: [
      'Larsen & Toubro', 'Adani Ports', 'GMR Airports', 'IRB Infrastructure', 'KNR Constructions',
      'PNC Infratech', 'Engineers India', 'NBCC', 'RITES', 'Rail Vikas Nigam'
    ],
    industries: ['Heavy Construction', 'Ports & Shipping', 'Airports', 'Roads & Highways', 'EPC Solutions'],
    weight: 0.08,
    avgPE: 18.0,
    avgBeta: 1.15,
    avgDividendYield: 1.0,
  },
  Chemicals: {
    companies: [
      'Aarti Industries', 'Deepak Nitrite', 'SRF', 'PI Industries', 'Atul',
      'Navin Fluorine', 'Tata Chemicals', 'UPL', 'Gujarat Fluorochemicals', 'Clean Science'
    ],
    industries: ['Specialty Chemicals', 'Agrochemicals', 'Industrial Chemicals', 'Fluorochemicals', 'Fertilisers'],
    weight: 0.07,
    avgPE: 22.0,
    avgBeta: 0.8,
    avgDividendYield: 1.2,
  },
  Media: {
    companies: [
      'Zee Entertainment', 'Sun TV Network', 'PVR INOX', 'Network18', 'TV18 Broadcast',
      'DBCorp', 'Jagran Prakashan', 'Saregama India', 'Tips Industries', 'Nazara Technologies'
    ],
    industries: ['Broadcasting', 'Film Theatres', 'Digital Media', 'Music & Entertainment', 'Gaming'],
    weight: 0.03,
    avgPE: 21.0,
    avgBeta: 1.0,
    avgDividendYield: 1.1,
  },
  Others: {
    companies: [
      'Titan Company', 'Trent', 'Havells India', 'Polycab India', 'Astral',
      'Page Industries', 'Bata India', 'Century Textiles', 'Raymond', 'Kalyan Jewellers'
    ],
    industries: ['Textiles & Apparel', 'Gems & Jewellery', 'Consumer Electricals', 'Building Materials', 'Diversified'],
    weight: 0.05,
    avgPE: 24.0,
    avgBeta: 0.95,
    avgDividendYield: 1.0,
  },
};

export const INDICES = [
  'NIFTY 50',
  'NIFTY Next 50',
  'NIFTY Midcap 100',
  'NIFTY Smallcap 250',
  'BSE Sensex',
];

export const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'preset-value',
    name: 'Value Stocks',
    description: 'P/E < 15, ROE > 15%, Debt/Equity < 0.5, Dividend Yield > 2%',
    isDefault: true,
    filters: [
      { id: 'f-val-1', field: 'pe', operator: 'lt', value: 15, enabled: true, label: 'P/E < 15', category: 'Fundamentals' },
      { id: 'f-val-2', field: 'roe', operator: 'gt', value: 15, enabled: true, label: 'ROE > 15%', category: 'Fundamentals' },
      { id: 'f-val-3', field: 'debtToEquity', operator: 'lt', value: 0.5, enabled: true, label: 'Debt/Eq < 0.5', category: 'Fundamentals' },
      { id: 'f-val-4', field: 'dividendYield', operator: 'gt', value: 2.0, enabled: true, label: 'Div Yield > 2%', category: 'Fundamentals' },
    ],
  },
  {
    id: 'preset-growth',
    name: 'Growth Momentum',
    description: 'Revenue Growth > 20%, Profit Growth > 20%, RSI between 40-70, Price > SMA 50',
    isDefault: true,
    filters: [
      { id: 'f-gro-1', field: 'revenueGrowthYoY', operator: 'gt', value: 20, enabled: true, label: 'Rev Growth > 20%', category: 'Fundamentals' },
      { id: 'f-gro-2', field: 'profitGrowthYoY', operator: 'gt', value: 20, enabled: true, label: 'Profit Growth > 20%', category: 'Fundamentals' },
      { id: 'f-gro-3', field: 'rsi14', operator: 'between', value: [40, 70], enabled: true, label: 'RSI 40-70', category: 'Technical' },
      { id: 'f-gro-4', field: 'bollingerPosition', operator: 'eq', value: 'Within', enabled: true, label: 'Within Bollinger Bands', category: 'Technical' },
    ],
  },
  {
    id: 'preset-large-cap-quality',
    name: 'Large Cap Quality',
    description: 'Market Cap > ₹20,000 Cr, ROCE > 15%, Promoter Holding > 50%',
    isDefault: true,
    filters: [
      { id: 'f-lcq-1', field: 'marketCap', operator: 'gte', value: 20000, enabled: true, label: 'Market Cap ≥ ₹20,000 Cr', category: 'Fundamentals' },
      { id: 'f-lcq-2', field: 'roce', operator: 'gt', value: 15, enabled: true, label: 'ROCE > 15%', category: 'Fundamentals' },
      { id: 'f-lcq-3', field: 'promoterHolding', operator: 'gt', value: 50, enabled: true, label: 'Promoter > 50%', category: 'Fundamentals' },
    ],
  },
  {
    id: 'preset-technical-breakout',
    name: 'Technical Breakout',
    description: 'Price above SMA 200, RSI between 50-70, Volume above 2x avg, Bollinger within bands',
    isDefault: true,
    filters: [
      { id: 'f-tb-1', field: 'rsi14', operator: 'between', value: [50, 70], enabled: true, label: 'RSI 50-70', category: 'Technical' },
      { id: 'f-tb-2', field: 'volumeVsAvg', operator: 'in', value: ['2x', '3x'], enabled: true, label: 'Volume ≥ 2x Avg', category: 'Technical' },
      { id: 'f-tb-3', field: 'bollingerPosition', operator: 'eq', value: 'Within', enabled: true, label: 'Bollinger Within Bands', category: 'Technical' },
      { id: 'f-tb-4', field: 'macdSignal', operator: 'eq', value: 'Bullish', enabled: true, label: 'MACD Bullish', category: 'Technical' },
    ],
  },
];
