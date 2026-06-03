export function SkeletonLine({ width = '100%', height = '16px', radius = '6px' }: { width?: string; height?: string; radius?: string }) {
  return (
    <div style={{ width, height, borderRadius: radius, background: 'linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <SkeletonLine height="20px" width="60%" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} height="14px" width={i % 2 === 0 ? '100%' : '80%'} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
        <SkeletonLine height="16px" width="200px" />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} height="14px" width={c === 0 ? '30%' : '20%'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <SkeletonLine height="28px" width="280px" radius="8px" />
        <div style={{ marginTop: '0.5rem' }}>
          <SkeletonLine height="16px" width="180px" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} lines={3} />)}
      </div>
      <SkeletonTable rows={6} cols={5} />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
