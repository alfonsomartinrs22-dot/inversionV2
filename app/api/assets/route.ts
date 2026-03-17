import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { ticker: 'asc' },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('GET /api/assets error:', error);
    return NextResponse.json({ error: 'Error fetching assets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, name, type } = body;

    if (!ticker || !name || !type) {
      return NextResponse.json({ error: 'ticker, name, and type are required' }, { status: 400 });
    }

    const asset = await prisma.asset.upsert({
      where: { ticker_type: { ticker: ticker.toUpperCase(), type } },
      update: { name },
      create: { ticker: ticker.toUpperCase(), name, type },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('POST /api/assets error:', error);
    return NextResponse.json({ error: 'Error creating asset' }, { status: 500 });
  }
}
