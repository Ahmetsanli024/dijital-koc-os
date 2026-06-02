'use client';
import { useState, useTransition } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable, { Column } from '../components/DataTable';

type Payment = { id: string; studentId: string; amount: number; date: string; type: string; status: string; note: string | null; student: { firstName: string; lastName: string } };
type Student = { id: string; firstName: string; lastName: string };

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  PAID:    { label: 'Ödendi',   color: '#065f46', bg: 'rgba(16,185,129,0.12)' },
  PENDING: { label: 'Bekliyor', color: '#92400e', bg: 'rgba(245,158,11,0.12)' },
  OVERDUE: { label: 'Gecikmiş', color: '#991b1b', bg: 'rgba(239,68,68,0.12)'  },
};
const TYPE_LABEL: Record<string, string> = {
  SESSION: 'Seans', MONTHLY: 'Aylık', EXAM: 'Sınav', OTHER: 'Diğer',
};

export default function MuhasebeClient({ payments: init, students, stats }: {
  payments: Payment[]; students: Student[];
  stats: { totalPaid: number; totalPending: number; totalOverdue: number };
}) {
  const [payments, setPayments] = useState(init);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ studentId: '', amount: '', type: 'SESSION', status: 'PENDING', note: '', date: new Date().toISOString().split('T')[0] });
  const [toast, setToast] = useState('');

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleAdd = () => {
    startTransition(async () => {
      const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.payment) {
        const st = students.find(s => s.id === form.studentId)!;
        setPayments(prev => [{ ...data.payment, date: new Date(data.payment.date).toISOString(), student: st }, ...prev]);
        setShowForm(false);
        setForm({ studentId: '', amount: '', type: 'SESSION', status: 'PENDING', note: '', date: new Date().toISOString().split('T')[0] });
        showToast('Ödeme kaydedildi ✅');
      }
    });
  };

  const handleStatus = async (id: string, status: string) => {
    await fetch('/api/payments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    showToast('Durum güncellendi');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ödeme kaydı silinecek?')) return;
    await fetch('/api/payments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setPayments(prev => prev.filter(p => p.id !== id));
    showToast('Silindi');
  };

  const cols: Column<Payment>[] = [
    { key: 'student', label: 'Öğrenci', sortable: true, render: r => `${r.student.firstName} ${r.student.lastName}` },
    { key: 'type', label: 'Tür', render: r => <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{TYPE_LABEL[r.type] || r.type}</span> },
    { key: 'amount', label: 'Tutar', sortable: true, render: r => <strong style={{ color: 'var(--primary)' }}>{r.amount.toLocaleString('tr-TR')} ₺</strong> },
    { key: 'date', label: 'Tarih', sortable: true, render: r => new Date(r.date).toLocaleDateString('tr-TR') },
    { key: 'status', label: 'Durum', render: r => {
      const s = STATUS_LABEL[r.status] || STATUS_LABEL.PENDING;
      return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, color: s.color, background: s.bg }}>{s.label}</span>;
    }},
    { key: 'note', label: 'Not', render: r => <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.note || '—'}</span> },
    { key: 'actions', label: 'İşlemler', width: '180px', render: r => (
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        {r.status !== 'PAID' && <button onClick={() => handleStatus(r.id, 'PAID')} style={{ padding: '0.2rem 0.5rem', borderRadius: '5px', border: 'none', background: 'rgba(16,185,129,0.1)', color: '#065f46', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>✓ Ödendi</button>}
        {r.status === 'PENDING' && <button onClick={() => handleStatus(r.id, 'OVERDUE')} style={{ padding: '0.2rem 0.5rem', borderRadius: '5px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#991b1b', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>Gecikmiş</button>}
        <button onClick={() => handleDelete(r.id)} style={{ padding: '0.2rem 0.5rem', borderRadius: '5px', border: 'none', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>✕</button>
      </div>
    )},
  ];

  const inputSt: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-main)' };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '0.85rem', boxShadow: 'var(--shadow-lg)' }}>{toast}</div>}

      <PageHeader
        title="Muhasebe" subtitle="Seans ücretleri ve ödeme takibi"
        breadcrumb={['Ana Sayfa', 'Muhasebe']}
        actions={[
          { label: '+ Ödeme Ekle', variant: 'primary', onClick: () => setShowForm(s => !s) },
        ]}
      />

      {/* Özet Kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Toplam Tahsil', value: stats.totalPaid, color: '#10B981', icon: '✅' },
          { label: 'Bekleyen', value: stats.totalPending, color: '#F59E0B', icon: '⏳' },
          { label: 'Gecikmiş', value: stats.totalOverdue, color: '#EF4444', icon: '⚠️' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value.toLocaleString('tr-TR')} ₺</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ödeme Ekleme Formu */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--primary)' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--primary)' }}>+ Yeni Ödeme Kaydı</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Öğrenci</label>
              <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} style={inputSt}>
                <option value="">Seçiniz...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tutar (₺)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inputSt} placeholder="0" /></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tür</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputSt}>
                <option value="SESSION">Seans</option><option value="MONTHLY">Aylık</option><option value="EXAM">Sınav</option><option value="OTHER">Diğer</option>
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Durum</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputSt}>
                <option value="PENDING">Bekliyor</option><option value="PAID">Ödendi</option><option value="OVERDUE">Gecikmiş</option>
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tarih</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputSt} /></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Not</label>
              <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={inputSt} placeholder="Opsiyonel not" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 700, cursor: 'pointer' }}>İptal</button>
            <button onClick={handleAdd} disabled={isPending} style={{ padding: '0.5rem 1.25rem', borderRadius: '7px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Kaydet</button>
          </div>
        </div>
      )}

      <DataTable
        data={payments}
        columns={cols}
        searchKeys={['note']}
        pageSize={15}
        emptyText="Henüz ödeme kaydı yok."
      />
    </div>
  );
}
