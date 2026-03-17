export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');
    const type = searchParams.get('type'); // CEDEAR | CRYPTO

    const where: any = {};
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

    // Auto-create asset if ticker provided instead of assetId
    let resolvedAssetId = assetId;
    if (!resolvedAssetId && ticker && assetName && assetType) {
      const asset = await prisma.asset.upsert({
        where: { ticker_type: { ticker: ticker.toUpperCase(), type: assetType } },
        update: { name: assetName },
        create: { ticker: ticker.toUpperCase(), name: assetName, type: assetType },
      });
      resolvedAssetId = asset.id;
    }

    if (!resolvedAssetId) {
      return NextResponse.json({ error: 'assetId or (ticker + assetName + assetType) required' }, { status: 400 });
    }

    const trade = await prisma.trade.create({
      data: {
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
  } catch (error) {
    console.error('POST /api/trades error:', error);
    return NextResponse.json({ error: 'Error creating trade' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await prisma.trade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/trades error:', error);
    return NextResponse.json({ error: 'Error deleting trade' }, { status: 500 });
  }
}
