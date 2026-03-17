'use client';

import { formatMoney, type ViewCurrency, type TradeRow, cn } from '@/lib/utils';

interface Props {
  trades: TradeRow[];
  viewCurrency: ViewCurrency;
  exchangeRate: number;
  onDelete: (id: string) => void;
}

export default function TradesHistory({ trades, viewCurrency, exchangeRate, onDelete }: Props) {
  if (trades.length === 0) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="text-text-muted">No hay operaciones registradas</p>
      </div>
    );
  }

  // Group by month
  const grouped: Record<string, TradeRow[]> = {};
  trades.forEach((t) => {
    const d = new Date(t.executedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const formatTradeAmount = (trade: TradeRow) => {
    const total = trade.quantity * trade.pricePerUnit + trade.fees;
    if (viewCurrency === trade.currency) {
      return formatMoney(total, viewCurrency);
    }
    // Convert
    if (trade.currency === 'USD' && viewCurrency === 'ARS') {
      return formatMoney(total * trade.exchangeRate, 'ARS');
    }
    if (trade.currency === 'ARS' && viewCurrency === 'USD') {
      return formatMoney(total / trade.exchangeRate, 'USD');
    }
    return formatMoney(total, trade.currency as ViewCurrency);
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, monthTrades]) => {
          const [year, m] = month.split('-');
          const monthLabel = `${monthNames[parseInt(m) - 1]} ${year}`;

          return (
            <div key={month} className="animate-in">
              <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 px-1">
                {monthLabel}
              </h3>
              <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/[0.03]">
                {monthTrades.map((trade) => {
                  const d = new Date(trade.executedAt);
                  const isBuy = trade.tradeType === 'BUY';

                  return (
                    <div
                      key={trade.id}
                      className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Type indicator */}
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          isBuy ? 'bg-accent-lime/10' : 'bg-accent-red/10'
                        )}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke={isBuy ? '#b8f53d' : '#f53d5e'}
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          {isBuy ? (
                            <path d="M8 12V4M5 7l3-3 3 3" />
                          ) : (
                            <path d="M8 4v8M5 9l3 3 3-3" />
                          )}
                        </svg>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-medium text-sm text-text-primary">
                            {trade.ticker}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded',
                              trade.type === 'CEDEAR'
                                ? 'bg-accent-cyan/10 text-accent-cyan'
                                : 'bg-accent-orange/10 text-accent-orange'
                            )}
                          >
                            {trade.type}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {isBuy ? 'Compra' : 'Venta'} ·{' '}
                          {trade.quantity.toLocaleString('es-AR', {
                            maximumFractionDigits: 6,
                          })}{' '}
                          × {trade.currency === 'USD' ? 'US$' : '$'}
                          {trade.pricePerUnit.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      {/* Amount & date */}
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            'font-display font-medium text-sm',
                            isBuy ? 'text-text-primary' : 'text-accent-red'
                          )}
                        >
                          {isBuy ? '' : '-'}
                          {formatTradeAmount(trade)}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {d.toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(trade.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-accent-red/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Eliminar"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 3.5h8M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M9.5 5.5v5a1 1 0 01-1 1h-3a1 1 0 01-1-1v-5" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
