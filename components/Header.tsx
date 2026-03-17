'use client';

import type { ViewCurrency } from '@/lib/utils';

interface HeaderProps {
  viewCurrency: ViewCurrency;
  onCurrencyChange: (c: ViewCurrency) => void;
  exchangeRate: number;
  exchangeSource: string;
  onNewTrade: () => void;
}

export default function Header({
  viewCurrency,
  onCurrencyChange,
  exchangeRate,
  exchangeSource,
  onNewTrade,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-lime/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2 13L6 5L10 10L14 3L16 7"
                  stroke="#b8f53d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-display font-medium text-lg tracking-tight">
              folio<span className="text-accent-lime">_</span>
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Exchange rate badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1 text-xs text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              USD/ARS {exchangeRate.toLocaleString('es-AR')}
              {exchangeSource && (
                <span className="text-text-muted">({exchangeSource})</span>
              )}
            </div>

            {/* Currency toggle */}
            <div className="flex bg-surface-1 rounded-lg p-0.5">
              <button
                onClick={() => onCurrencyChange('USD')}
                className={`px-3 py-1.5 rounded-md text-xs font-display font-medium transition-all ${
                  viewCurrency === 'USD'
                    ? 'bg-surface-3 text-accent-cyan'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => onCurrencyChange('ARS')}
                className={`px-3 py-1.5 rounded-md text-xs font-display font-medium transition-all ${
                  viewCurrency === 'ARS'
                    ? 'bg-surface-3 text-accent-cyan'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                ARS
              </button>
            </div>

            {/* New trade button (desktop) */}
            <button
              onClick={onNewTrade}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent-lime text-surface-0 rounded-lg text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-all"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Operación
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
