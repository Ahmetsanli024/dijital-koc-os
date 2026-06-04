'use client';
import { useState, useTransition } from 'react';

type Goal = { id: string; title: string; targetValue: number; currentValue: number; unit: string; deadline: string | null; achieved: boolean };

const UNITS = ['net', 'puan', 'dilim (%)', 'soru/gün'];

export default function GoalTracker({ studentId, initialGoals }: { studentId: string; initialGoals: Goal[] }) {
  const [goals, setGoals]     = useState<Goal[]>(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [isPending, start]    = useTransition();
  const [toast, setToast]     = useState('');
  const [form, setForm]       = useState({ title: '', targetValue: '', currentValue: '', unit: 'net', deadline: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const handleAdd = () => {
    if (!form.title || !form.targetValue) { showToast('Başlık ve hedef değer zorunlu.'); return; }
    start(async () => {
      const res = await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, ...form }) });
      const data = await res.json();
      if (data.goal) {
        setGoals(prev => [...prev, { ...data.goal, deadline: data.goal.deadline ? new Date(data.goal.deadline).toISOString() : null }]);
        setForm({ title: '', targetValue: '', currentValue: '', unit: 'net', deadline: '' });
        setShowForm(false);
        showToast('Hedef eklendi ✅');
      }
    });
  };

  const handleUpdate = (id: string) => {
    start(async () => {
      await fetch('/api/goals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, currentValue: Number(editVal) }) });
      setGoals(prev => prev.map(g => g.id === id ? { ...g, currentValue: Number(editVal), achieved: Number(editVal) >= g.targetValue } : g));
      setEditingId(null);
      showToast('Güncellendi');
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bu hedef silinsin mi?')) return;
    start(async () => {
      await fetch('/api/goals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      setGoals(prev => prev.filter(g => g.id !== id));
      showToast('Silindi');
    });
  };

  const iS: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-main)' };

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{toast}</div>}

      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>🎯 Hedef Takibi</span>
        <button onClick={() => setShowForm(s => !s)} style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>
          {showForm ? 'İptal' : '+ Hedef Ekle'}
        </button>
      </div>

      {/* Hedef Ekleme Formu */}
      {showForm && (
        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hedef Başlığı *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Matematik neti 18'e çıkar" style={iS} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hedef Değer *</label>
              <input type="number" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} placeholder="18" style={iS} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Birim</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={iS}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Mevcut Değer</label>
              <input type="number" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} placeholder="14.5" style={iS} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hedef Tarihi</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={iS} />
            </div>
          </div>
          <button onClick={handleAdd} disabled={isPending} style={{ alignSelf: 'flex-end', padding: '0.45rem 1.25rem', borderRadius: '7px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
            Hedefi Kaydet
          </button>
        </div>
      )}

      {/* Hedef Listesi */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {goals.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🎯</div>
            Henüz hedef eklenmedi. "+ Hedef Ekle" ile başlayın.
          </div>
        )}
        {goals.map(g => {
          const pct     = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
          const color   = g.achieved ? '#10B981' : pct >= 70 ? '#F59E0B' : '#2563EB';
          const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86_400_000) : null;
          return (
            <div key={g.id} style={{ padding: '0.75rem', background: g.achieved ? '#F0FDF4' : '#F8FAFC', borderRadius: '9px', border: `1px solid ${g.achieved ? '#BBF7D0' : 'var(--border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {g.achieved && <span style={{ fontSize: '0.9rem' }}>🏆</span>}
                    {g.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {g.currentValue} / {g.targetValue} {g.unit}
                    {daysLeft !== null && (
                      <span style={{ marginLeft: '0.5rem', color: daysLeft < 7 ? '#EF4444' : 'var(--text-muted)' }}>
                        · {daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Süre doldu'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                  <button onClick={() => { setEditingId(g.id); setEditVal(String(g.currentValue)); }}
                    style={{ padding: '0.2rem 0.45rem', borderRadius: '5px', border: '1px solid var(--border)', background: 'white', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDelete(g.id)}
                    style={{ padding: '0.2rem 0.45rem', borderRadius: '5px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                </div>
              </div>

              {/* İlerleme çubuğu */}
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color }}>%{pct} tamamlandı{g.achieved ? ' — Hedefe ulaşıldı! 🎉' : ''}</div>

              {/* Güncelleme formu */}
              {editingId === g.id && (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                    style={{ flex: 1, padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.82rem', outline: 'none' }} placeholder="Güncel değer" />
                  <button onClick={() => handleUpdate(g.id)} style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Güncelle</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>İptal</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
