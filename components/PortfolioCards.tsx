'use client';

import { formatMoney, formatPct, type ViewCurrency, type HoldingRow } from '@/lib/utils';

interface Props {
  holdings: HoldingRow[];
  currency: ViewCurrency;
  totalInvested: number;
}

export default function PortfolioCards({ holdings, currency, totalInvested }: Props) {
  const cedears = holdings.filter((h) => h.type === 'CEDEAR');
  const cryptos = holdings.filter((h) => h.type === 'CRYPTO');

  const cedearCost = cedears.reduce((s, h) => s + h.totalCost, 0);
  const cryptoCost = cryptos.reduce((s, h) => s + h.totalCost, 0);

  const cedearPct = totalInvested > 0 ? (cedearCost / totalInvested) * 100 : 0;
  const cryptoPct = totalInvested > 0 ? (cryptoCost / totalInvested) * 100 : 0;

  const cards = [
    {
      label: 'Total invertido',
      value: formatMoney(totalInvested, currency),
      detail: `${holdings.length} activos`,
      color: 'text-text-primary',
      accent: 'bg-white/5',
    },
    {
      label: 'CEDEARs',
      value: formatMoney(cedearCost, currency),
      detail: `${cedears.length} activos · ${cedearPct.toFixed(0)}%`,
      color: 'text-accent-cyan',
      accent: 'bg-accent-cyan/5',
    },
    {
      label: 'Cripto',
      value: formatMoney(cryptoCost, currency),
      detail: `${cryptos.length} activos · ${cryptoPct.toFixed(0)}%`,
      color: 'text-accent-orange',
      accent: 'bg-accent-orange/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`glass-card rounded-xl p-5 animate-in stagger-${i + 1}`}
        >
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">
            {card.label}
          </p>
          <p className={`text-2xl sm:text-3xl font-display font-medium ${card.color} tracking-tight`}>
            {card.value}
          </p>
          <p className="text-xs text-text-secondary mt-2">{card.detail}</p>

          {/* Mini bar */}
          {i > 0 && totalInvested > 0 && (
            <div className="mt-3 h-1 rounded-full bg-surface-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  i === 1 ? 'bg-accent-cyan' : 'bg-accent-orange'
                }`}
                style={{ width: `${i === 1 ? cedearPct : cryptoPct}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
