import { getCurrency } from '@/constants/currencies';

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0] ?? '0';
  const decPart = parts[1] ?? '00';
  const withGrouping = groupThousands(intPart, currencyCode);
  const formatted = `${currency.symbol}${withGrouping}${decPart === '00' ? '' : `.${decPart}`}`;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatCurrencyCompact(
  amount: number,
  currencyCode: string,
): string {
  const currency = getCurrency(currencyCode);
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}${currency.symbol}${(abs / 10000000).toFixed(2)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}${currency.symbol}${(abs / 100000).toFixed(2)}L`;
  }
  if (abs >= 1000) {
    return `${sign}${currency.symbol}${(abs / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currencyCode);
}

function groupThousands(intPart: string, currencyCode: string): string {
  // Indian numbering (lakh/crore) for INR, standard grouping otherwise.
  if (currencyCode === 'INR') {
    const negative = intPart.startsWith('-');
    let s = negative ? intPart.slice(1) : intPart;
    if (s.length <= 3) return (negative ? '-' : '') + s;
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return (negative ? '-' : '') + `${grouped},${last3}`;
  }
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
