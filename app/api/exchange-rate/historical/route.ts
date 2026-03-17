export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json({ error: 'date param required (YYYY-MM-DD)' }, { status: 400 });
    }

    // Convert YYYY-MM-DD to YYYY/MM/DD for ArgentinaDatos API
    const formattedDate = date.replace(/-/g, '/');

    // Try fetching MEP (bolsa) rate for the exact date
    let rate = await fetchRate('bolsa', formattedDate);

    // If exact date not found (weekend/holiday), try previous days
    if (!rate) {
      const d = new Date(date + 'T12:00:00');
      for (let i = 1; i <= 5; i++) {
        d.setDate(d.getDate() - 1);
        const fallbackDate = d.toISOString().split('T')[0].replace(/-/g, '/');
        rate = await fetchRate('bolsa', fallbackDate);
        if (rate) break;
      }
    }

    // Last resort: try CCL
    if (!rate) {
      rate = await fetchRate('contadoconliqui', formattedDate);
    }

    if (!rate) {
      // Return current rate as fallback
      try {
        const currentRes = await fetch('https://dolarapi.com/v1/dolares/bolsa');
        if (currentRes.ok) {
          const currentData = await currentRes.json();
          return NextResponse.json({
            buy: currentData.compra,
            sell: currentData.venta,
            date,
            source: 'MEP actual (fecha no encontrada)',
          });
        }
      } catch {}

      return NextResponse.json({
        buy: null,
        sell: null,
        date,
        source: 'no encontrado',
      });
    }

    return NextResponse.json({
      buy: rate.compra,
      sell: rate.venta,
      date: rate.fecha || date,
      source: 'MEP histórico',
    });
  } catch (error) {
    console.error('GET /api/exchange-rate/historical error:', error);
    return NextResponse.json({ error: 'Error fetching historical rate' }, { status: 500 });
  }
}

async function fetchRate(casa: string, date: string): Promise<{
  compra: number;
  venta: number;
  fecha?: string;
} | null> {
  try {
    const res = await fetch(
      `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}/${date}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();

    // API may return a single object or array
    if (Array.isArray(data)) {
      if (data.length === 0) return null;
      const last = data[data.length - 1];
      return { compra: last.compra, venta: last.venta, fecha: last.fecha };
    }

    if (data && data.venta) {
      return { compra: data.compra, venta: data.venta, fecha: data.fecha };
    }

    return null;
  } catch {
    return null;
  }
}
