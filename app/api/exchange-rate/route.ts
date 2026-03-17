export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch blue dollar rate from a public API
    const res = await fetch('https://dolarapi.com/v1/dolares/blue', {
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      // Fallback to crypto dollar
      const fallback = await fetch('https://dolarapi.com/v1/dolares/cripto', {
        next: { revalidate: 300 },
      });
      if (!fallback.ok) throw new Error('Failed to fetch rate');
      const data = await fallback.json();
      return NextResponse.json({
        buy: data.compra,
        sell: data.venta,
        source: 'cripto',
        updatedAt: data.fechaActualizacion,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      buy: data.compra,
      sell: data.venta,
      source: 'blue',
      updatedAt: data.fechaActualizacion,
    });
  } catch (error) {
    console.error('GET /api/exchange-rate error:', error);
    // Return a reasonable fallback
    return NextResponse.json({
      buy: 1200,
      sell: 1250,
      source: 'fallback',
      updatedAt: new Date().toISOString(),
    });
  }
}
