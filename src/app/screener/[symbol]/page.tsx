'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, TrendingUp, Building2, Layers } from 'lucide-react';
import { Stock } from '@/types/stock';
import { formatINR, formatMarketCap, formatPercent } from '@/lib/formatters';
import { StockChart } from '@/components/Chart/StockChart';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();
  const [stock, setStock] = useState<Stock | null>(null);
  const [fundamentals, setFundamentals] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const [stockRes, fundRes] = await Promise.all([
          fetch(`/api/stocks/${symbol}`),
          fetch(`/api/stocks/${symbol}/fundamentals`),
        ]);
        if (stockRes.ok) {
          const sJson = await stockRes.json();
          setStock(sJson.data);
        }
        if (fundRes.ok) {
          const fJson = await fundRes.json();
          setFundamentals(fJson.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-sm text-gray-500">Loading {symbol} details...</div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-950 min-h-screen">
        <h2 className="text-lg font-bold">Instrument Not Found</h2>
        <Link href="/" className="mt-4 inline-block text-brand-600 hover:underline text-sm">
          Return to Screener
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Real-Time Screener</span>
        </Link>

        {/* Header Header Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono tracking-tight">{stock.symbol}</h1>
              <span className="text-sm text-gray-500">{stock.companyName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 font-semibold">
                {stock.sector}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
              Industry: {stock.industry} | Cap Category: {stock.marketCapCategory} | Indices:{' '}
              {stock.indexMembership.join(', ') || 'N/A'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-mono">{formatINR(stock.lastPrice)}</div>
            <div
              className={`text-sm font-semibold font-mono ${
                stock.changePercent >= 0 ? 'text-positive' : 'text-negative'
              }`}
            >
              {formatPercent(stock.changePercent)} (₹{stock.changeAbsolute.toFixed(2)})
            </div>
          </div>
        </div>

        {/* Candlestick Chart */}
        <div className="h-[480px]">
          <ErrorBoundary fallbackTitle="Chart Error">
            <StockChart stock={stock} height={460} />
          </ErrorBoundary>
        </div>

        {/* Fundamental Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Market Cap', value: formatMarketCap(stock.marketCap) },
            { label: 'P/E Ratio', value: stock.pe?.toFixed(1) ?? 'N/A' },
            { label: 'P/B Ratio', value: stock.pb.toFixed(1) },
            { label: 'ROE', value: `${stock.roe.toFixed(1)}%` },
            { label: 'ROCE', value: `${stock.roce.toFixed(1)}%` },
            { label: 'Debt to Equity', value: stock.debtToEquity.toFixed(2) },
            { label: 'Dividend Yield', value: `${stock.dividendYield.toFixed(1)}%` },
            { label: 'Promoter Holding', value: `${stock.promoterHolding.toFixed(1)}%` },
            { label: 'Rev Growth YoY', value: `${stock.revenueGrowthYoY.toFixed(1)}%` },
            { label: 'Profit Growth YoY', value: `${stock.profitGrowthYoY.toFixed(1)}%` },
            { label: '52W High', value: formatINR(stock.week52High) },
            { label: '52W Low', value: formatINR(stock.week52Low) },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3"
            >
              <div className="text-[10px] text-gray-500 uppercase font-semibold">{item.label}</div>
              <div className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100 mt-0.5">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Historical Financials P&L and Balance Sheet */}
        {fundamentals && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Profit &amp; Loss Statement (₹ Crores)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500">
                    <th className="py-2 px-3">Metric</th>
                    {fundamentals.pnl.map((p: any) => (
                      <th key={p.year} className="py-2 px-3 text-right">
                        {p.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Revenue</td>
                    {fundamentals.pnl.map((p: any) => (
                      <td key={p.year} className="py-2 px-3 text-right">
                        ₹{p.revenueCr.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Operating Profit</td>
                    {fundamentals.pnl.map((p: any) => (
                      <td key={p.year} className="py-2 px-3 text-right">
                        ₹{p.operatingProfitCr.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Net Profit (PAT)</td>
                    {fundamentals.pnl.map((p: any) => (
                      <td key={p.year} className="py-2 px-3 text-right font-bold text-positive">
                        ₹{p.netProfitCr.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">EPS (₹)</td>
                    {fundamentals.pnl.map((p: any) => (
                      <td key={p.year} className="py-2 px-3 text-right">
                        ₹{p.eps.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
