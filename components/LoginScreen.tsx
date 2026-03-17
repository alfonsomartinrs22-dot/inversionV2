'use client';

import { useState } from 'react';

interface Props {
  onLogin: (username: string) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Ingresá usuario y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      onLogin(data.username);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-surface-1 border border-white/[0.04] flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 13L6 5L10 10L14 3L16 7"
                stroke="#b8f53d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-display font-medium text-2xl tracking-tight">
            folio<span className="text-accent-lime">_</span>
          </h1>
          <p className="text-text-muted text-sm mt-2">Ingresá a tu portfolio</p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="tu usuario"
              autoFocus
              autoComplete="username"
              className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-4 py-3 text-sm font-display placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-4 py-3 text-sm font-display placeholder:text-text-muted focus:outline-none focus:border-accent-lime/30 transition-colors"
            />
          </div>

          {error && (
            <p className="text-accent-red text-xs bg-accent-red/10 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-lime text-surface-0 text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-surface-0 border-t-transparent rounded-full animate-spin" />
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
