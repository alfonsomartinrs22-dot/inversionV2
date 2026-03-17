'use client';

import { useState } from 'react';

interface Props {
  exchangeRate: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function TradeModal({ exchangeRate, onClose, onCreated }: Props) {
  const [assetType, setAssetType] = useState<'CEDEAR' | 'CRYPTO'>('CEDEAR');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [ticker, setTicker] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('USD');
  const [customRate, setCustomRate] = useState(exchangeRate.toString());
  const [fees, setFees] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!ticker.trim() || !assetName.trim() || !quantity || !price) {
      setError('Completá ticker, nombre, cantidad y precio');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.trim(),
          assetName: assetName.trim(),
          assetType,
          type: tradeType,
          quantity,
          pricePerUnit: price,
          currency,
          exchangeRate: customRate || exchangeRate,
          fees: fees || '0',
          notes: notes.trim() || null,
          executedAt: new Date(date).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const totalCost = (parseFloat(quantity) || 0) * (parseFloat(price) || 0) + (parseFloat(fees) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-surface-1 border border-white/[0.06] rounded-t-2xl sm:rounded-2xl animate-fade-up safe-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-surface-1/95 backdrop-blur-sm px-6 py-4 border-b border-white/[0.04] flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Nueva operación</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Asset type & Trade type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Tipo de activo
              </label>
              <div className="flex bg-surface-2 rounded-lg p-0.5">
                {(['CEDEAR', 'CRYPTO'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAssetType(t)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                      assetType === t
                        ? t === 'CEDEAR'
                          ? 'bg-accent-cyan/20 text-accent-cyan'
                          : 'bg-accent-orange/20 text-accent-orange'
                        : 'text-text-muted'
                    }`}
                  >
                    {t === 'CEDEAR' ? 'CEDEAR' : 'Cripto'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Operación
              </label>
              <div className="flex bg-surface-2 rounded-lg p-0.5">
                {(['BUY', 'SELL'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTradeType(t)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                      tradeType === t
                        ? t === 'BUY'
                          ? 'bg-accent-lime/20 text-accent-lime'
                          : 'bg-accent-red/20 text-accent-red'
                        : 'text-text-muted'
                    }`}
                  >
                    {t === 'BUY' ? 'Compra' : 'Venta'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ticker & Name */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Ticker
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder={assetType === 'CEDEAR' ? 'MELI' : 'BTC'}
                className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm font-display placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Nombre
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder={assetType === 'CEDEAR' ? 'MercadoLibre' : 'Bitcoin'}
                className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
              />
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Cantidad
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                step="any"
                className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm font-display placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Precio unitario
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="any"
                className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm font-display placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
              />
            </div>
          </div>

          {/* Currency & Exchange rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Moneda
              </label>
              <div className="flex bg-surface-2 rounded-lg p-0.5">
                {(['USD', 'ARS'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex-1 py-2 rounded-md text-xs font-display font-medium transition-all ${
                      currency === c
                        ? 'bg-surface-3 text-text-primary'
                        : 'text-text-muted'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                TC USD/ARS
              </label>
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                step="any"
                className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm font-display placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
              />
            </div>
          </div>

          {/* Fees & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Comisiones
              </label>
              <input
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="0"
                step="any"
                className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm font-display placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm font-display text-text-primary focus:outline-none focus:border-accent-lime/30 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Compra en baja"
              className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
            />
          </div>

          {/* Summary */}
          <div className="bg-surface-2/50 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-text-muted">Total de la operación</span>
            <span className="font-display font-medium text-lg">
              {currency === 'USD' ? 'US$' : '$'}
              {totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {error && (
            <p className="text-accent-red text-xs bg-accent-red/10 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg bg-surface-2 text-text-secondary text-sm font-medium hover:bg-surface-3 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 rounded-lg bg-accent-lime text-surface-0 text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-surface-0 border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                `Registrar ${tradeType === 'BUY' ? 'compra' : 'venta'}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
