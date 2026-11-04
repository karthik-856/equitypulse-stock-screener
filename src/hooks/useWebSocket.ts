import { useEffect, useRef, useCallback } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { PriceUpdate, Stock } from '@/types/stock';
import { simulateSectorMovement } from '@/lib/priceSimulator';

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function useWebSocket(universe: Stock[] = []) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef<number>(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const isUnmounted = useRef<boolean>(false);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useStockStore((s) => s.batchUpdatePrices);
  const setWsStatus = useStockStore((s) => s.setWsStatus);
  const pendingUpdates = useRef<Map<string, PriceUpdate>>(new Map());
  const rafId = useRef<number | null>(null);

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.size > 0) {
      batchUpdate(pendingUpdates.current);
      pendingUpdates.current = new Map();
    }
    rafId.current = null;
  }, [batchUpdate]);

  const queueUpdate = useCallback(
    (update: PriceUpdate) => {
      pendingUpdates.current.set(update.symbol, update);
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(flushUpdates);
      }
    },
    [flushUpdates]
  );

  // Client-side Brownian motion simulation fallback
  const startLocalSimulation = useCallback(() => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (universe.length === 0) return;

    setWsStatus('connected');

    simIntervalRef.current = setInterval(() => {
      if (isUnmounted.current) return;

      // Pick a random subset of 20-50 stocks each tick for realistic market cadence
      const subsetSize = 35;
      const subset: Stock[] = [];
      for (let i = 0; i < subsetSize; i++) {
        const randIndex = Math.floor(Math.random() * universe.length);
        subset.push(universe[randIndex]);
      }

      const updates = simulateSectorMovement(subset, 0.65);
      updates.forEach((update) => {
        queueUpdate(update);
      });
    }, 1500);
  }, [universe, setWsStatus, queueUpdate]);

  const connect = useCallback(() => {
    if (isUnmounted.current) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      // Run internal high-fidelity market simulator
      startLocalSimulation();
      return;
    }

    try {
      setWsStatus('reconnecting');
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (isUnmounted.current) {
          ws.close();
          return;
        }
        reconnectAttempt.current = 0;
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: PriceUpdate = JSON.parse(event.data);
          queueUpdate(data);
        } catch (e) {
          // Ignore invalid frames
        }
      };

      ws.onclose = () => {
        if (isUnmounted.current) return;
        setWsStatus('disconnected');

        const delay =
          RECONNECT_DELAYS[
            Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)
          ];
        reconnectAttempt.current++;

        reconnectTimer.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      startLocalSimulation();
    }
  }, [queueUpdate, setWsStatus, startLocalSimulation]);

  useEffect(() => {
    isUnmounted.current = false;
    connect();

    return () => {
      isUnmounted.current = true;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
