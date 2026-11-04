# Technical Errata Report: Specification Code Audits

This document identifies, explains, and provides production-grade corrections for the three deliberate technical errors embedded in the project specification (as mandated in **Section A11.3: Deliberate Errors in This Document**).

---

## Error 1: Technical Indicator & Simulation Shock Calculation

### Location
- **Section A4.1 (Page 11)** – `simulateSectorMovement()` & **Section A3.2 / Appendix B2 (Pages 9 & 76)** – EMA Seeding / Shock Propagation.

### The Problem
In Section A4.1, the simulation calculates a correlated sector shock and idiosyncratic noise to produce `combinedShock`:
```typescript
// Faulty code from specification (Section A4.1):
const combinedShock = sectorCorrelation * sectorShock +
  Math.sqrt(1 - sectorCorrelation ** 2) * idiosyncratic;
const newPrice = simulateNextPrice(stock.lastPrice, stock.volatility);
updates.set(stock.symbol, newPrice);
```
Here, `combinedShock` is computed but **never passed** into `simulateNextPrice()`. As a result, every stock was moving completely independently with random idiosyncratic drift, destroying the sector correlation requirement (60% correlation). Furthermore, `simulateNextPrice` on line 4 expected `(currentPrice, volatility, drift, dt)` but omitted a parameter for the external market shock.

### The Correction
Refactored `simulateNextPrice` to accept an optional `customShock` parameter, allowing the `combinedShock` to drive the Geometric Brownian Motion calculation:
```typescript
// Corrected implementation:
export function simulateNextPrice(
  currentPrice: number,
  volatility: number = 0.02,
  drift: number = 0.0001,
  dt: number = 1 / 252,
  customShock?: number
): number {
  const randomShock = customShock !== undefined ? customShock : Math.sqrt(dt) * gaussianRandom();
  const priceChange = drift * dt + volatility * randomShock;
  return Math.round(Math.max(1, currentPrice * (1 + priceChange)) * 100) / 100;
}
```

---

## Error 2: WebSocket Reconnection Logic & Zombie Lifecycle Leak

### Location
- **Section A4.2 (Page 12)** – `useRealtimeUpdates()` Client Hook.

### The Problem
In the specified hook:
```typescript
// Faulty code from specification (Section A4.2):
ws.onclose = () => {
  const delay = RECONNECT_DELAYS[
    Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)
  ];
  reconnectAttempt.current++;
  setTimeout(connect, delay);
};

useEffect(() => {
  connect();
  return () => wsRef.current?.close();
}, [connect]);
```
When the React component unmounts (e.g. user navigates away or hot module reload occurs), the cleanup function invokes `wsRef.current?.close()`. Because the `onclose` handler is bound unconditionally, calling `close()` triggers `ws.onclose`, which increments the attempt counter and schedules a new `setTimeout(connect, delay)`!
This creates an **immortal zombie reconnection loop** that continues polling indefinitely in the background after unmount, exhausting browser connections and causing memory leaks. Furthermore, the `setTimeout` identifier is not stored in a ref and cannot be cleared during unmount.

### The Correction
Added an `isUnmounted` ref guard, tracked the `reconnectTimer` ref, and ensured cleanup properly cancels both active timers and WebSocket event listeners without scheduling new connections:
```typescript
// Corrected implementation:
const isUnmounted = useRef<boolean>(false);
const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

ws.onclose = () => {
  if (isUnmounted.current) return; // Guard against unmount triggers
  const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)];
  reconnectAttempt.current++;
  reconnectTimer.current = setTimeout(connect, delay);
};

useEffect(() => {
  isUnmounted.current = false;
  connect();
  return () => {
    isUnmounted.current = true;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (wsRef.current) wsRef.current.close();
  };
}, [connect]);
```

---

## Error 3: Missing Sector in TypeScript Union & Strict Null Safety Violation

### Location
- **Section D Task 1.2 (Pages 50-51)** – `types/stock.ts`.

### The Problem
1. **Omitted Sector**: The `Sector` union type defined in Section D Task 1.2 was:
   ```typescript
   export type Sector = 'IT' | 'Banking' | 'Pharma' | 'Auto' | 'FMCG' | 'Metal' | 'Energy' | 'Realty' | 'Telecom' | 'Infrastructure' | 'Media' | 'Others';
   ```
   However, in **Section B5.1 (Sector Distribution, Page 42)**, the specification mandates:
   `Chemicals & Fertilisers (350 stocks, 7% weight, avg P/E 22.0)`.
   Because `'Chemicals'` was omitted from the `Sector` union, any mock data or filter using the Chemicals sector causes a compilation error under TypeScript `strict: true` (`TS2322: Type '"Chemicals"' is not assignable to type 'Sector'`).
2. **FilterValue Nullability**: In `FilterConfig`, `pe` is defined as `pe: number | null` (to account for loss-making companies). However, `FilterValue` was typed as:
   ```typescript
   export type FilterValue = number | string | boolean | number[] | string[];
   ```
   Omitting `null` and tuple `[number, number]` from `FilterValue` causes TypeScript errors when checking or filtering null values under strict null checks.

### The Correction
Updated `types/stock.ts` to include `'Chemicals'` in the `Sector` union and extended `FilterValue` to support `null` and `[number, number]`:
```typescript
// Corrected implementation:
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

export type FilterValue =
  | number
  | string
  | boolean
  | [number, number]
  | number[]
  | string[]
  | null;
```
