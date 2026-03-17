'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './Header';
import PortfolioCards from './PortfolioCards';
import HoldingsTable from './HoldingsTable';
import TradeModal from './TradeModal';
import TradesHistory from './TradesHistory';
import EmptyState from './EmptyState';
import LoginScreen from './LoginScreen';
import { usePrices } from '@/lib/usePrices';
import type { ViewCurrency, HoldingRow, TradeRow } from '@/lib/utils';

type Tab = 'portfolio' | 'trades';

export default function Dashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('portfolio');
  const [viewCurrency, setViewCurrency] = useState<ViewCurrency>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1200);
  const [exchangeSource, setExchangeSource] = useState<string>('');
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState<TradeRow | null>(null);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setUsername(data.username);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setUsername(null);
    setHoldings([]);
    setTrades([]);
  };

  // Show login if not authenticated
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!username) {
    return <LoginScreen onLogin={(u) => setUsername(u)} />;
  }

  // Fetch exchange rate
  const fetchExchangeRate = useCallback(async () => {
    try {
      const r = await fetch('/api/exchange-rate');
      const data = await r.json();
      setExchangeRate(data.sell || 1200);
      setExchangeSource(data.source || '');
    } catch {}
  }, []);

  useEffect(() => {
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 20 * 60 * 1000); // refresh every 20 min
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  // Fetch holdings
  const fetchHoldings = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/holdings?currency=${viewCurrency}&exchangeRate=${exchangeRate}`
      );
      const data = await res.json();
      setHoldings(Array.isArray(data) ? data : []);
    } catch {
      setHoldings([]);
    }
  }, [viewCurrency, exchangeRate]);

  // Fetch trades
  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch('/api/trades');
      const data = await res.json();
      const mapped: TradeRow[] = (Array.isArray(data) ? data : []).map((t: any) => ({
        id: t.id,
        ticker: t.asset?.ticker || '',
        name: t.asset?.name || '',
        type: t.asset?.type || 'CEDEAR',
        tradeType: t.type,
        quantity: t.quantity,
        pricePerUnit: t.pricePerUnit,
        currency: t.currency,
        exchangeRate: t.exchangeRate,
        fees: t.fees,
        notes: t.notes,
        executedAt: t.executedAt,
      }));
      setTrades(mapped);
    } catch {
      setTrades([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchHoldings(), fetchTrades()]).finally(() => setLoading(false));
  }, [fetchHoldings, fetchTrades]);

  // Build ticker list for price fetching
  const priceTickers = useMemo(
    () => holdings.map((h) => ({ ticker: h.ticker, type: h.type })),
    [holdings]
  );

  // Fetch live prices with 20-min auto-refresh
  const { prices, lastFetch, loading: pricesLoading, refetch: refetchPrices } = usePrices(
    priceTickers,
    exchangeRate
  );

  // Merge holdings with live prices
  const enrichedHoldings = useMemo(() => {
    return holdings.map((h) => {
      const priceData = prices[`${h.ticker}:${h.type}`];
      if (!priceData) return h;

      const currentPrice =
        viewCurrency === 'USD' ? priceData.priceUSD : priceData.priceARS;
      const prevClose =
        viewCurrency === 'USD' ? priceData.prevCloseUSD : priceData.prevCloseARS;

      const currentValue = currentPrice ? h.quantity * currentPrice : null;
      const returnAbs = currentValue !== null ? currentValue - h.totalCost : null;
      const returnPct =
        h.totalCost > 0 && returnAbs !== null
          ? (returnAbs / h.totalCost) * 100
          : null;

      const prevValue = prevClose ? h.quantity * prevClose : null;
      const dailyReturn =
        currentValue !== null && prevValue !== null
          ? currentValue - prevValue
          : null;
      const dailyReturnPct = priceData.dailyChangePct;

      return {
        ...h,
        currentPrice,
        currentValue,
        returnAbs,
        returnPct,
        dailyReturn,
        dailyReturnPct,
      } as HoldingRow & { dailyReturn: number | null; dailyReturnPct: number | null };
    });
  }, [holdings, prices, viewCurrency]);

  const handleTradeCreated = () => {
    setShowTradeModal(false);
    setEditingTrade(null);
    fetchHoldings();
    fetchTrades();
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm('¿Eliminar esta operación?')) return;
    await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
    fetchHoldings();
    fetchTrades();
  };

  const totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalCurrentValue = enrichedHoldings.reduce(
    (sum, h) => sum + (h.currentValue ?? h.totalCost),
    0
  );
  const totalDailyReturn = enrichedHoldings.reduce(
    (sum, h) => sum + ((h as any).dailyReturn ?? 0),
    0
  );
  const isEmpty = !loading && holdings.length === 0 && trades.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        viewCurrency={viewCurrency}
        onCurrencyChange={setViewCurrency}
        exchangeRate={exchangeRate}
        exchangeSource={exchangeSource}
        onNewTrade={() => {
          setEditingTrade(null);
          setShowTradeModal(true);
        }}
        lastPriceFetch={lastFetch}
        onRefreshPrices={refetchPrices}
        pricesLoading={pricesLoading}
        username={username}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {isEmpty ? (
          <EmptyState onAddTrade={() => setShowTradeModal(true)} />
        ) : (
          <>
            {/* Tab navigation */}
            <div className="flex gap-1 mt-6 mb-6 bg-surface-1 rounded-lg p-1 w-fit">
              <button
                onClick={() => setTab('portfolio')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === 'portfolio'
                    ? 'bg-surface-3 text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setTab('trades')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === 'trades'
                    ? 'bg-surface-3 text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Operaciones
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-accent-lime border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tab === 'portfolio' ? (
              <div className="space-y-6">
                <PortfolioCards
                  holdings={enrichedHoldings}
                  currency={viewCurrency}
                  totalInvested={totalInvested}
                  totalCurrentValue={totalCurrentValue}
                  totalDailyReturn={totalDailyReturn}
                />
                <HoldingsTable
                  holdings={enrichedHoldings}
                  currency={viewCurrency}
                  exchangeRate={exchangeRate}
                />
              </div>
            ) : (
              <TradesHistory
                trades={trades}
                viewCurrency={viewCurrency}
                exchangeRate={exchangeRate}
                onDelete={handleDeleteTrade}
              />
            )}
          </>
        )}
      </main>

      {/* FAB for mobile */}
      <button
        onClick={() => {
          setEditingTrade(null);
          setShowTradeModal(true);
        }}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-accent-lime text-surface-0 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-40"
        aria-label="Nueva operación"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {showTradeModal && (
        <TradeModal
          exchangeRate={exchangeRate}
          onClose={() => {
            setShowTradeModal(false);
            setEditingTrade(null);
          }}
          onCreated={handleTradeCreated}
        />
      )}
    </div>
  );
}
