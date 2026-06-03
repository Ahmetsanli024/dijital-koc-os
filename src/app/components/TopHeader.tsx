'use client';
import { useState } from 'react';
import Link from 'next/link';
import HeaderSearch from '../HeaderSearch';

export default function TopHeader({
  students,
  notifCount = 0,
  coachName = 'Koç',
  initials = 'K',
}: {
  students: { id: string; firstName: string; lastName: string }[];
  notifCount?: number;
  coachName?: string;
  initials?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      height: '56px',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 1.75rem',
      gap: '1rem',
      position: 'sticky', top: 0, zIndex: 30,
      flexShrink: 0,
    }} className="top-header">

      {/* Arama */}
      <div style={{ flex: 1 }}>
        <HeaderSearch students={students} />
      </div>

      {/* Sağ Grup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>

        {/* Destek */}
        <a href="#" style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.35rem 0.75rem', borderRadius: '6px',
          border: '1px solid var(--border)', textDecoration: 'none',
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
        }}>
          🎧 <span>Destek</span>
        </a>

        {/* Bildirim */}
        <button style={{
          position: 'relative', background: 'none', border: 'none',
          width: '36px', height: '36px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.1rem',
          color: 'var(--text-secondary)',
        }}>
          🔔
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: '4px', right: '4px',
              minWidth: '16px', height: '16px', borderRadius: '8px',
              background: '#EF4444', color: 'white',
              fontSize: '0.6rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
            }}>{notifCount}</span>
          )}
        </button>

        {/* Tema toggle */}
        <button style={{
          background: 'none', border: 'none', width: '36px', height: '36px',
          borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem',
          color: 'var(--text-secondary)',
        }}>☀️</button>

        {/* Kullanıcı */}
        <div style={{ position: 'relative', marginLeft: '0.25rem' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--bg-main)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.3rem 0.6rem 0.3rem 0.3rem',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
              color: 'white', fontWeight: 800, fontSize: '0.7rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{initials}</div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{coachName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '0.4rem',
              background: 'white', border: '1px solid var(--border)', borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)', minWidth: '180px', zIndex: 100,
              overflow: 'hidden',
            }}>
              {[
                { icon: '⚙️', label: 'Ayarlar', href: '/settings' },
                { icon: '📊', label: 'Kontrol Paneli', href: '/' },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-main)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem', width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#EF4444', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEF2F2'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                🚪 Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
