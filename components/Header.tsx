'use client';

import { useState } from 'react';
import type { ViewCurrency } from '@/lib/utils';

interface HeaderProps {
  viewCurrency: ViewCurrency;
  onCurrencyChange: (c: ViewCurrency) => void;
  exchangeRate: number;
  exchangeSource: string;
  onNewTrade: () => void;
  lastPriceFetch: Date | null;
  onRefreshPrices: () => void;
  pricesLoading: boolean;
  username: string;
  onLogout: () => void;
}

export default function Header({
  viewCurrency,
  onCurrencyChange,
  exchangeRate,
  exchangeSource,
  onNewTrade,
  lastPriceFetch,
  onRefreshPrices,
  pricesLoading,
  username,
  onLogout,
}: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

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
              Alinversion<span className="text-accent-lime">_</span>
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Exchange rate badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1 text-xs text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              USD/ARS {exchangeRate.toLocaleString('es-AR')}
              {exchangeSource && (
                <span className="text-text-muted">({exchangeSource})</span>
              )}
            </div>

            {/* Refresh prices */}
            <button
              onClick={onRefreshPrices}
              disabled={pricesLoading}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-1 text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
              title={lastPriceFetch ? `Última actualización: ${lastPriceFetch.toLocaleTimeString('es-AR')}` : 'Actualizar precios'}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={pricesLoading ? 'animate-spin' : ''}
              >
                <path d="M1 7a6 6 0 0111.196-3M13 7A6 6 0 011.804 10" />
                <path d="M13 1v3h-3M1 13v-3h3" />
              </svg>
              {lastPriceFetch ? lastPriceFetch.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'Precios'}
            </button>

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

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1 hover:bg-surface-2 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-accent-lime/20 flex items-center justify-center text-accent-lime text-xs font-display font-medium">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs text-text-secondary">{username}</span>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface-2 border border-white/[0.06] rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.04]">
                      <p className="text-sm font-medium text-text-primary">{username}</p>
                      <p className="text-xs text-text-muted mt-0.5">Portfolio personal</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-accent-red hover:bg-white/[0.03] transition-colors flex items-center gap-2"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5 1H3a2 2 0 00-2 2v8a2 2 0 002 2h2M8 10l3-3-3-3M11 7H5" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
