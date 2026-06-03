'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError(data.error || 'Giriş başarısız.');
      }
    } catch {
      setError('Sunucu bağlantı hatası. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif", padding: '1rem',
    }}>
      {/* Arka plan dekorasyon */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(37,99,235,0.12)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo & Başlık */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontWeight: 900, fontSize: '1.5rem', color: 'white',
            boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
          }}>AŞ</div>
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Koç Ajandası
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
            Yapay Zeka Destekli Koçluk Sistemi
          </p>
        </div>

        {/* Form Kartı */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px',
          padding: '2rem',
        }}>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Koç Girişi
          </h2>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                E-posta
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ahmet@kocluk.com" required autoComplete="email" autoFocus
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '9px',
                  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#60A5FA'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Şifre
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '9px',
                  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#60A5FA'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5', fontWeight: 600,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '9px', border: 'none',
                background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563EB, #3B82F6)',
                color: 'white', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer',
                marginTop: '0.25rem', letterSpacing: '0.01em',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)',
                transition: 'all 0.2s',
              }}>
              {loading ? '⏳ Giriş yapılıyor...' : 'Sisteme Giriş Yap →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          Ahmet ŞANLI Koçluk Sistemi · v2.1
        </p>
      </div>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px rgba(30,58,138,0.5) inset; -webkit-text-fill-color: white; }
      `}</style>
    </div>
  );
}
