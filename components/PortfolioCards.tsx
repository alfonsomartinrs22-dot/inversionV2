'use client';

import { formatMoney, formatPct, type ViewCurrency, type HoldingRow } from '@/lib/utils';

interface Props {
  holdings: HoldingRow[];
  currency: ViewCurrency;
  totalInvested: number;
  totalCurrentValue: number;
  totalDailyReturn: number;
}

export default function PortfolioCards({ holdings, currency, totalInvested, totalCurrentValue, totalDailyReturn }: Props) {
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const dailyReturnPct = totalCurrentValue > 0 && totalCurrentValue !== totalInvested
    ? (totalDailyReturn / (totalCurrentValue - totalDailyReturn)) * 100
    : 0;

  const hasLivePrices = holdings.some((h) => h.currentPrice !== null);

  const cards = [
    {
      label: 'Valor actual',
      value: formatMoney(hasLivePrices ? totalCurrentValue : totalInvested, currency),
      detail: hasLivePrices
        ? `${holdings.length} activos · Invertido: ${formatMoney(totalInvested, currency)}`
        : `${holdings.length} activos · Sin precios en vivo`,
      color: 'text-text-primary',
    },
    {
      label: 'Ganancia total',
      value: hasLivePrices ? formatMoney(totalReturn, currency) : '—',
      detail: hasLivePrices ? formatPct(totalReturnPct) : 'Esperando precios...',
      color: hasLivePrices
        ? totalReturn >= 0
          ? 'text-accent-lime'
          : 'text-accent-red'
        : 'text-text-muted',
      glow: hasLivePrices ? (totalReturn >= 0 ? 'glow-lime' : 'glow-red') : '',
    },
    {
      label: 'Ganancia del día',
      value: hasLivePrices ? formatMoney(totalDailyReturn, currency) : '—',
      detail: hasLivePrices ? formatPct(dailyReturnPct) : 'Esperando precios...',
      color: hasLivePrices
        ? totalDailyReturn >= 0
          ? 'text-accent-cyan'
          : 'text-accent-red'
        : 'text-text-muted',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`glass-card rounded-xl p-5 animate-in stagger-${i + 1} ${card.glow || ''}`}
        >
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">
            {card.label}
          </p>
          <p className={`text-2xl sm:text-3xl font-display font-medium ${card.color} tracking-tight`}>
            {card.value}
          </p>
          <p className={`text-xs mt-2 ${card.color === 'text-text-primary' ? 'text-text-secondary' : card.color}`}>
            {card.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
