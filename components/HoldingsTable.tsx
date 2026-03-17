'use client';

import { formatMoney, formatPct, type ViewCurrency, type HoldingRow, cn } from '@/lib/utils';

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
                <th className="text-right px-5 py-3 font-medium">Cantidad</th>
                <th className="text-right px-5 py-3 font-medium">Precio actual</th>
                <th className="text-right px-5 py-3 font-medium">Valor actual</th>
                <th className="text-right px-5 py-3 font-medium">Costo total</th>
                <th className="text-right px-5 py-3 font-medium">Ganancia día</th>
                <th className="text-right px-5 py-3 font-medium">Ganancia total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((h, i) => {
                const dailyPct = (h as any).dailyReturnPct;
                const hasPrice = h.currentPrice !== null;
                return (
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
                      <span className="text-text-muted text-xs ml-2">{h.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-display text-text-primary">
                      {h.quantity.toLocaleString('es-AR', {
                        minimumFractionDigits: h.type === 'CRYPTO' ? 4 : 0,
                        maximumFractionDigits: h.type === 'CRYPTO' ? 8 : 0,
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-display text-text-secondary">
                      {hasPrice ? formatMoney(h.currentPrice!, currency) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-display text-text-primary font-medium">
                      {h.currentValue !== null ? formatMoney(h.currentValue, currency) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-display text-text-muted">
                      {formatMoney(h.totalCost, currency)}
                    </td>
                    <td className={cn(
                      'px-5 py-3.5 text-right font-display text-xs',
                      dailyPct > 0 ? 'text-accent-lime' : dailyPct < 0 ? 'text-accent-red' : 'text-text-muted'
                    )}>
                      {dailyPct !== null && dailyPct !== undefined ? formatPct(dailyPct) : '—'}
                    </td>
                    <td className={cn(
                      'px-5 py-3.5 text-right font-display font-medium',
                      h.returnPct !== null
                        ? h.returnPct >= 0
                          ? 'text-accent-lime'
                          : 'text-accent-red'
                        : 'text-text-muted'
                    )}>
                      {h.returnPct !== null ? (
                        <div>
                          <div>{formatMoney(h.returnAbs!, currency)}</div>
                          <div className="text-xs opacity-70">{formatPct(h.returnPct)}</div>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-white/[0.03]">
          {items.map((h) => {
            const dailyPct = (h as any).dailyReturnPct;
            const hasPrice = h.currentPrice !== null;
            return (
              <div key={h.id} className="px-5 py-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-display font-medium text-text-primary">
                      {h.ticker}
                    </span>
                    <p className="text-xs text-text-muted mt-0.5">{h.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-medium text-text-primary">
                      {h.currentValue !== null ? formatMoney(h.currentValue, currency) : formatMoney(h.totalCost, currency)}
                    </span>
                    {h.returnPct !== null && (
                      <p className={cn(
                        'text-xs font-display mt-0.5',
                        h.returnPct >= 0 ? 'text-accent-lime' : 'text-accent-red'
                      )}>
                        {formatPct(h.returnPct)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>
                    {h.quantity.toLocaleString('es-AR', {
                      maximumFractionDigits: h.type === 'CRYPTO' ? 6 : 0,
                    })}{' '}
                    × {hasPrice ? formatMoney(h.currentPrice!, currency) : '—'}
                  </span>
                  <span className={cn(
                    dailyPct > 0 ? 'text-accent-lime' : dailyPct < 0 ? 'text-accent-red' : ''
                  )}>
                    Día: {dailyPct !== null && dailyPct !== undefined ? formatPct(dailyPct) : '—'}
                  </span>
                </div>
              </div>
            );
          })}
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
