'use client';

type Action = { label: string; icon?: string; onClick?: () => void; href?: string; variant?: 'primary' | 'secondary' | 'danger' };

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions = [],
  count,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  actions?: Action[];
  count?: number;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {crumb}{i < breadcrumb.length - 1 ? ' /' : ''}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {count !== undefined && (
            <span style={{
              padding: '0.15rem 0.6rem', borderRadius: '20px',
              background: 'rgba(37,99,235,0.1)', color: 'var(--primary)',
              fontSize: '0.78rem', fontWeight: 800,
            }}>{count}</span>
          )}
        </div>
        {subtitle && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{subtitle}</p>
        )}
      </div>

      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
          {actions.map((a, i) => {
            const isPrimary = a.variant === 'primary' || (!a.variant && i === actions.length - 1);
            const isDanger = a.variant === 'danger';
            const style: React.CSSProperties = {
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '7px',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              border: isDanger ? '1px solid #EF4444' : isPrimary ? 'none' : '1px solid var(--border)',
              background: isPrimary ? 'var(--primary)' : isDanger ? 'rgba(239,68,68,0.08)' : 'white',
              color: isPrimary ? 'white' : isDanger ? '#EF4444' : 'var(--text-primary)',
              textDecoration: 'none',
            };
            if (a.href) {
              const Link = require('next/link').default;
              return <Link key={i} href={a.href} style={style}>{a.icon && <span>{a.icon}</span>}{a.label}</Link>;
            }
            return (
              <button key={i} onClick={a.onClick} style={style}>
                {a.icon && <span>{a.icon}</span>}{a.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
