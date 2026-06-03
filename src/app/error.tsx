'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Bir şeyler ters gitti</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: 1.6 }}>
        Sayfa yüklenirken beklenmedik bir hata oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={reset} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
          🔄 Tekrar Dene
        </button>
        <a href="/" style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
          🏠 Ana Sayfa
        </a>
      </div>
      <details style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Teknik Detay</summary>
        <pre style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '6px', textAlign: 'left', overflow: 'auto', fontSize: '0.7rem' }}>
          {error.message}
        </pre>
      </details>
    </div>
  );
}
