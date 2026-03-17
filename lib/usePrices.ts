'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export interface PriceData {
  ticker: string;
  type: string;
  priceARS: number | null;
  priceUSD: number | null;
  prevCloseARS: number | null;
  prevCloseUSD: number | null;
  dailyChangePct: number | null;
}

interface PriceResponse {
  prices: Record<string, PriceData>;
  exchangeRate: number;
  fetchedAt: string;
}

const REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes

export function usePrices(
  tickers: { ticker: string; type: string }[],
  exchangeRate: number
) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stabilize the ticker key so it doesn't change on every render
  const tickerKey = useMemo(
    () => tickers.map((t) => `${t.ticker}:${t.type}`).join(','),
    [tickers]
  );

  const fetchPrices = useCallback(async () => {
    if (!tickerKey) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/prices?tickers=${encodeURIComponent(tickerKey)}&exchangeRate=${exchangeRate}`
      );
      if (!res.ok) throw new Error('Failed to fetch prices');
      const data: PriceResponse = await res.json();
      setPrices(data.prices);
      setLastFetch(new Date(data.fetchedAt));
    } catch (err: any) {
      setError(err.message || 'Error fetching prices');
    } finally {
      setLoading(false);
    }
  }, [tickerKey, exchangeRate]);

  // Initial fetch + auto-refresh every 20 min
  useEffect(() => {
    fetchPrices();

    intervalRef.current = setInterval(fetchPrices, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPrices]);

  return { prices, lastFetch, loading, error, refetch: fetchPrices };
}
