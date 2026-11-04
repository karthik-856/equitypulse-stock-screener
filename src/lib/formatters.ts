/**
 * Indian Number Formatting and Currency Utilities
 * Conforms to SEBI and Indian market conventions
 */

export function formatIndianNumber(val: number): string {
  if (isNaN(val)) return '0';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const parts = absVal.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = formattedOther + ',' + lastThree;
  }

  const result = decimalPart === '00' ? integerPart : `${integerPart}.${decimalPart}`;
  return isNegative ? `-${result}` : result;
}

export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const parts = absVal.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = formattedOther + ',' + lastThree;
  }

  const formatted = `₹${integerPart}.${decimalPart}`;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatMarketCap(marketCapCr: number): string {
  if (isNaN(marketCapCr) || marketCapCr <= 0) return '₹0 Cr';
  if (marketCapCr >= 100000) {
    const lakhCr = marketCapCr / 100000;
    return `₹${lakhCr.toFixed(2)} LCr`;
  }
  return `₹${formatIndianNumber(marketCapCr)} Cr`;
}

export function formatVolume(volume: number): string {
  if (isNaN(volume) || volume <= 0) return '0';
  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(2)}Cr`;
  }
  if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)}L`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
}

export function formatPercent(val: number): string {
  if (isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}
