import { describe, it, expect } from 'vitest';
import {
  formatIndianNumber,
  formatINR,
  formatMarketCap,
  formatVolume,
  formatPercent,
} from '@/lib/formatters';

describe('Indian Number & Currency Formatters (Appendix C4)', () => {
  it('formats Indian numbers with commas after hundreds and then thousands', () => {
    expect(formatIndianNumber(100000)).toBe('1,00,000');
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
    expect(formatIndianNumber(1000000000)).toBe('1,00,00,00,000');
  });

  it('formats INR with currency symbol and 2 decimals', () => {
    expect(formatINR(2450.75)).toBe('₹2,450.75');
    expect(formatINR(100000.5)).toBe('₹1,00,000.50');
  });

  it('formats volume with L (Lakh), Cr (Crore), K (Thousand)', () => {
    expect(formatVolume(12000000)).toBe('1.20Cr');
    expect(formatVolume(4500000)).toBe('45.00L');
    expect(formatVolume(85000)).toBe('85.0K');
  });

  it('formats market cap in Crores and Lakh Crores', () => {
    expect(formatMarketCap(25000)).toBe('₹25,000 Cr');
    expect(formatMarketCap(150000)).toBe('₹1.50 LCr');
  });

  it('formats percentages with +/- signs', () => {
    expect(formatPercent(2.45)).toBe('+2.45%');
    expect(formatPercent(-1.8)).toBe('-1.80%');
    expect(formatPercent(0)).toBe('0.00%');
  });
});
