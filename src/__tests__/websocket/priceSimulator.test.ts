import { describe, it, expect } from 'vitest';
import { simulateNextPrice, simulateSectorMovement } from '@/lib/priceSimulator';
import { generateMockStocks } from '@/lib/mockDataGenerator';

describe('Price Simulation Engine (GBM Model)', () => {
  it('generates non-negative realistic prices using Brownian motion', () => {
    let price = 1000;
    for (let i = 0; i < 50; i++) {
      price = simulateNextPrice(price, 0.02, 0.0001, 1 / 252);
      expect(price).toBeGreaterThan(0);
      expect(Number.isFinite(price)).toBe(true);
    }
  });

  it('generates correlated updates for sector stocks', () => {
    const universe = generateMockStocks(30);
    const updates = simulateSectorMovement(universe, 0.65);

    expect(updates.size).toBe(universe.length);
    const firstUpdate = updates.get(universe[0].symbol);
    expect(firstUpdate).toBeDefined();
    expect(firstUpdate!.lastPrice).toBeGreaterThan(0);
    expect(firstUpdate!.changePercent).toBeDefined();
  });
});
