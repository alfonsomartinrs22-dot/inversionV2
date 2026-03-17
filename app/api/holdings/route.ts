export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const viewCurrency = (searchParams.get('currency') || 'USD') as 'ARS' | 'USD';
    const currentRate = parseFloat(searchParams.get('exchangeRate') || '1200');

    const assets = await prisma.asset.findMany({
      where: { userId: session.userId },
      include: {
        trades: { orderBy: { executedAt: 'asc' } },
      },
    });

    const holdings = assets
      .map((asset) => {
        let totalQty = 0;
        let totalCostUSD = 0;

        for (const trade of asset.trades) {
          const costInUSD =
            trade.currency === 'USD'
              ? trade.pricePerUnit
              : trade.pricePerUnit / trade.exchangeRate;

          if (trade.type === 'BUY') {
            totalQty += trade.quantity;
            totalCostUSD += trade.quantity * costInUSD + (trade.currency === 'USD' ? trade.fees : trade.fees / trade.exchangeRate);
          } else {
            totalQty -= trade.quantity;
            totalCostUSD -= trade.quantity * costInUSD;
          }
        }

        if (totalQty <= 0.000001) return null;

        const avgCostUSD = totalCostUSD / totalQty;

        // Convert to view currency
        const avgCost = viewCurrency === 'USD' ? avgCostUSD : avgCostUSD * currentRate;
        const totalCost = viewCurrency === 'USD' ? totalCostUSD : totalCostUSD * currentRate;

        return {
          id: asset.id,
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type,
          quantity: totalQty,
          avgCost,
          totalCost,
          currentPrice: null, // to be filled by client with market data
          currentValue: null,
          returnPct: null,
          returnAbs: null,
          currency: viewCurrency,
        };
      })
      .filter(Boolean);

    return NextResponse.json(holdings);
  } catch (error) {
    console.error('GET /api/holdings error:', error);
    return NextResponse.json({ error: 'Error calculating holdings' }, { status: 500 });
  }
}
