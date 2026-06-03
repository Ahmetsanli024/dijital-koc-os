'use client';
import { useState, useMemo, useTransition } from 'react';
import PageHeader from '../components/PageHeader';
import { createAppointment, completeAppointment, cancelAppointment, deleteAppointment } from '../actions/session';

type Appt = { id: string; title: string; date: string; durationMin: number; status: string; student: { id: string; firstName: string; lastName: string; grade: string } };
type Student = { id: string; firstName: string; lastName: string; grade: string };

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  SCHEDULED: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', label: 'Planlandı' },
  COMPLETED: { bg: '#F0FDF4', color: '#059669', border: '#BBF7D0', label: 'Tamamlandı' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'İptal' },
};

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

export default function TakvimClient({ students, appointments: initAppts }: { students: Student[]; appointments: Appt[] }) {
  const [appointments, setAppts]  = useState<Appt[]>(initAppts);
  const [viewDate, setViewDate]   = useState(new Date());
  const [view, setView]           = useState<'month'|'list'>('month');
  const [showForm, setShowForm]   = useState(false);
  const [isPending, start]        = useTransition();
  const [toast, setToast]         = useState('');
  const [form, setForm]           = useState({ studentId: '', title: 'Koçluk Seansı', date: '', time: '10:00', durationMin: 45 });

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleCreate = () => {
    if (!form.studentId || !form.date) { showToast('Öğrenci ve tarih zorunlu.'); return; }
    start(async () => {
      const res = await createAppointment({ studentId: form.studentId, title: form.title, date: `${form.date}T${form.time}:00`, durationMin: form.durationMin });
      if (res.success && res.appt) {
        const st = students.find(s => s.id === form.studentId)!;
        setAppts(prev => [...prev, { ...res.appt!, date: new Date(res.appt!.date).toISOString(), student: st }].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setShowForm(false); setForm({ studentId: '', title: 'Koçluk Seansı', date: '', time: '10:00', durationMin: 45 });
        showToast('Randevu eklendi ✅');
      }
    });
  };

  const handleStatus = (id: string, action: 'complete'|'cancel'|'delete') => {
    start(async () => {
      if (action === 'complete') { await completeAppointment(id); setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a)); }
      else if (action === 'cancel') { await cancelAppointment(id); setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a)); }
      else { if (!confirm('Bu randevu silinsin mi?')) return; await deleteAppointment(id); setAppts(prev => prev.filter(a => a.id !== id)); }
      showToast('Güncellendi');
    });
  };

  // Takvim hesapla
  const calDays = useMemo(() => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const first = new Date(year, month, 1).getDay(); // 0=Paz
    const days: (Date | null)[] = Array(first).fill(null);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewDate]);

  const apptsByDate = useMemo(() => {
    const map: Record<string, Appt[]> = {};
    appointments.forEach(a => {
      const key = new Date(a.date).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [appointments]);

  const today    = new Date();
  const upcoming = appointments.filter(a => new Date(a.date) >= today && a.status === 'SCHEDULED').slice(0, 10);

  const iS: React.CSSProperties = { width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)' };

  return (
    <div style={{ maxWidth: '1200px', width: '100%' }}>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: '#10B981', color: 'white', fontWeight: 700 }}>{toast}</div>}

      <PageHeader title="Seans Takvimi" subtitle="Randevular, hatırlatıcılar ve haftalık koçluk ajandası"
        breadcrumb={['Ana Sayfa', 'Takvim']}
        actions={[{ label: '+ Randevu Ekle', variant: 'primary', onClick: () => setShowForm(s => !s) }]} />

      {/* Randevu Formu */}
      {showForm && (
        <div style={{ background: 'white', border: '1.5px solid var(--primary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>📅 Yeni Randevu</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Öğrenci *</label>
              <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} style={iS}>
                <option value="">— Seçin —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select></div>
            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Başlık</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={iS} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tarih *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={iS} /></div>
              <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Saat</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={iS} /></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.55rem 1.1rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}>İptal</button>
            <button onClick={handleCreate} disabled={isPending} style={{ padding: '0.55rem 1.25rem', borderRadius: '7px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Kaydet</button>
          </div>
        </div>
      )}

      {/* Görünüm Seçimi */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[{ v: 'month' as const, l: '📅 Takvim Görünümü' }, { v: 'list' as const, l: '📋 Liste Görünümü' }].map(b => (
          <button key={b.v} onClick={() => setView(b.v)}
            style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              background: view === b.v ? 'var(--primary)' : 'var(--bg-main)',
              color: view === b.v ? 'white' : 'var(--text-secondary)' }}>
            {b.l}
          </button>
        ))}
      </div>

      {view === 'month' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>
          {/* Takvim */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.35rem 0.7rem', cursor: 'pointer', fontWeight: 700 }}>‹</button>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>{MONTHS_TR[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.35rem 0.7rem', cursor: 'pointer', fontWeight: 700 }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
              {DAYS_TR.map(d => (
                <div key={d} style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} style={{ minHeight: '80px', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }} />;
                const isToday = day.toDateString() === today.toDateString();
                const dayAppts = apptsByDate[day.toDateString()] || [];
                return (
                  <div key={i} style={{ minHeight: '80px', padding: '0.35rem', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: isToday ? '#EFF6FF' : 'white' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: isToday ? 900 : 600, color: isToday ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '0.3rem',
                      ...(isToday ? { background: 'var(--primary)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}>
                      {day.getDate()}
                    </div>
                    {dayAppts.slice(0, 2).map(a => {
                      const ss = STATUS_STYLE[a.status] || STATUS_STYLE.SCHEDULED;
                      return (
                        <div key={a.id} style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.35rem', borderRadius: '4px', marginBottom: '0.15rem', background: ss.bg, color: ss.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {new Date(a.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} {a.student.firstName}
                        </div>
                      );
                    })}
                    {dayAppts.length > 2 && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>+{dayAppts.length - 2} daha</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Yaklaşan Randevular */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.88rem' }}>
              🔔 Yaklaşan Seanslar
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
              {upcoming.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Yaklaşan randevu yok</div>
              ) : upcoming.map(a => (
                <div key={a.id} style={{ padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.student.firstName} {a.student.lastName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(a.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(a.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.durationMin} dk · {a.title}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.45rem' }}>
                    <button onClick={() => handleStatus(a.id, 'complete')} style={{ flex: 1, padding: '0.25rem', borderRadius: '5px', border: 'none', background: '#F0FDF4', color: '#059669', fontWeight: 700, fontSize: '0.65rem', cursor: 'pointer' }}>✓ Tamamla</button>
                    <button onClick={() => handleStatus(a.id, 'cancel')} style={{ flex: 1, padding: '0.25rem', borderRadius: '5px', border: 'none', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.65rem', cursor: 'pointer' }}>✕ İptal</button>
                    <button onClick={() => handleStatus(a.id, 'delete')} style={{ padding: '0.25rem 0.45rem', borderRadius: '5px', border: 'none', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.65rem', cursor: 'pointer' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Liste Görünümü */
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Öğrenci', 'Tarih & Saat', 'Süre', 'Konu', 'Durum', 'İşlem'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Henüz randevu yok</td></tr>
              ) : appointments.map(a => {
                const ss = STATUS_STYLE[a.status] || STATUS_STYLE.SCHEDULED;
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{a.student.firstName} {a.student.lastName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.student.grade}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{a.durationMin} dk</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{a.title}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}>{ss.label}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {a.status === 'SCHEDULED' && <>
                          <button onClick={() => handleStatus(a.id, 'complete')} style={{ padding: '0.25rem 0.55rem', borderRadius: '5px', border: 'none', background: '#F0FDF4', color: '#059669', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>✓</button>
                          <button onClick={() => handleStatus(a.id, 'cancel')} style={{ padding: '0.25rem 0.55rem', borderRadius: '5px', border: 'none', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>✕</button>
                        </>}
                        <button onClick={() => handleStatus(a.id, 'delete')} style={{ padding: '0.25rem 0.55rem', borderRadius: '5px', border: 'none', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
