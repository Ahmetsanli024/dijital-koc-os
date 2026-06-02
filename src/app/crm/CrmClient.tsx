'use client';
import { useState, useTransition } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable, { Column } from '../components/DataTable';

type Lead = { id: string; name: string; phone: string | null; grade: string | null; source: string | null; status: string; notes: string | null; createdAt: string; followUpDate: string | null };

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  NEW:       { label: 'Yeni',      color: '#1D4ED8', bg: 'rgba(37,99,235,0.1)' },
  CONTACTED: { label: 'İletişime Geçildi', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  DEMO:      { label: 'Demo Seans', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  CONVERTED: { label: 'Öğrenciye Dönüştü', color: '#065f46', bg: 'rgba(16,185,129,0.12)' },
  LOST:      { label: 'Kaybedildi', color: '#991b1b', bg: 'rgba(239,68,68,0.1)' },
};
const SOURCES = ['INSTAGRAM', 'REFERRAL', 'WEBSITE', 'PHONE', 'OTHER'];
const GRADES  = ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf / LGS', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'];

export default function CrmClient({ leads: init }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(init);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: '', phone: '', grade: '', source: 'INSTAGRAM', notes: '', followUpDate: '' });
  const [toast, setToast] = useState('');

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleAdd = () => {
    if (!form.name.trim()) { showToast('İsim zorunludur.'); return; }
    startTransition(async () => {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.lead) { setLeads(prev => [{ ...data.lead, createdAt: new Date(data.lead.createdAt).toISOString(), followUpDate: data.lead.followUpDate ? new Date(data.lead.followUpDate).toISOString() : null }, ...prev]); setShowForm(false); setForm({ name: '', phone: '', grade: '', source: 'INSTAGRAM', notes: '', followUpDate: '' }); showToast('Aday eklendi ✅'); }
    });
  };

  const handleStatus = async (id: string, status: string) => {
    await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aday kaydı silinsin mi?')) return;
    await fetch('/api/leads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setLeads(prev => prev.filter(l => l.id !== id));
    showToast('Silindi');
  };

  const counts = Object.keys(STATUS).reduce((a, k) => ({ ...a, [k]: leads.filter(l => l.status === k).length }), {} as Record<string, number>);

  const cols: Column<Lead>[] = [
    { key: 'name', label: 'Ad Soyad', sortable: true },
    { key: 'phone', label: 'Telefon', render: r => r.phone || '—' },
    { key: 'grade', label: 'Sınıf', render: r => r.grade || '—' },
    { key: 'source', label: 'Kaynak', render: r => <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{r.source || '—'}</span> },
    { key: 'status', label: 'Durum', render: r => {
      const s = STATUS[r.status];
      return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, color: s?.color, background: s?.bg }}>{s?.label || r.status}</span>;
    }},
    { key: 'followUpDate', label: 'Takip Tarihi', render: r => r.followUpDate ? new Date(r.followUpDate).toLocaleDateString('tr-TR') : '—' },
    { key: 'notes', label: 'Not', render: r => <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</span> },
    { key: 'actions', label: 'Durum Güncelle', width: '160px', render: r => (
      <select value={r.status} onChange={e => handleStatus(r.id, e.target.value)}
        style={{ padding: '0.25rem 0.4rem', borderRadius: '5px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', background: 'white' }}>
        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
    )},
    { key: 'del', label: '', width: '40px', render: r => (
      <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
    )},
  ];

  const inputSt: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-main)' };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{toast}</div>}

      <PageHeader title="CRM — Aday Takip" subtitle="Görüşme talepleri ve potansiyel öğrenci takibi" breadcrumb={['Ana Sayfa', 'CRM']}
        actions={[{ label: '+ Aday Ekle', variant: 'primary', onClick: () => setShowForm(s => !s) }]} count={leads.length} />

      {/* Durum Özeti */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS).map(([k, v]) => (
          <div key={k} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{v.label}</span>
            <span style={{ fontWeight: 900, fontSize: '0.9rem', color: v.color }}>{counts[k] || 0}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--primary)' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--primary)' }}>+ Yeni Aday</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {[
              { key: 'name', label: 'Ad Soyad *', type: 'text', placeholder: 'Ali Yılmaz' },
              { key: 'phone', label: 'Telefon', type: 'text', placeholder: '0555 123 45 67' },
              { key: 'followUpDate', label: 'Takip Tarihi', type: 'date', placeholder: '' },
            ].map(f => (
              <div key={f.key}><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputSt} placeholder={f.placeholder} /></div>
            ))}
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Sınıf</label>
              <select value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} style={inputSt}>
                <option value="">Seçiniz...</option>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Kaynak</label>
              <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} style={inputSt}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Not</label>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={inputSt} placeholder="Opsiyonel not" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 700, cursor: 'pointer' }}>İptal</button>
            <button onClick={handleAdd} disabled={isPending} style={{ padding: '0.5rem 1.25rem', borderRadius: '7px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Kaydet</button>
          </div>
        </div>
      )}

      <DataTable data={leads} columns={cols} searchKeys={['name', 'phone', 'notes']} pageSize={15} emptyText="Henüz aday kaydı yok." />
    </div>
  );
}
