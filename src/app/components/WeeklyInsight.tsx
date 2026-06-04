'use client';
import { useState, useEffect } from 'react';

export default function WeeklyInsight() {
  const [data, setData]     = useState<{ insights: string[]; aiSummary: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]     = useState(false);

  const load = async () => {
    if (data) { setOpen(o => !o); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/weekly-insight');
      const d   = await res.json();
      setData(d);
      setOpen(true);
    } catch {}
    setLoading(false);
  };

  const total = data?.insights?.length || 0;

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
      <button onClick={load} style={{ width: '100%', padding: '0.9rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#7C3AED' }}>AI Haftalık İçgörü</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bu haftanın koçluk öncelikleri — tıkla, AI analiz etsin</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {total > 0 && <span style={{ background: '#7C3AED', color: 'white', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: 800 }}>{total}</span>}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{loading ? '⏳' : open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && data && (
        <div style={{ padding: '0 1.25rem 1.25rem', animation: 'fadeIn 0.2s' }}>
          {/* AI Özeti */}
          {data.aiSummary && (
            <div style={{ padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #F5F3FF, #EFF6FF)', borderRadius: '9px', border: '1px solid #C4B5FD', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>🧠 AI Değerlendirmesi</div>
              <p style={{ fontSize: '0.84rem', color: '#4C1D95', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{data.aiSummary}</p>
            </div>
          )}

          {/* Tespit listesi */}
          {data.insights.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Tespit Edilen Durumlar</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {data.insights.map((insight, i) => {
                  const isDrop   = insight.includes('Net düşüşü') || insight.includes('Program tamamlama');
                  const isPassive = insight.includes('seans yapılmadı');
                  const color = isDrop ? '#EF4444' : isPassive ? '#F59E0B' : '#2563EB';
                  const bg    = isDrop ? '#FEF2F2' : isPassive ? '#FFFBEB' : '#EFF6FF';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.75rem', background: bg, borderRadius: '7px', borderLeft: `3px solid ${color}`, fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>
                      <span style={{ color, flexShrink: 0 }}>{isDrop ? '📉' : isPassive ? '😶' : '⚠️'}</span>
                      {insight}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.insights.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#10B981', fontWeight: 700, fontSize: '0.88rem', background: '#F0FDF4', borderRadius: '8px' }}>
              🎉 Bu hafta kritik bir durum tespit edilmedi!
            </div>
          )}

          <button onClick={() => { setData(null); setOpen(false); load(); }}
            style={{ marginTop: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'white', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            🔄 Yenile
          </button>
        </div>
      )}
    </div>
  );
}
