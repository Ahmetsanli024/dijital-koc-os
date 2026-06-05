'use client';
import React, { useState, useTransition, useMemo } from 'react';
import { toggleTaskCompletion } from '../../actions/schedule';

const DAYS_TR: Record<string, string> = {
  'PAZARTESİ': 'Pzt', 'SALI': 'Sal', 'ÇARŞAMBA': 'Çar',
  'PERŞEMBE': 'Per', 'CUMA': 'Cum', 'CUMARTESİ': 'Cmt', 'PAZAR': 'Paz',
};
const SUBJECT_COLORS: Record<string, string> = {
  'TÜRKÇE': '#7C3AED', 'MATEMATİK': '#2563EB', 'FEN BİLİMLERİ': '#059669',
  'T.C. İNKILAP TARİHİ': '#D97706', 'İNGİLİZCE': '#DB2777', 'DİN KÜLTÜRÜ': '#7C3AED',
};

const MOOD_EMOJIS = ['', '😔', '😐', '😊', '😄'];
const MOOD_LABELS = ['', 'Zor Gün', 'İdare Eder', 'İyi', 'Harika!'];
const MOOD_COLORS = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

// Streak hesapla (ardışık günler)
function calcStreak(checkIns: any[]): number {
  if (!checkIns.length) return 0;
  let streak = 0;
  const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let expected = new Date(today);
  for (const ci of sorted) {
    const d = new Date(ci.date); d.setHours(0, 0, 0, 0);
    if (d.getTime() === expected.getTime()) { streak++; expected.setDate(expected.getDate() - 1); }
    else if (d.getTime() < expected.getTime()) break;
  }
  return streak;
}

export default function PortalClient({ student }: { student: any }) {
  const [activeTab, setActiveTab]   = useState<'home'|'tasks'|'exams'|'badges'|'checkin'>('home');
  const [tasks, setTasks]           = useState(student.schedules?.[0]?.tasks || []);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast]           = useState('');
  const [checkIns, setCheckIns]     = useState<any[]>(student.checkIns || []);
  const [checkInForm, setCheckInForm] = useState({ mood: 0, solvedCount: '', hardTopic: '', note: '' });
  const [checkInDone, setCheckInDone] = useState(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    return (student.checkIns || []).some((c: any) => new Date(c.date) >= today);
  });
  const streak = calcStreak(checkIns);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const handleCheckIn = () => {
    if (!checkInForm.mood) { showToast('Ruh halini seç! 😊'); return; }
    startTransition(async () => {
      const res = await fetch('/api/checkin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, ...checkInForm, solvedCount: Number(checkInForm.solvedCount) || 0 }),
      });
      const data = await res.json();
      if (data.checkIn) {
        setCheckIns(prev => [{ ...data.checkIn }, ...prev.filter((c: any) => c.id !== data.checkIn.id)]);
        setCheckInDone(true);
        setActiveTab('home');
        showToast('Check-in tamamlandı! 🎉');
      }
    });
  };

  const schedule = student.schedules?.[0];
  const done     = tasks.filter((t: any) => t.isCompleted).length;
  const total    = tasks.length;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;

  const lastExam   = student.exams?.[0];
  const nextAppt   = student.appointments?.[0];
  const psycho     = student.psychoRecords?.[0];
  const lgsDate    = new Date('2026-06-13');
  const lgsDays    = Math.ceil((lgsDate.getTime() - Date.now()) / 86_400_000);

  // Net trendi
  const netTrend = student.exams?.length >= 2
    ? student.exams[0].totalNet > student.exams[1].totalNet ? '↑' : '↓'
    : null;

  // Günlük görevler — bugünün günü
  const todayKey = ['PAZAR','PAZARTESİ','SALI','ÇARŞAMBA','PERŞEMBE','CUMA','CUMARTESİ'][new Date().getDay()];
  const todayTasks  = tasks.filter((t: any) => t.day === todayKey || t.day === todayKey.substring(0,3));
  const todayDone   = todayTasks.filter((t: any) => t.isCompleted).length;

  // Streak (kaç gün üst üste en az 1 görev yapıldı — basit tahmini)
  const streak = student.badges?.filter((b: any) => b.icon === '🔥').length || 0;

  const handleToggle = (taskId: string, current: boolean) => {
    startTransition(async () => {
      await toggleTaskCompletion(taskId, !current);
      setTasks((prev: any[]) => prev.map(t => t.id === taskId ? { ...t, isCompleted: !current } : t));
      if (!current) showToast('Harika! Görevi tamamladın 🎉');
    });
  };

  // Gruplama: derse göre
  const tasksBySubject = useMemo(() => {
    const g: Record<string, any[]> = {};
    tasks.forEach((t: any) => {
      if (!g[t.subject]) g[t.subject] = [];
      g[t.subject].push(t);
    });
    return g;
  }, [tasks]);

  const motivationQuotes = [
    `${student.firstName}, küçük adımlar büyük hedeflere ulaştırır. Devam et!`,
    `Her çözdüğün soru seni hedefe bir adım daha yaklaştırıyor.`,
    `Bugün yorulabilirsin, ama bırakma. ${student.firstName}, sen bunu hak ediyorsun.`,
    `Başarı tesadüf değildir — sen her gün inşa ediyorsun.`,
  ];
  const quote = motivationQuotes[new Date().getDay() % motivationQuotes.length];

  // ── Stiller ──────────────────────────────────────────────────
  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', ...extra,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter',system-ui,sans-serif", paddingBottom: '80px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: 'white', padding: '0.7rem 1.5rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', padding: '1.5rem 1.25rem 2rem', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: '0.25rem' }}>
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.2rem' }}>
              Merhaba, {student.firstName}! 👋
            </h1>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
              {student.grade} · {student.target || 'Hedef belirle'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LGS'ye</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{lgsDays}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>gün kaldı</div>
          </div>
        </div>

        {/* Streak + Check-in */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1 }}>{streak} Gün</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.65)' }}>Seri</div>
            </div>
          </div>
          <button onClick={() => setActiveTab('checkin')}
            style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', background: checkInDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            {checkInDone ? '✅ Bugün Yapıldı' : '📝 Günlük Kontrol'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⭐</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1 }}>{(done * 10) + (checkIns.length * 5)}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.65)' }}>Puan</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {schedule && (
          <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.45rem' }}>
              <span>Bu Haftanın Programı</span>
              <span style={{ color: pct >= 70 ? '#6EE7B7' : '#FCD34D' }}>{done}/{total} Görev · %{pct}</span>
            </div>
            <div style={{ height: '7px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? '#10B981' : '#F59E0B', borderRadius: '4px', transition: 'width 0.8s' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>

        {/* ── ANA PANEL ──────────────────────────────────────── */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            {/* Bugünün Görevleri */}
            {todayTasks.length > 0 && (
              <div style={card()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>📅 Bugünün Görevleri</div>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>{todayDone}/{todayTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {todayTasks.map((t: any) => (
                    <div key={t.id} onClick={() => handleToggle(t.id, t.isCompleted)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: t.isCompleted ? '#F0FDF4' : '#F8FAFC', borderRadius: '9px', cursor: 'pointer', border: `1px solid ${t.isCompleted ? '#BBF7D0' : '#E2E8F0'}`, opacity: isPending ? 0.7 : 1, transition: 'all 0.2s' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${t.isCompleted ? '#10B981' : '#CBD5E1'}`, background: t.isCompleted ? '#10B981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {t.isCompleted && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: t.isCompleted ? '#6B7280' : '#111827', textDecoration: t.isCompleted ? 'line-through' : 'none' }}>
                          {t.subject}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t.topic} · {t.questionCount} soru</div>
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', background: (SUBJECT_COLORS[t.subject] || '#6B7280') + '18', color: SUBJECT_COLORS[t.subject] || '#6B7280' }}>
                        {DAYS_TR[t.day] || t.day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sonraki Seans */}
            {nextAppt && (
              <div style={{ ...card(), background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)', borderColor: '#BFDBFE' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>📅 Sonraki Koçluk Seansın</div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                  {new Date(nextAppt.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
                  {new Date(nextAppt.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · {nextAppt.title}
                </div>
              </div>
            )}

            {/* Son Sınav */}
            {lastExam && (
              <div style={card()}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>📊 Son Deneme Sonucu</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '4px solid #2563EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563EB', lineHeight: 1 }}>{lastExam.totalNet}</div>
                    <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700 }}>NET</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                      {lastExam.name}
                      {netTrend && <span style={{ marginLeft: '0.5rem', color: netTrend === '↑' ? '#10B981' : '#EF4444', fontWeight: 900 }}>{netTrend}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(lastExam.date).toLocaleDateString('tr-TR')}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', background: '#F0FDF4', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>✓ {lastExam.totalCorrect}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#EF4444', background: '#FEF2F2', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>✗ {lastExam.totalIncorrect}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Koçun Mesajı */}
            <div style={{ ...card(), borderLeft: '4px solid #2563EB' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💬 Koçunun Mesajı</div>
              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.65, fontStyle: 'italic' }}>
                {student.notes || quote}
              </p>
              <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>— Ahmet ŞANLI, Rehber Öğretmen</div>
            </div>

            {/* Rozetler */}
            {student.badges?.length > 0 && (
              <div style={card()}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.85rem' }}>🏆 Kazandığın Rozetler ({student.badges.length})</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {student.badges.map((b: any) => (
                    <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem', minWidth: '70px' }}>
                      <div style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>{b.icon}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', color: '#374151' }}>{b.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GÖREVLER ────────────────────────────────────────── */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Bu Haftanın Programı</h2>
              <span style={{ fontSize: '0.8rem', color: pct >= 70 ? '#10B981' : '#F59E0B', fontWeight: 800 }}>%{pct} tamamlandı</span>
            </div>

            {!schedule ? (
              <div style={{ ...card(), textAlign: 'center', padding: '3rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Program Henüz Hazırlanmadı</div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Koçun yakında bu haftaki programını oluşturacak.</div>
              </div>
            ) : (
              Object.entries(tasksBySubject).map(([subject, subTasks]) => {
                const color = SUBJECT_COLORS[subject] || '#64748B';
                const subDone = (subTasks as any[]).filter((t: any) => t.isCompleted).length;
                return (
                  <div key={subject} style={card()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color }}>{subject}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: subDone === (subTasks as any[]).length ? '#10B981' : '#94A3B8' }}>
                        {subDone}/{(subTasks as any[]).length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {(subTasks as any[]).map((t: any) => (
                        <div key={t.id} onClick={() => handleToggle(t.id, t.isCompleted)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.75rem', background: t.isCompleted ? '#F0FDF4' : '#F8FAFC', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${t.isCompleted ? '#BBF7D0' : '#E2E8F0'}`, transition: 'all 0.15s' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${t.isCompleted ? '#10B981' : '#CBD5E1'}`, background: t.isCompleted ? '#10B981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {t.isCompleted && <span style={{ color: 'white', fontSize: '0.65rem' }}>✓</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: t.isCompleted ? '#9CA3AF' : '#1F2937', textDecoration: t.isCompleted ? 'line-through' : 'none' }}>
                              {t.topic || 'Genel Çalışma'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: '0.4rem' }}>{t.questionCount} soru</span>
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8' }}>{DAYS_TR[t.day] || t.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── SINAV GEÇMİŞİ ───────────────────────────────────── */}
        {activeTab === 'exams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>Deneme Sınavı Geçmişi</h2>
            {student.exams?.length === 0 ? (
              <div style={{ ...card(), textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                <div style={{ fontWeight: 700 }}>Henüz sınav kaydı yok</div>
              </div>
            ) : student.exams?.map((e: any, i: number, arr: any[]) => {
              const prev = arr[i + 1];
              const diff = prev ? +(e.totalNet - prev.totalNet).toFixed(1) : null;
              return (
                <div key={e.id} style={card({ display: 'flex', alignItems: 'center', gap: '1rem' })}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `3px solid ${diff === null ? '#2563EB' : diff > 0 ? '#10B981' : '#EF4444'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#2563EB', lineHeight: 1 }}>{e.totalNet}</div>
                    <div style={{ fontSize: '0.55rem', color: '#94A3B8', fontWeight: 700 }}>NET</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{new Date(e.date).toLocaleDateString('tr-TR')}</div>
                  </div>
                  {diff !== null && (
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', color: diff > 0 ? '#10B981' : '#EF4444', flexShrink: 0 }}>
                      {diff > 0 ? '+' : ''}{diff}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ROZETLER ────────────────────────────────────────── */}
        {/* ── CHECK-IN SEKMESİ ──────────────────────────────────── */}
        {activeTab === 'checkin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              📝 Günlük Check-in {checkInDone && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981', background: '#F0FDF4', padding: '0.15rem 0.5rem', borderRadius: '10px', marginLeft: '0.5rem' }}>Bugün Yapıldı ✅</span>}
            </h2>

            {/* Ruh Hali */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Bugün nasılsın?</div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {[1,2,3,4].map(m => (
                  <button key={m} onClick={() => setCheckInForm(f => ({ ...f, mood: m }))}
                    style={{ flex: 1, padding: '0.75rem 0.5rem', borderRadius: '10px', border: `2px solid ${checkInForm.mood === m ? MOOD_COLORS[m] : '#E2E8F0'}`, background: checkInForm.mood === m ? MOOD_COLORS[m] + '18' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>{MOOD_EMOJIS[m]}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: checkInForm.mood === m ? MOOD_COLORS[m] : '#94A3B8' }}>{MOOD_LABELS[m]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Soru Sayısı */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.6rem' }}>Bugün kaç soru çözdün?</div>
              <input type="number" value={checkInForm.solvedCount} onChange={e => setCheckInForm(f => ({ ...f, solvedCount: e.target.value }))}
                placeholder="0" min={0}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '9px', border: '1.5px solid #E2E8F0', fontSize: '1rem', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
            </div>

            {/* Zorlu Konu */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.6rem' }}>Zorlandığın konu var mı?</div>
              <input value={checkInForm.hardTopic} onChange={e => setCheckInForm(f => ({ ...f, hardTopic: e.target.value }))}
                placeholder="Örn: Çarpanlar ve Katlar (opsiyonel)"
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '9px', border: '1.5px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            {/* Not */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.6rem' }}>Koçuna not (opsiyonel)</div>
              <textarea value={checkInForm.note} onChange={e => setCheckInForm(f => ({ ...f, note: e.target.value }))} rows={2}
                placeholder="Sormak istediğin bir şey var mı?"
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '9px', border: '1.5px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
            </div>

            <button onClick={handleCheckIn} disabled={isPending || !checkInForm.mood}
              style={{ padding: '0.9rem', borderRadius: '10px', border: 'none', background: checkInForm.mood ? '#2563EB' : '#CBD5E1', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: checkInForm.mood ? 'pointer' : 'not-allowed' }}>
              {isPending ? '⏳ Kaydediliyor...' : checkInDone ? '🔄 Güncelle' : '✅ Check-in Tamamla'}
            </button>

            {/* Son check-in'ler */}
            {checkIns.length > 0 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Son Check-in'ler</div>
                {checkIns.slice(0, 5).map((ci: any) => (
                  <div key={ci.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'white', borderRadius: '9px', border: '1px solid #E2E8F0', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{MOOD_EMOJIS[ci.mood]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{new Date(ci.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{ci.solvedCount > 0 && `${ci.solvedCount} soru · `}{ci.hardTopic || ''}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: MOOD_COLORS[ci.mood] }}>{MOOD_LABELS[ci.mood]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>🏆 Başarı Rozetlerin</h2>
            {student.badges?.length === 0 ? (
              <div style={{ ...card(), textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎯</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Henüz rozet kazanılmadı</div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Görevlerini tamamladıkça rozetler kazanacaksın!</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {student.badges.map((b: any) => (
                  <div key={b.id} style={{ ...card({ textAlign: 'center', padding: '1.25rem 0.75rem' }) }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{b.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.25rem' }}>{b.title}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{new Date(b.dateAwarded).toLocaleDateString('tr-TR')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ALT NAVİGASYON (Mobil) ──────────────────────────── */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {([
          { tab: 'home',    icon: '🏠', label: 'Ana Panel' },
          { tab: 'tasks',   icon: '📋', label: 'Görevler',  badge: total - done > 0 ? total - done : null },
          { tab: 'checkin', icon: '📝', label: 'Check-in',  badge: !checkInDone ? '!' : null },
          { tab: 'exams',   icon: '📊', label: 'Sınavlar' },
          { tab: 'badges',  icon: '🏆', label: 'Rozetler',  badge: student.badges?.length || null },
        ] as const).map(btn => (
          <button key={btn.tab} onClick={() => setActiveTab(btn.tab)}
            style={{ flex: 1, padding: '0.75rem 0.5rem 0.6rem', border: 'none', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: '1.2rem' }}>{btn.icon}</span>
              {(btn as any).badge ? (
                <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#EF4444', color: 'white', borderRadius: '10px', fontSize: '0.55rem', fontWeight: 900, padding: '0.05rem 0.3rem', lineHeight: 1.4 }}>{(btn as any).badge}</span>
              ) : null}
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: activeTab === btn.tab ? 800 : 600, color: activeTab === btn.tab ? '#2563EB' : '#94A3B8' }}>
              {btn.label}
            </span>
            {activeTab === btn.tab && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '24px', height: '2px', background: '#2563EB', borderRadius: '2px 2px 0 0' }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
