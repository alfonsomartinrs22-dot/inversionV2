'use client';

import { formatMoney, type ViewCurrency, type HoldingRow, cn } from '@/lib/utils';

interface Props {
  holdings: HoldingRow[];
  currency: ViewCurrency;
  exchangeRate: number;
}

export default function HoldingsTable({ holdings, currency, exchangeRate }: Props) {
  if (holdings.length === 0) return null;

  const cedears = holdings.filter((h) => h.type === 'CEDEAR');
  const cryptos = holdings.filter((h) => h.type === 'CRYPTO');

  const renderSection = (title: string, items: HoldingRow[], accentColor: string) => {
    if (items.length === 0) return null;

    return (
      <div className="glass-card rounded-xl overflow-hidden animate-in">
        <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${accentColor}`} />
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="text-xs text-text-muted ml-auto">{items.length} activos</span>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Ticker</th>
                <th className="text-left px-5 py-3 font-medium">Nombre</th>
                <th className="text-right px-5 py-3 font-medium">Cantidad</th>
                <th className="text-right px-5 py-3 font-medium">Costo prom.</th>
                <th className="text-right px-5 py-3 font-medium">Total invertido</th>
              </tr>
            </thead>
            <tbody>
              {items.map((h, i) => (
                <tr
                  key={h.id}
                  className={cn(
                    'border-t border-white/[0.02] hover:bg-white/[0.02] transition-colors',
                    `animate-in stagger-${Math.min(i + 1, 6)}`
                  )}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-display font-medium text-text-primary">
                      {h.ticker}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{h.name}</td>
                  <td className="px-5 py-3.5 text-right font-display text-text-primary">
                    {h.quantity.toLocaleString('es-AR', {
                      minimumFractionDigits: h.type === 'CRYPTO' ? 4 : 0,
                      maximumFractionDigits: h.type === 'CRYPTO' ? 8 : 0,
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-right font-display text-text-secondary">
                    {formatMoney(h.avgCost, currency)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-display text-text-primary font-medium">
                    {formatMoney(h.totalCost, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-white/[0.03]">
          {items.map((h) => (
            <div key={h.id} className="px-5 py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-display font-medium text-text-primary">
                    {h.ticker}
                  </span>
                  <p className="text-xs text-text-muted mt-0.5">{h.name}</p>
                </div>
                <span className="font-display font-medium text-text-primary">
                  {formatMoney(h.totalCost, currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary">
                <span>
                  {h.quantity.toLocaleString('es-AR', {
                    minimumFractionDigits: h.type === 'CRYPTO' ? 4 : 0,
                    maximumFractionDigits: h.type === 'CRYPTO' ? 6 : 0,
                  })}{' '}
                  unidades
                </span>
                <span>Prom. {formatMoney(h.avgCost, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderSection('CEDEARs', cedears, 'bg-accent-cyan')}
      {renderSection('Cripto', cryptos, 'bg-accent-orange')}
    </div>
  );
}
