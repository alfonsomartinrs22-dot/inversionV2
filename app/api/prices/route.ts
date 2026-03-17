export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// ─── IOL Auth Token Management ───
let iolToken: string | null = null;
let iolRefreshToken: string | null = null;
let iolTokenExpiry = 0;

async function getIOLToken(): Promise<string | null> {
  const user = process.env.IOL_USERNAME;
  const pass = process.env.IOL_PASSWORD;

  if (!user || !pass) return null;

  // If token is still valid, reuse it
  if (iolToken && Date.now() < iolTokenExpiry) {
    return iolToken;
  }

  // Try refresh first
  if (iolRefreshToken) {
    try {
      const res = await fetch('https://api.invertironline.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(iolRefreshToken)}`,
      });
      if (res.ok) {
        const data = await res.json();
        iolToken = data.access_token;
        iolRefreshToken = data.refresh_token;
        iolTokenExpiry = Date.now() + (data.expires_in || 900) * 1000 - 30000; // 30s buffer
        return iolToken;
      }
    } catch {}
  }

  // Fresh login
  try {
    const res = await fetch('https://api.invertironline.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=password&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`,
    });
    if (!res.ok) return null;
    const data = await res.json();
    iolToken = data.access_token;
    iolRefreshToken = data.refresh_token;
    iolTokenExpiry = Date.now() + (data.expires_in || 900) * 1000 - 30000;
    return iolToken;
  } catch {
    return null;
  }
}

// ─── IOL: Fetch CEDEAR price ───
async function fetchCEDEARPrice(ticker: string): Promise<{
  priceARS: number | null;
  priceUSD: number | null;
  prevCloseARS: number | null;
  variation: number | null;
} | null> {
  const token = await getIOLToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `https://api.invertironline.com/api/v2/bCBA/Titulos/${encodeURIComponent(ticker)}/Cotizacion`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    return {
      priceARS: data.ultimoPrecio ?? null,
      priceUSD: null, // will be calculated with exchange rate
      prevCloseARS: data.cierreAnterior ?? null,
      variation: data.variacionPorcentual ?? data.variacion ?? null,
    };
  } catch {
    return null;
  }
}

// ─── Binance: Fetch crypto price ───
async function fetchCryptoPrice(ticker: string): Promise<{
  priceUSD: number | null;
  prevCloseUSD: number | null;
  variation: number | null;
} | null> {
  // Map common ticker names to Binance pairs
  const symbol = ticker.toUpperCase();
  const pair = `${symbol}USDT`;

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`
    );

    if (!res.ok) {
      // Try without the T (e.g., USDC)
      const altRes = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USD`
      );
      if (!altRes.ok) return null;
      const altData = await altRes.json();
      return {
        priceUSD: parseFloat(altData.lastPrice) || null,
        prevCloseUSD: parseFloat(altData.prevClosePrice) || null,
        variation: parseFloat(altData.priceChangePercent) || null,
      };
    }

    const data = await res.json();
    return {
      priceUSD: parseFloat(data.lastPrice) || null,
      prevCloseUSD: parseFloat(data.prevClosePrice) || null,
      variation: parseFloat(data.priceChangePercent) || null,
    };
  } catch {
    return null;
  }
}

// ─── Main handler ───
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tickers = searchParams.get('tickers'); // comma-separated: MELI:CEDEAR,BTC:CRYPTO
    const exchangeRate = parseFloat(searchParams.get('exchangeRate') || '1200');

    if (!tickers) {
      return NextResponse.json({ error: 'tickers param required (e.g., MELI:CEDEAR,BTC:CRYPTO)' }, { status: 400 });
    }

    const items = tickers.split(',').map((t) => {
      const [ticker, type] = t.split(':');
      return { ticker: ticker.trim(), type: type?.trim() || 'CEDEAR' };
    });

    const results: Record<string, {
      ticker: string;
      type: string;
      priceARS: number | null;
      priceUSD: number | null;
      prevCloseARS: number | null;
      prevCloseUSD: number | null;
      dailyChangePct: number | null;
    }> = {};

    // Process all tickers in parallel
    await Promise.all(
      items.map(async ({ ticker, type }) => {
        if (type === 'CRYPTO') {
          const data = await fetchCryptoPrice(ticker);
          results[`${ticker}:${type}`] = {
            ticker,
            type,
            priceARS: data?.priceUSD ? data.priceUSD * exchangeRate : null,
            priceUSD: data?.priceUSD ?? null,
            prevCloseARS: data?.prevCloseUSD ? data.prevCloseUSD * exchangeRate : null,
            prevCloseUSD: data?.prevCloseUSD ?? null,
            dailyChangePct: data?.variation ?? null,
          };
        } else {
          // CEDEAR
          const data = await fetchCEDEARPrice(ticker);
          results[`${ticker}:${type}`] = {
            ticker,
            type,
            priceARS: data?.priceARS ?? null,
            priceUSD: data?.priceARS ? data.priceARS / exchangeRate : null,
            prevCloseARS: data?.prevCloseARS ?? null,
            prevCloseUSD: data?.prevCloseARS ? data.prevCloseARS / exchangeRate : null,
            dailyChangePct: data?.variation ?? null,
          };
        }
      })
    );

    return NextResponse.json({
      prices: results,
      exchangeRate,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/prices error:', error);
    return NextResponse.json({ error: 'Error fetching prices' }, { status: 500 });
  }
}
