'use client';
import { useState, useMemo } from 'react';

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, i: number) => React.ReactNode;
};

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys = [],
  pageSize = 10,
  emptyText = 'Kayıt bulunamadı.',
  onExport,
  filters,
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys?: string[];
  pageSize?: number;
  emptyText?: string;
  onExport?: () => void;
  filters?: React.ReactNode;
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(row =>
        searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), 'tr');
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeState));
  const paged = filtered.slice((page - 1) * pageSizeState, page * pageSizeState);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const th: React.CSSProperties = {
    padding: '0.65rem 1rem', background: '#F8FAFC',
    fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border)', textAlign: 'left',
    whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    padding: '0.7rem 1rem', borderBottom: '1px solid var(--border)',
    fontSize: '0.85rem', color: 'var(--text-primary)', verticalAlign: 'middle',
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {/* Araç çubuğu */}
      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 0 220px' }}>
          <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ara..."
            style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2rem', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '0.83rem', outline: 'none', background: 'var(--bg-main)' }}
          />
        </div>
        {filters}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {onExport && (
            <button onClick={onExport} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              📤 Excel
            </button>
          )}
        </div>
      </div>

      {/* Tablo */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ ...th, width: col.width, cursor: col.sortable ? 'pointer' : 'default' }}
                  onClick={() => col.sortable && handleSort(col.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {col.label}
                    {col.sortable && (
                      <span style={{ color: sortKey === col.key ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.65rem' }}>
                        {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>{emptyText}</td></tr>
            ) : paged.map((row, i) => (
              <tr key={i}
                style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFC'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}
              >
                {columns.map(col => (
                  <td key={col.key} style={td}>
                    {col.render ? col.render(row, i) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Toplam: <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> kayıt
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button onClick={() => setPage(1)} disabled={page === 1} style={pgBtn(page === 1)}>«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pgBtn(page === 1)}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const pg = start + i;
            return pg <= totalPages ? (
              <button key={pg} onClick={() => setPage(pg)}
                style={{ ...pgBtn(false), background: pg === page ? 'var(--primary)' : 'white', color: pg === page ? 'white' : 'var(--text-primary)', fontWeight: pg === page ? 800 : 400 }}>
                {pg}
              </button>
            ) : null;
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pgBtn(page === totalPages)}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={pgBtn(page === totalPages)}>»</button>
          <select value={pageSizeState} onChange={e => { setPageSizeState(Number(e.target.value)); setPage(1); }}
            style={{ marginLeft: '0.5rem', padding: '0.25rem 0.4rem', borderRadius: '5px', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function pgBtn(disabled: boolean): React.CSSProperties {
  return {
    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '6px', border: '1px solid var(--border)', background: 'white', cursor: disabled ? 'default' : 'pointer',
    fontSize: '0.78rem', color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
    opacity: disabled ? 0.5 : 1,
  };
}
