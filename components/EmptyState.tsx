'use client';

interface Props {
  onAddTrade: () => void;
}

export default function EmptyState({ onAddTrade }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-up">
      {/* Decorative chart icon */}
      <div className="w-20 h-20 rounded-2xl bg-surface-1 border border-white/[0.04] flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M6 30L14 16L22 22L30 8L36 16"
            stroke="#b8f53d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
          <path
            d="M6 30L14 20L22 25L30 12L36 18"
            stroke="#3df5e8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold mb-2">Empezá a trackear</h2>
      <p className="text-text-secondary text-sm max-w-sm mb-8">
        Registrá tus operaciones de CEDEARs y criptos para ver tu portfolio en un solo lugar.
        Podés cargar en pesos o dólares.
      </p>

      <button
        onClick={onAddTrade}
        className="flex items-center gap-2 px-6 py-3 bg-accent-lime text-surface-0 rounded-xl text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-all"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 4v10M4 9h10" />
        </svg>
        Registrar primera operación
      </button>

      {/* Subtle hint */}
      <div className="mt-12 grid grid-cols-3 gap-6 max-w-md w-full">
        {[
          { icon: '📊', text: 'CEDEARs y cripto' },
          { icon: '💱', text: 'Pesos y dólares' },
          { icon: '📱', text: 'Celular y PC' },
        ].map((item) => (
          <div key={item.text} className="text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-xs text-text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
