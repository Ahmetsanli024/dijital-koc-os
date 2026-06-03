import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--border)' }}>404</div>
      <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Sayfa bulunamadı</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px' }}>
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
      </p>
      <Link href="/" style={{ padding: '0.65rem 1.75rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, textDecoration: 'none' }}>
        🏠 Ana Sayfaya Dön
      </Link>
    </div>
  );
}
