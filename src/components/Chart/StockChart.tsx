'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  LineStyle,
  CrosshairMode,
  UTCTimestamp,
} from 'lightweight-charts';
import { OHLCVCandle, calculateSMA, calculateEMA, calculateBollingerBands, calculateRSI, calculateVolumeProfile, VolumeProfileBucket } from '@/lib/indicators';
import { generateOHLCV, aggregateOHLCV } from '@/lib/ohlcvGenerator';
import { formatINR, formatPercent, formatVolume } from '@/lib/formatters';
import { useStockStore } from '@/stores/stockStore';
import { Stock } from '@/types/stock';
import {
  Camera,
  Maximize2,
  Minimize2,
  Table as TableIcon,
  RotateCcw,
  Sliders,
  Layers,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

interface StockChartProps {
  stock: Stock | null;
  height?: number;
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export function StockChart({ stock, height = 480 }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Overlay Series Refs
  const sma20Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const sma200Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema12Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema26Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Timeframe state
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [showDataTable, setShowDataTable] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [volumeProfileBuckets, setVolumeProfileBuckets] = useState<VolumeProfileBucket[]>([]);
  const [crosshairData, setCrosshairData] = useState<OHLCVCandle | null>(null);

  // Active indicator toggles
  const [indicators, setIndicators] = useState({
    sma20: true,
    sma50: true,
    sma200: false,
    ema12: false,
    ema26: false,
    bollinger: true,
    rsi: true,
    volumeProfile: true,
  });

  const [isIndicatorMenuOpen, setIsIndicatorMenuOpen] = useState(false);

  // Zustand selections
  const highContrast = useStockStore((s) => s.highContrastMode);
  const darkMode = useStockStore((s) => s.darkMode);
  const livePrices = useStockStore((s) => s.livePrices);

  // Generate historical base data for the selected stock
  const rawCandles = useMemo(() => {
    if (!stock) return [];
    return generateOHLCV(stock.lastPrice, 252, (stock.beta * 0.02), stock.volume);
  }, [stock?.symbol]);

  // Aggregate candles based on timeframe
  const candles = useMemo(() => {
    return aggregateOHLCV(rawCandles, timeframe);
  }, [rawCandles, timeframe]);

  // Calculate indicators from scratch
  const calculatedIndicators = useMemo(() => {
    if (candles.length === 0) {
      return {
        sma20: [],
        sma50: [],
        sma200: [],
        ema12: [],
        ema26: [],
        bollinger: [],
        rsi: [],
        volumeProfile: [],
      };
    }
    const closes = candles.map((c) => c.close);
    return {
      sma20: calculateSMA(closes, 20),
      sma50: calculateSMA(closes, 50),
      sma200: calculateSMA(closes, 200),
      ema12: calculateEMA(closes, 12),
      ema26: calculateEMA(closes, 26),
      bollinger: calculateBollingerBands(candles, 20, 2),
      rsi: calculateRSI(candles, 14),
      volumeProfile: calculateVolumeProfile(candles, 35),
    };
  }, [candles]);

  useEffect(() => {
    setVolumeProfileBuckets(calculatedIndicators.volumeProfile);
  }, [calculatedIndicators.volumeProfile]);

  // Palette settings
  const candleUp = highContrast ? '#06B6D4' : '#22C55E';
  const candleDown = highContrast ? '#EC4899' : '#EF4444';
  const bg = darkMode ? '#111827' : '#ffffff';
  const textColor = darkMode ? '#9CA3AF' : '#4B5563';
  const gridColor = darkMode ? '#1F2937' : '#F3F4F6';

  // Initialize Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current || showDataTable) return;

    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isFullScreen ? window.innerHeight - 140 : height,
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: candleUp,
      downColor: candleDown,
      borderUpColor: candleUp,
      borderDownColor: candleDown,
      wickUpColor: candleUp,
      wickDownColor: candleDown,
    });
    candlestickSeriesRef.current = candleSeries;

    // Format candle data for Lightweight Charts
    const formattedCandles = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeries.setData(formattedCandles);

    // SMA 20 Overlay
    if (indicators.sma20) {
      const sma20 = chart.addLineSeries({
        color: '#3B82F6',
        lineWidth: 2,
        title: 'SMA 20',
      });
      sma20Ref.current = sma20;
      const data = candles
        .map((c, i) => {
          const val = calculatedIndicators.sma20[i];
          return val !== undefined ? { time: c.time as UTCTimestamp, value: val } : null;
        })
        .filter((item): item is { time: UTCTimestamp; value: number } => item !== null);
      sma20.setData(data);
    }

    // SMA 50 Overlay
    if (indicators.sma50) {
      const sma50 = chart.addLineSeries({
        color: '#F97316',
        lineWidth: 2,
        title: 'SMA 50',
      });
      sma50Ref.current = sma50;
      const data = candles
        .map((c, i) => {
          const val = calculatedIndicators.sma50[i];
          return val !== undefined ? { time: c.time as UTCTimestamp, value: val } : null;
        })
        .filter((item): item is { time: UTCTimestamp; value: number } => item !== null);
      sma50.setData(data);
    }

    // SMA 200 Overlay
    if (indicators.sma200) {
      const sma200 = chart.addLineSeries({
        color: '#8B5CF6',
        lineWidth: 2,
        title: 'SMA 200',
      });
      sma200Ref.current = sma200;
      const data = candles
        .map((c, i) => {
          const val = calculatedIndicators.sma200[i];
          return val !== undefined ? { time: c.time as UTCTimestamp, value: val } : null;
        })
        .filter((item): item is { time: UTCTimestamp; value: number } => item !== null);
      sma200.setData(data);
    }

    // EMA 12 Overlay
    if (indicators.ema12) {
      const ema12 = chart.addLineSeries({
        color: '#06B6D4',
        lineWidth: 2,
        title: 'EMA 12',
      });
      ema12Ref.current = ema12;
      const data = candles
        .map((c, i) => {
          const val = calculatedIndicators.ema12[i];
          return val !== undefined ? { time: c.time as UTCTimestamp, value: val } : null;
        })
        .filter((item): item is { time: UTCTimestamp; value: number } => item !== null);
      ema12.setData(data);
    }

    // EMA 26 Overlay
    if (indicators.ema26) {
      const ema26 = chart.addLineSeries({
        color: '#EC4899',
        lineWidth: 2,
        title: 'EMA 26',
      });
      ema26Ref.current = ema26;
      const data = candles
        .map((c, i) => {
          const val = calculatedIndicators.ema26[i];
          return val !== undefined ? { time: c.time as UTCTimestamp, value: val } : null;
        })
        .filter((item): item is { time: UTCTimestamp; value: number } => item !== null);
      ema26.setData(data);
    }

    // Bollinger Bands Overlay
    if (indicators.bollinger) {
      const upper = chart.addLineSeries({
        color: '#3B82F6',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'BB Upper',
      });
      const middle = chart.addLineSeries({
        color: '#3B82F6',
        lineWidth: 1,
        title: 'BB Mid',
      });
      const lower = chart.addLineSeries({
        color: '#3B82F6',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'BB Lower',
      });
      bbUpperRef.current = upper;
      bbMiddleRef.current = middle;
      bbLowerRef.current = lower;

      const upperData: { time: UTCTimestamp; value: number }[] = [];
      const midData: { time: UTCTimestamp; value: number }[] = [];
      const lowerData: { time: UTCTimestamp; value: number }[] = [];

      calculatedIndicators.bollinger.forEach((b) => {
        if (b) {
          upperData.push({ time: b.time as UTCTimestamp, value: b.upper });
          midData.push({ time: b.time as UTCTimestamp, value: b.middle });
          lowerData.push({ time: b.time as UTCTimestamp, value: b.lower });
        }
      });

      upper.setData(upperData);
      middle.setData(midData);
      lower.setData(lowerData);
    }

    // Subscribe to crosshair move for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        setCrosshairData(null);
        return;
      }
      const candle = candles.find((c) => c.time === param.time);
      if (candle) {
        setCrosshairData(candle);
      }
    });

    // Handle container resizing
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullScreen ? window.innerHeight - 140 : height,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, calculatedIndicators, indicators, highContrast, darkMode, isFullScreen, showDataTable, height, candleUp, candleDown, bg, textColor, gridColor]);

  // Live WebSocket price update applied to current candle
  useEffect(() => {
    if (!stock || !candlestickSeriesRef.current || candles.length === 0) return;
    const update = livePrices[stock.symbol];
    if (update) {
      const last = candles[candles.length - 1];
      const updatedCandle = {
        time: last.time as UTCTimestamp,
        open: last.open,
        high: Math.max(last.high, update.lastPrice),
        low: Math.min(last.low, update.lastPrice),
        close: update.lastPrice,
      };
      try {
        candlestickSeriesRef.current.update(updatedCandle);
      } catch (err) {
        // Safe update
      }
    }
  }, [livePrices, stock, candles]);

  // Take screenshot as PNG
  const handleScreenshot = useCallback(() => {
    if (!chartContainerRef.current) return;
    const canvas = chartContainerRef.current.querySelector('canvas');
    if (!canvas) return;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${stock?.symbol || 'chart'}-${timeframe}.png`;
    link.href = imageUri;
    link.click();
  }, [stock?.symbol, timeframe]);

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <p className="text-sm text-gray-500">Select any stock from the grid to display its live technical chart.</p>
      </div>
    );
  }

  const activePrice = livePrices[stock.symbol]?.lastPrice ?? stock.lastPrice;
  const activeChange = livePrices[stock.symbol]?.changePercent ?? stock.changePercent;
  const isUp = activeChange >= 0;

  return (
    <div
      className={`relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden select-none ${
        isFullScreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full'
      }`}
    >
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">
                {stock.symbol}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[180px]">
                {stock.companyName}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-medium text-gray-700 dark:text-gray-300">
                {stock.sector}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono font-bold text-base text-gray-900 dark:text-gray-100">
                {formatINR(activePrice)}
              </span>
              <span
                className={`font-mono text-xs font-semibold ${
                  isUp ? 'text-positive' : 'text-negative'
                }`}
              >
                {formatPercent(activeChange)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
          {(['1D', '1W', '1M', '3M', '1Y', '5Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Tools & Indicators Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Indicators Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsIndicatorMenuOpen(!isIndicatorMenuOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Indicators</span>
            </button>

            {isIndicatorMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-2 z-30 text-xs">
                <div className="font-semibold text-gray-400 px-2 py-1 uppercase text-[10px]">
                  Technical Overlays
                </div>
                {[
                  { key: 'sma20', label: 'SMA (20 Days)', color: '#3B82F6' },
                  { key: 'sma50', label: 'SMA (50 Days)', color: '#F97316' },
                  { key: 'sma200', label: 'SMA (200 Days)', color: '#8B5CF6' },
                  { key: 'ema12', label: 'EMA (12 Days)', color: '#06B6D4' },
                  { key: 'ema26', label: 'EMA (26 Days)', color: '#EC4899' },
                  { key: 'bollinger', label: 'Bollinger Bands (20, 2)', color: '#3B82F6' },
                  { key: 'rsi', label: 'RSI Pane (14 Period)', color: '#8B5CF6' },
                  { key: 'volumeProfile', label: 'Volume Profile', color: '#94A3B8' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() =>
                      setIndicators((prev: any) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.label}</span>
                    </span>
                    {(indicators as any)[item.key] && (
                      <Check className="w-3.5 h-3.5 text-brand-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accessible Table Toggle */}
          <button
            onClick={() => setShowDataTable(!showDataTable)}
            title="Toggle Accessible Data Table View (WCAG)"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          {/* Screenshot PNG */}
          <button
            onClick={handleScreenshot}
            title="Export Chart as PNG"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={handleResetZoom}
            title="Reset Zoom to Fit"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Crosshair Tooltip Info Bar */}
      {crosshairData && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-1 text-[11px] font-mono bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
          <span>Date: {new Date(crosshairData.time * 1000).toLocaleDateString('en-IN')}</span>
          <span>Open: ₹{crosshairData.open.toFixed(2)}</span>
          <span className="text-positive">High: ₹{crosshairData.high.toFixed(2)}</span>
          <span className="text-negative">Low: ₹{crosshairData.low.toFixed(2)}</span>
          <span>Close: ₹{crosshairData.close.toFixed(2)}</span>
          <span>Vol: {formatVolume(crosshairData.volume)}</span>
        </div>
      )}

      {/* Main Chart or Table View */}
      <div className="relative flex-1 min-h-[360px] overflow-hidden">
        {showDataTable ? (
          /* Accessible Data Table View (WCAG Requirement Section A10.2) */
          <div className="h-full overflow-auto p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Accessible OHLCV Data Table ({candles.length} records)
            </h4>
            <table className="w-full text-xs font-mono border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Open (₹)</th>
                  <th className="py-2 px-3">High (₹)</th>
                  <th className="py-2 px-3">Low (₹)</th>
                  <th className="py-2 px-3">Close (₹)</th>
                  <th className="py-2 px-3">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {candles.slice(-50).map((c) => (
                  <tr key={c.time} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-1.5 px-3">
                      {new Date(c.time * 1000).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-1.5 px-3">{c.open.toFixed(2)}</td>
                    <td className="py-1.5 px-3 text-positive">{c.high.toFixed(2)}</td>
                    <td className="py-1.5 px-3 text-negative">{c.low.toFixed(2)}</td>
                    <td className="py-1.5 px-3 font-semibold">{c.close.toFixed(2)}</td>
                    <td className="py-1.5 px-3">{formatVolume(c.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {/* Lightweight Charts Canvas Host */}
            <div
              ref={chartContainerRef}
              className="w-full h-full"
              onDoubleClick={handleResetZoom}
            />

            {/* Volume Profile Overlay (Right-aligned horizontal histogram, Section A3.2 #5) */}
            {indicators.volumeProfile && volumeProfileBuckets.length > 0 && (
              <div className="absolute right-14 top-4 bottom-8 w-28 pointer-events-none flex flex-col justify-between opacity-35 hover:opacity-80 transition-opacity">
                {volumeProfileBuckets.map((bucket, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-end h-full"
                    title={`₹${bucket.priceLower} - ₹${bucket.priceUpper}: ${formatVolume(bucket.volume)}`}
                  >
                    <div
                      className="bg-brand-500 h-[2px] rounded-l"
                      style={{ width: `${bucket.percentage}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* RSI Sub-pane Bar */}
      {indicators.rsi && !showDataTable && (
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-600 dark:text-purple-400">RSI(14):</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {calculatedIndicators.rsi[calculatedIndicators.rsi.length - 1]?.value.toFixed(1) ?? 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>Overbought &gt; 70</span>
            <span>Neutral 30-70</span>
            <span>Oversold &lt; 30</span>
          </div>
        </div>
      )}
    </div>
  );
}
