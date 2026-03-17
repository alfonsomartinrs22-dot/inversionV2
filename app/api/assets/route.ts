export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const assets = await prisma.asset.findMany({
      where: { userId: session.userId },
      orderBy: { ticker: 'asc' },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('GET /api/assets error:', error);
    return NextResponse.json({ error: 'Error fetching assets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const { ticker, name, type } = body;

    if (!ticker || !name || !type) {
      return NextResponse.json({ error: 'ticker, name, and type are required' }, { status: 400 });
    }

    const asset = await prisma.asset.upsert({
      where: {
        userId_ticker_type: {
          userId: session.userId,
          ticker: ticker.toUpperCase(),
          type,
        },
      },
      update: { name },
      create: { userId: session.userId, ticker: ticker.toUpperCase(), name, type },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('POST /api/assets error:', error);
    return NextResponse.json({ error: 'Error creating asset' }, { status: 500 });
  }
}
