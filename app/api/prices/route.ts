export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// ─── Yahoo Finance: Fetch CEDEAR price (ticker.BA) ───
async function fetchCEDEARPrice(ticker: string): Promise<{
  priceARS: number | null;
  prevCloseARS: number | null;
  variation: number | null;
} | null> {
  const yahooTicker = `${ticker.toUpperCase()}.BA`;

  try {
    // Yahoo Finance v8 quote endpoint (public, no auth needed)
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?range=2d&interval=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return null;
    const json = await res.json();

    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const currentPrice = meta?.regularMarketPrice ?? null;
    const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? null;

    let variation: number | null = null;
    if (currentPrice && prevClose && prevClose > 0) {
      variation = ((currentPrice - prevClose) / prevClose) * 100;
    }

    return {
      priceARS: currentPrice,
      prevCloseARS: prevClose,
      variation,
    };
  } catch (err) {
    console.error(`Yahoo Finance error for ${yahooTicker}:`, err);
    return null;
  }
}

// ─── Binance + CoinGecko: Fetch crypto price ───

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', ADA: 'cardano',
  DOT: 'polkadot', AVAX: 'avalanche-2', MATIC: 'matic-network',
  LINK: 'chainlink', UNI: 'uniswap', ATOM: 'cosmos', XRP: 'ripple',
  DOGE: 'dogecoin', SHIB: 'shiba-inu', LTC: 'litecoin', BNB: 'binancecoin',
  NEAR: 'near', ARB: 'arbitrum', OP: 'optimism', FTM: 'fantom',
  ALGO: 'algorand', MANA: 'decentraland', SAND: 'the-sandbox',
  APE: 'apecoin', AAVE: 'aave', CRV: 'curve-dao-token', LDO: 'lido-dao',
  PEPE: 'pepe', WIF: 'dogwifcoin', RENDER: 'render-token', FET: 'fetch-ai',
  INJ: 'injective-protocol', SUI: 'sui', SEI: 'sei-network', TIA: 'celestia',
  JUP: 'jupiter-exchange-solana', WLD: 'worldcoin-wld', PYTH: 'pyth-network',
};

async function fetchCryptoPrice(ticker: string): Promise<{
  priceUSD: number | null;
  prevCloseUSD: number | null;
  variation: number | null;
} | null> {
  const symbol = ticker.toUpperCase();
  const pair = `${symbol}USDT`;

  // Try Binance first
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (res.ok) {
      const data = await res.json();
      return {
        priceUSD: parseFloat(data.lastPrice) || null,
        prevCloseUSD: parseFloat(data.prevClosePrice) || null,
        variation: parseFloat(data.priceChangePercent) || null,
      };
    }
  } catch {
    // Binance failed, try CoinGecko
  }

  // Fallback: CoinGecko
  const geckoId = COINGECKO_IDS[symbol] || symbol.toLowerCase();
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (res.ok) {
      const data = await res.json();
      const coin = data[geckoId];
      if (coin) {
        const price = coin.usd;
        const change24h = coin.usd_24h_change || 0;
        const prevClose = price / (1 + change24h / 100);
        return {
          priceUSD: price,
          prevCloseUSD: prevClose,
          variation: change24h,
        };
      }
    }
  } catch {
    // CoinGecko also failed
  }

  return null;
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
          // CEDEAR — price comes in ARS from Yahoo Finance (.BA)
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
