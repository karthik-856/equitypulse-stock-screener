import { Stock } from '@/types/stock';

export function exportStocksToCSV(stocks: Stock[], filename: string = 'equitypulse-stocks.csv') {
  if (stocks.length === 0) return;

  const headers = [
    'Symbol',
    'Company Name',
    'Sector',
    'Industry',
    'Market Cap (Cr)',
    'Last Price (INR)',
    'Day Change (%)',
    'P/E',
    'P/B',
    'ROE (%)',
    'ROCE (%)',
    'Debt to Equity',
    'Volume',
    'RSI (14)',
    '52W High',
    '52W Low',
  ];

  const rows = stocks.map((s) => [
    `"${s.symbol}"`,
    `"${s.companyName.replace(/"/g, '""')}"`,
    `"${s.sector}"`,
    `"${s.industry}"`,
    s.marketCap,
    s.lastPrice,
    s.changePercent,
    s.pe ?? 'N/A',
    s.pb,
    s.roe,
    s.roce,
    s.debtToEquity,
    s.volume,
    s.rsi14,
    s.week52High,
    s.week52Low,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printOrExportPDF(title: string = 'Stock Report') {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
