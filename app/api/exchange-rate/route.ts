export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch dólar MEP (bolsa) rate
    const res = await fetch('https://dolarapi.com/v1/dolares/bolsa', {
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      // Fallback to CCL
      const fallback = await fetch('https://dolarapi.com/v1/dolares/contadoconliqui', {
        next: { revalidate: 300 },
      });
      if (!fallback.ok) throw new Error('Failed to fetch rate');
      const data = await fallback.json();
      return NextResponse.json({
        buy: data.compra,
        sell: data.venta,
        source: 'CCL',
        updatedAt: data.fechaActualizacion,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      buy: data.compra,
      sell: data.venta,
      source: 'MEP',
      updatedAt: data.fechaActualizacion,
    });
  } catch (error) {
    console.error('GET /api/exchange-rate error:', error);
    return NextResponse.json({
      buy: 1200,
      sell: 1250,
      source: 'fallback',
      updatedAt: new Date().toISOString(),
    });
  }
}
