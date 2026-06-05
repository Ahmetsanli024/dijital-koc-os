'use client';
import React, { useState, useTransition } from 'react';
import { createSessionNote, deleteSessionNote, createAppointment } from '../actions/session';
import ExcelImport from '../components/ExcelImport';

type Student = { id: string; firstName: string; lastName: string; grade: string };
type SessionNote = {
  id: string; studentId: string; title: string; content: string;
  sessionNumber: number | null; date: string;
  weeklyAnxiety: number | null; weeklyMotivation: number | null; weeklyFocus: number | null;
  maturityScore: number | null; plannedQuestions: number | null; solvedQuestions: number | null;
  parentFeedback: string | null; timeManagement: string | null;
  student: { firstName: string; lastName: string };
};

const MOTIVATION_COLOR = (v: number) => v >= 7 ? '#10B981' : v >= 4 ? '#F59E0B' : '#EF4444';
const SCORE_LABEL = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

function MetricBar({ label, value, color }: { label: string; value: number | null; color?: string }) {
  if (!value) return null;
  const c = color || MOTIVATION_COLOR(value);
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
        <span>{label}</span><span style={{ color: c }}>{value}/10</span>
      </div>
      <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 10}%`, background: c, borderRadius: '3px', transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function SessionClient({
  students,
  sessions: initialSessions,
}: {
  students: Student[];
  sessions: SessionNote[];
}) {
  const [sessions, setSessions] = useState<SessionNote[]>(initialSessions);
  const [isPending, startTransition] = useTransition();
  const [activeView, setActiveView] = useState<'new' | 'list' | 'appt' | 'meeting' | 'excel'>('list');
  const [filterStudent, setFilterStudent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Form State ────────────────────────────────────
  const [form, setForm] = useState({
    studentId: '', title: '', content: '',
    weeklyAnxiety: 5, weeklyMotivation: 5, weeklyFocus: 5,
    maturityScore: 3, plannedQuestions: 0, solvedQuestions: 0,
    parentFeedback: '', timeManagement: 'Süre Yetti',
  });

  // ── Randevu State ─────────────────────────────────
  const [apptForm, setApptForm] = useState({
    studentId: '', title: 'Koçluk Seansı', date: '', time: '10:00', durationMin: 45,
  });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSession = () => {
    if (!form.studentId || !form.title || !form.content) {
      showToast('Öğrenci, başlık ve not zorunludur.', false);
      return;
    }
    startTransition(async () => {
      const res = await createSessionNote({
        studentId: form.studentId,
        title: form.title,
        content: form.content,
        weeklyAnxiety: form.weeklyAnxiety,
        weeklyMotivation: form.weeklyMotivation,
        weeklyFocus: form.weeklyFocus,
        maturityScore: form.maturityScore,
        plannedQuestions: form.plannedQuestions || undefined,
        solvedQuestions: form.solvedQuestions || undefined,
        parentFeedback: form.parentFeedback || undefined,
        timeManagement: form.timeManagement,
      });
      if (res.success) {
        const student = students.find(s => s.id === form.studentId)!;
        const newNote: SessionNote = {
          ...(res.note as any),
          date: res.note!.date.toString(),
          student: { firstName: student.firstName, lastName: student.lastName },
        };
        setSessions(prev => [newNote, ...prev]);
        setForm({ studentId: '', title: '', content: '', weeklyAnxiety: 5, weeklyMotivation: 5, weeklyFocus: 5, maturityScore: 3, plannedQuestions: 0, solvedQuestions: 0, parentFeedback: '', timeManagement: 'Süre Yetti' });
        setActiveView('list');
        showToast('Seans notu kaydedildi ✅');
      } else {
        showToast(res.error || 'Hata oluştu', false);
      }
    });
  };

  const handleDeleteSession = (id: string) => {
    if (!confirm('Bu seans notu silinecek. Emin misiniz?')) return;
    startTransition(async () => {
      const res = await deleteSessionNote(id);
      if (res.success) {
        setSessions(prev => prev.filter(s => s.id !== id));
        showToast('Seans notu silindi.');
      }
    });
  };

  const handleSaveAppt = () => {
    if (!apptForm.studentId || !apptForm.date) {
      showToast('Öğrenci ve tarih zorunludur.', false);
      return;
    }
    startTransition(async () => {
      const dateTime = `${apptForm.date}T${apptForm.time}:00`;
      const res = await createAppointment({
        studentId: apptForm.studentId,
        title: apptForm.title,
        date: dateTime,
        durationMin: apptForm.durationMin,
      });
      if (res.success) {
        setApptForm({ studentId: '', title: 'Koçluk Seansı', date: '', time: '10:00', durationMin: 45 });
        setActiveView('list');
        showToast('Randevu eklendi ✅ — Dashboard\'da görünür.');
      } else {
        showToast(res.error || 'Hata oluştu', false);
      }
    });
  };

  const filtered = sessions.filter(s =>
    !filterStudent || s.studentId === filterStudent
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--bg-main)',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.75rem 1.25rem', borderRadius: '10px', background: toast.ok ? '#10B981' : '#EF4444', color: 'white', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s' }}>
          {toast.msg}
        </div>
      )}

      {/* Başlık */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
            Seans Merkezi
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {sessions.length} kayıtlı seans • {students.length} öğrenci
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveView(v => v === 'appt' ? 'list' : 'appt')}
            className="btn-secondary" style={{ padding: '0.65rem 1.2rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            📅 Randevu
          </button>
          <button onClick={() => setActiveView(v => v === 'meeting' ? 'list' : 'meeting')}
            className="btn-secondary" style={{ padding: '0.65rem 1.2rem', fontWeight: 700, fontSize: '0.9rem', color: '#D97706', borderColor: '#D97706' }}>
            📋 Toplantı Tutanağı
          </button>
          <button onClick={() => setActiveView(v => v === 'excel' ? 'list' : 'excel')}
            className="btn-secondary" style={{ padding: '0.65rem 1.2rem', fontWeight: 700, fontSize: '0.9rem', color: '#059669', borderColor: '#059669' }}>
            📊 Excel'den Aktar
          </button>
          <button onClick={() => setActiveView(v => v === 'new' ? 'list' : 'new')}
            className="btn-primary" style={{ padding: '0.65rem 1.2rem', fontWeight: 700, fontSize: '0.9rem' }}>
            {activeView === 'new' ? '← Geri' : '+ Seans Notu'}
          </button>
        </div>
      </header>

      {/* ── RANDEVU FORMU ────────────────────────────── */}
      {activeView === 'appt' && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--primary)', animation: 'fadeIn 0.2s' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--primary)' }}>📅 Yeni Randevu</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Öğrenci</label>
              <select value={apptForm.studentId} onChange={e => setApptForm(f => ({ ...f, studentId: e.target.value }))} style={inputStyle}>
                <option value="">Seçiniz...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Başlık</label>
              <input value={apptForm.title} onChange={e => setApptForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="Koçluk Seansı" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Tarih</label>
              <input type="date" value={apptForm.date} onChange={e => setApptForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Saat</label>
                <input type="time" value={apptForm.time} onChange={e => setApptForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Süre (dk)</label>
                <input type="number" value={apptForm.durationMin} onChange={e => setApptForm(f => ({ ...f, durationMin: Number(e.target.value) }))} style={inputStyle} min={15} step={15} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setActiveView('list')} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontWeight: 700 }}>İptal</button>
            <button onClick={handleSaveAppt} disabled={isPending} className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontWeight: 700 }}>
              {isPending ? 'Kaydediliyor...' : 'Randevuyu Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* ── EXCEL AKTARIM ────────────────────────────── */}
      {activeView === 'excel' && (
        <ExcelImport students={students} onImported={(n) => { showToast(`✅ ${n} seans aktarıldı!`); setActiveView('list'); }} />
      )}

      {/* ── TOPLANTI TUTANAĞI FORMU ──────────────────── */}
      {activeView === 'meeting' && <MeetingNoteForm students={students} onClose={() => setActiveView('list')} showToast={showToast} />}

      {/* ── YENİ SEANS FORMU ──────────────────────────── */}
      {activeView === 'new' && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--secondary)', animation: 'fadeIn 0.2s' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--secondary)' }}>🤝 Yeni Seans Notu</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Öğrenci *</label>
              <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} style={inputStyle}>
                <option value="">Seçiniz...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.grade}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Seans Konusu / Başlık *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="Örn: Sınav kaygısı ve motivasyon" />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Seans Notu — Yapılanlar & Kararlar *</label>
            <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Öğrenciyle neler konuşuldu, hangi kararlar alındı, bir sonraki seans için notlar..." />
          </div>

          {/* Metrikler */}
          <div style={{ background: 'var(--bg-main)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📊 Haftalık Durum Değerlendirmesi</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {([
                { key: 'weeklyAnxiety', label: '😰 Kaygı Düzeyi', desc: '1=Düşük, 10=Yüksek', reverse: true },
                { key: 'weeklyMotivation', label: '🚀 Motivasyon', desc: '1=Düşük, 10=Yüksek', reverse: false },
                { key: 'weeklyFocus', label: '🎯 Odak', desc: '1=Düşük, 10=Yüksek', reverse: false },
              ] as const).map(({ key, label, desc, reverse }) => {
                const val = form[key];
                const color = reverse
                  ? (val <= 3 ? '#10B981' : val <= 6 ? '#F59E0B' : '#EF4444')
                  : (val >= 7 ? '#10B981' : val >= 4 ? '#F59E0B' : '#EF4444');
                return (
                  <div key={key}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>{label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="range" min={1} max={10} value={val} onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))} style={{ flex: 1, accentColor: color }} />
                      <span style={{ fontWeight: 900, color, minWidth: '24px', textAlign: 'center' }}>{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Olgunluk Skoru</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, maturityScore: n }))}
                    style={{ flex: 1, padding: '0.4rem', border: `2px solid ${form.maturityScore >= n ? '#F59E0B' : 'var(--border)'}`, borderRadius: '6px', background: form.maturityScore >= n ? 'rgba(245,158,11,0.1)' : 'white', cursor: 'pointer', fontSize: '0.9rem' }}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Planlanan Soru</label>
              <input type="number" value={form.plannedQuestions || ''} onChange={e => setForm(f => ({ ...f, plannedQuestions: Number(e.target.value) }))} style={inputStyle} placeholder="0" min={0} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Çözülen Soru</label>
              <input type="number" value={form.solvedQuestions || ''} onChange={e => setForm(f => ({ ...f, solvedQuestions: Number(e.target.value) }))} style={inputStyle} placeholder="0" min={0} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Süre Yönetimi</label>
              <select value={form.timeManagement} onChange={e => setForm(f => ({ ...f, timeManagement: e.target.value }))} style={inputStyle}>
                <option>Süre Yetti</option>
                <option>Hafif Yetişmedi</option>
                <option>Büyük Süre Sorunu</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Veli Geri Bildirimi</label>
              <input value={form.parentFeedback} onChange={e => setForm(f => ({ ...f, parentFeedback: e.target.value }))} style={inputStyle} placeholder="Veliden gelen bilgi (opsiyonel)" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setActiveView('list')} className="btn-secondary" style={{ padding: '0.7rem 1.5rem', fontWeight: 700 }}>İptal</button>
            <button onClick={handleSaveSession} disabled={isPending} className="btn-primary" style={{ padding: '0.7rem 2rem', fontWeight: 700 }}>
              {isPending ? 'Kaydediliyor...' : '💾 Seans Notunu Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* ── SEANS LİSTESİ ────────────────────────────── */}
      {activeView === 'list' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}
              style={{ ...inputStyle, width: '220px', fontWeight: 700 }}>
              <option value="">Tüm Öğrenciler</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{filtered.length} seans</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Henüz seans notu yok</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>İlk seans notunuzu eklemek için "Yeni Seans Notu" butonunu kullanın.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(s => {
                const isOpen = expandedId === s.id;
                const completion = s.plannedQuestions && s.solvedQuestions
                  ? Math.round((s.solvedQuestions / s.plannedQuestions) * 100)
                  : null;
                return (
                  <div key={s.id} className="card" style={{ padding: '1rem 1.25rem', cursor: 'pointer', border: isOpen ? '1.5px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s' }}>
                    <div onClick={() => setExpandedId(isOpen ? null : s.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                          {s.sessionNumber || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {s.student.firstName} {s.student.lastName} • {new Date(s.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        {completion !== null && (
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', background: completion >= 80 ? 'rgba(16,185,129,0.1)' : completion >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: completion >= 80 ? '#065f46' : completion >= 50 ? '#92400e' : '#991b1b', fontSize: '0.75rem', fontWeight: 800 }}>
                            %{completion} tamamlandı
                          </span>
                        )}
                        {s.maturityScore && <span style={{ fontSize: '0.85rem' }}>{SCORE_LABEL[s.maturityScore]}</span>}
                        <button onClick={e => { e.stopPropagation(); handleDeleteSession(s.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.85rem', opacity: 0.7, padding: '0.2rem 0.4rem' }}>✕</button>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Seans Notu</div>
                            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{s.content}</p>
                            {s.parentFeedback && (
                              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.08)', borderRadius: '7px', fontSize: '0.8rem' }}>
                                <span style={{ fontWeight: 800, color: '#92400e' }}>Veli: </span>{s.parentFeedback}
                              </div>
                            )}
                          </div>
                          <div>
                            {(s.weeklyMotivation || s.weeklyFocus || s.weeklyAnxiety) && (
                              <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Durum</div>
                                <MetricBar label="🚀 Motivasyon" value={s.weeklyMotivation} />
                                <MetricBar label="🎯 Odak" value={s.weeklyFocus} />
                                <MetricBar label="😰 Kaygı" value={s.weeklyAnxiety} color={s.weeklyAnxiety ? (s.weeklyAnxiety <= 3 ? '#10B981' : s.weeklyAnxiety <= 6 ? '#F59E0B' : '#EF4444') : undefined} />
                              </div>
                            )}
                            {(s.plannedQuestions || s.solvedQuestions) && (
                              <div style={{ background: 'var(--bg-main)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                                <div style={{ fontWeight: 700 }}>Planlanan: <strong>{s.plannedQuestions}</strong> soru</div>
                                <div style={{ fontWeight: 700 }}>Çözülen: <strong style={{ color: 'var(--primary)' }}>{s.solvedQuestions}</strong> soru</div>
                                {s.timeManagement && <div style={{ marginTop: '0.3rem', color: 'var(--text-secondary)' }}>⏱ {s.timeManagement}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}

// ── Veli Toplantı Tutanağı Formu ────────────────────────────────────
const MEETING_TOPICS = [
  'Akademik Durum Değerlendirmesi', 'Sınav Sonuçları Analizi',
  'Haftalık Program Güncellenmesi', 'Psikolojik Destek ve Motivasyon',
  'Hedef Revizesi', 'Veli Gözlem Paylaşımı',
  'LGS / YKS Stratejisi', 'Tercih Danışmanlığı',
  'Evde Çalışma Düzeni', 'Diğer',
];

function MeetingNoteForm({ students, onClose, showToast }: { students: any[]; onClose: () => void; showToast: (m: string) => void }) {
  const [isPending, start] = useTransition();
  const [form, setForm] = useState({
    studentId: '', participants: 'Koç + Veli',
    selectedTopics: [] as string[], decisions: '', parentTasks: '', nextMeeting: '',
  });

  const toggleTopic = (t: string) => setForm(f => ({
    ...f, selectedTopics: f.selectedTopics.includes(t) ? f.selectedTopics.filter(x => x !== t) : [...f.selectedTopics, t],
  }));

  const handleSave = () => {
    if (!form.studentId || !form.selectedTopics.length) { showToast('Öğrenci ve en az bir konu seçin.'); return; }
    start(async () => {
      const res = await fetch('/api/meeting-notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: form.studentId, participants: form.participants, topics: form.selectedTopics, decisions: form.decisions, parentTasks: form.parentTasks, nextMeeting: form.nextMeeting || null }),
      });
      if (res.ok) { showToast('Toplantı tutanağı kaydedildi ✅'); onClose(); }
      else showToast('Kayıt hatası');
    });
  };

  const handlePrint = () => {
    const student = students.find(s => s.id === form.studentId);
    const w = window.open('', '_blank');
    if (!w || !student) return;
    w.document.write(`<html><head><style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111;font-size:13px}
      h1{font-size:18px;border-bottom:2px solid #1E3A8A;padding-bottom:10px;margin-bottom:20px;color:#1E3A8A}
      .section{margin-bottom:20px} .label{font-weight:700;font-size:12px;text-transform:uppercase;color:#666;margin-bottom:6px}
      .value{border:1px solid #ddd;padding:10px;border-radius:6px;min-height:40px;font-size:13px}
      .tag{display:inline-block;background:#EFF6FF;color:#2563EB;padding:3px 10px;border-radius:12px;margin:3px;font-size:12px;font-weight:700}
      .footer{margin-top:40px;border-top:1px solid #ddd;padding-top:10px;font-size:11px;color:#999;display:flex;justify-content:space-between}
    </style></head><body>
    <h1>Veli Toplantı Tutanağı</h1>
    <div class="section"><div class="label">Öğrenci</div><div class="value">${student.firstName} ${student.lastName} — ${student.grade}</div></div>
    <div class="section"><div class="label">Tarih</div><div class="value">${new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div>
    <div class="section"><div class="label">Katılımcılar</div><div class="value">${form.participants}</div></div>
    <div class="section"><div class="label">Görüşülen Konular</div><div class="value">${form.selectedTopics.map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
    <div class="section"><div class="label">Alınan Kararlar</div><div class="value">${form.decisions||'—'}</div></div>
    <div class="section"><div class="label">Veliye Verilen Görevler</div><div class="value">${form.parentTasks||'—'}</div></div>
    ${form.nextMeeting?`<div class="section"><div class="label">Bir Sonraki Toplantı</div><div class="value">${new Date(form.nextMeeting).toLocaleDateString('tr-TR')}</div></div>`:''}
    <div class="footer"><div>Ahmet ŞANLI — Rehber Öğretmen</div><div>Toplantı tarihi: ${new Date().toLocaleDateString('tr-TR')}</div></div>
    <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const iS: React.CSSProperties = { width:'100%', padding:'0.6rem 0.85rem', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'0.88rem', outline:'none', background:'var(--bg-main)', fontFamily:'inherit' };

  return (
    <div className="card" style={{ marginBottom:'1.5rem', border:'1.5px solid #D97706', animation:'fadeIn 0.2s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.05rem', fontWeight:800, color:'#D97706' }}>📋 Veli Toplantı Tutanağı</h2>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.1rem' }}>✕</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem', marginBottom:'0.85rem' }}>
        <div><label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.3rem' }}>Öğrenci *</label>
          <select value={form.studentId} onChange={e=>setForm(f=>({...f,studentId:e.target.value}))} style={iS}>
            <option value="">— Seçin —</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select></div>
        <div><label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.3rem' }}>Katılımcılar</label>
          <input value={form.participants} onChange={e=>setForm(f=>({...f,participants:e.target.value}))} style={iS} /></div>
      </div>
      <div style={{ marginBottom:'0.85rem' }}>
        <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.4rem' }}>Görüşülen Konular * (birden fazla seçilebilir)</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
          {MEETING_TOPICS.map(t=>(
            <button key={t} onClick={()=>toggleTopic(t)}
              style={{ padding:'0.3rem 0.65rem', borderRadius:'20px', border:'none', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', background:form.selectedTopics.includes(t)?'#D97706':'var(--bg-main)', color:form.selectedTopics.includes(t)?'white':'var(--text-secondary)' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem', marginBottom:'0.85rem' }}>
        <div><label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.3rem' }}>Alınan Kararlar</label>
          <textarea value={form.decisions} onChange={e=>setForm(f=>({...f,decisions:e.target.value}))} rows={3} style={{...iS,resize:'vertical'}} placeholder="Kararlar..." /></div>
        <div><label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.3rem' }}>Veliye Verilen Görevler</label>
          <textarea value={form.parentTasks} onChange={e=>setForm(f=>({...f,parentTasks:e.target.value}))} rows={3} style={{...iS,resize:'vertical'}} placeholder="Görevler..." /></div>
      </div>
      <div style={{ marginBottom:'1rem' }}>
        <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.3rem' }}>Bir Sonraki Toplantı</label>
        <input type="date" value={form.nextMeeting} onChange={e=>setForm(f=>({...f,nextMeeting:e.target.value}))} style={{...iS,width:'200px'}} />
      </div>
      <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
        <button onClick={handlePrint} style={{ padding:'0.55rem 1.1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'white', fontWeight:700, cursor:'pointer' }}>🖨️ Yazdır</button>
        <button onClick={onClose} style={{ padding:'0.55rem 1.1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'white', fontWeight:600, cursor:'pointer' }}>İptal</button>
        <button onClick={handleSave} disabled={isPending} style={{ padding:'0.55rem 1.5rem', borderRadius:'7px', border:'none', background:'#D97706', color:'white', fontWeight:800, cursor:'pointer' }}>
          {isPending?'Kaydediliyor...':'Tutanağı Kaydet'}
        </button>
      </div>
    </div>
  );
}
