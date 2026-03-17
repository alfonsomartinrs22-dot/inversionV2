export type ViewCurrency = 'ARS' | 'USD';

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPct: number;
  currency: ViewCurrency;
}

export interface HoldingRow {
  id: string;
  ticker: string;
  name: string;
  type: 'CEDEAR' | 'CRYPTO';
  quantity: number;
  avgCost: number;
  totalCost: number;
  currentPrice: number | null;
  currentValue: number | null;
  returnPct: number | null;
  returnAbs: number | null;
  currency: ViewCurrency;
}

export interface TradeRow {
  id: string;
  ticker: string;
  name: string;
  type: 'CEDEAR' | 'CRYPTO';
  tradeType: 'BUY' | 'SELL';
  quantity: number;
  pricePerUnit: number;
  currency: 'ARS' | 'USD';
  exchangeRate: number;
  fees: number;
  notes: string | null;
  executedAt: string;
}

export function formatMoney(value: number, currency: ViewCurrency): string {
  const prefix = currency === 'USD' ? 'US$' : '$';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${value < 0 ? '-' : ''}${prefix}${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${value < 0 ? '-' : ''}${prefix}${abs.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${value < 0 ? '-' : ''}${prefix}${abs.toFixed(2)}`;
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
