export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');
    const type = searchParams.get('type');

    const where: any = { userId: session.userId };
    if (assetId) where.assetId = assetId;
    if (type) where.asset = { type };

    const trades = await prisma.trade.findMany({
      where,
      include: { asset: true },
      orderBy: { executedAt: 'desc' },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('GET /api/trades error:', error);
    return NextResponse.json({ error: 'Error fetching trades' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      assetId,
      ticker,
      assetName,
      assetType,
      type,
      quantity,
      pricePerUnit,
      currency,
      exchangeRate,
      fees,
      notes,
      executedAt,
    } = body;

    let resolvedAssetId = assetId;
    if (!resolvedAssetId && ticker && assetName && assetType) {
      const asset = await prisma.asset.upsert({
        where: {
          userId_ticker_type: {
            userId: session.userId,
            ticker: ticker.toUpperCase(),
            type: assetType,
          },
        },
        update: { name: assetName },
        create: {
          userId: session.userId,
          ticker: ticker.toUpperCase(),
          name: assetName,
          type: assetType,
        },
      });
      resolvedAssetId = asset.id;
    }

    if (!resolvedAssetId) {
      return NextResponse.json({ error: 'assetId or (ticker + assetName + assetType) required' }, { status: 400 });
    }

    const trade = await prisma.trade.create({
      data: {
        userId: session.userId,
        assetId: resolvedAssetId,
        type: type || 'BUY',
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        currency: currency || 'ARS',
        exchangeRate: parseFloat(exchangeRate || '1'),
        fees: parseFloat(fees || '0'),
        notes: notes || null,
        executedAt: new Date(executedAt || Date.now()),
      },
      include: { asset: true },
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/trades error:', error?.message || error);
    return NextResponse.json({ error: 'Error creating trade', detail: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    // Only delete if it belongs to the user
    const trade = await prisma.trade.findFirst({ where: { id, userId: session.userId } });
    if (!trade) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    await prisma.trade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/trades error:', error);
    return NextResponse.json({ error: 'Error deleting trade' }, { status: 500 });
  }
}
