import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DashboardChartsClient from './DashboardChartsClient';
import DashboardQuickActions from './components/DashboardQuickActions';
import AiCommandCenter from './components/AiCommandCenter';
import CoachTaskList, { AutoTask } from './components/CoachTaskList';
import WeeklyInsight from './components/WeeklyInsight';

export default async function Home() {
  const today = new Date();

  const [students, settings, monthSessions, recentSessions] = await Promise.all([
    prisma.student.findMany({
      orderBy: { firstName: 'asc' },
      include: {
        exams:        { orderBy: { date: 'desc' } },
        parentComms:  { orderBy: { date: 'desc' } },
        schedules:    { where: { status: 'ACTIVE' }, include: { tasks: true } },
        psychoRecords:{ orderBy: { date: 'desc' } },
        appointments: { orderBy: { date: 'asc' } },
        sessions:     { orderBy: { date: 'desc' }, take: 1 },
      },
    }),
    prisma.coachSettings.findUnique({ where: { id: 'default' } }),
    // Bu ay yapılan seans sayısı
    prisma.sessionNote.count({
      where: { date: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } },
    }),
    // Son 5 seans aktivitesi
    prisma.sessionNote.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      include: { student: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const lgsDateStr = settings?.lgsExamDate || '2026-06-13';
  const lgsDate  = new Date(lgsDateStr + 'T00:00:00');
  const lgsDays  = Math.ceil((lgsDate.getTime() - today.getTime()) / 86_400_000);

  // ── Otomatik Koç Görevleri ───────────────────────────────────
  const autoTasks: AutoTask[] = [];

  // Pasif öğrenciler (10+ gün seans yok)
  students.forEach(s => {
    if (!s.sessions.length) {
      autoTasks.push({ id: `nosession-${s.id}`, type: 'urgent', text: `Henüz hiç seans yapılmadı: ${s.firstName} ${s.lastName}`, studentId: s.id, studentName: `${s.firstName} ${s.lastName}`, link: `/students/${s.id}` });
    } else {
      const days = Math.floor((today.getTime() - new Date(s.sessions[0].date).getTime()) / 86_400_000);
      if (days > 10) autoTasks.push({ id: `passive-${s.id}`, type: 'urgent', text: `${days} gündür seans yok: ${s.firstName} ${s.lastName}`, studentId: s.id, link: `/sessions` });
    }
  });

  // Veli iletişim gecikmesi
  communicationAlerts.slice(0, 3).forEach(s => {
    autoTasks.push({ id: `comm-${s.id}`, type: 'normal', text: `Veli iletişimi gecikiyor: ${s.firstName} ${s.lastName}`, studentId: s.id, link: `/parents` });
  });

  // Performans düşüşü
  performanceAlerts.slice(0, 2).forEach(s => {
    autoTasks.push({ id: `perf-${s.id}`, type: 'urgent', text: `Net düşüşü — program güncellemesi gerekli: ${s.firstName} ${s.lastName}`, studentId: s.id, link: `/students/${s.id}` });
  });

  // Psikoloji uyarısı
  psychoAlerts.slice(0, 2).forEach(s => {
    autoTasks.push({ id: `psych-${s.id}`, type: 'normal', text: `Motivasyon/kaygı desteği gerekiyor: ${s.firstName} ${s.lastName}`, studentId: s.id, link: `/students/${s.id}` });
  });

  // LGS yaklaşıyor
  if (lgsDays <= 30 && lgsDays > 0) {
    autoTasks.push({ id: 'lgs-sprint', type: 'info', text: `LGS'ye ${lgsDays} gün kaldı — son sprint planını hazırla`, link: '/assignments' });
  }

  // Bugün seans var
  if (todayAppts.length > 0) {
    autoTasks.push({ id: 'today-sessions', type: 'info', text: `Bugün ${todayAppts.length} seans planlandı — brifingleri hazırla`, link: '/takvim' });
  }

  // ── Koçluk etkinlik metrikleri ───────────────────────────────
  // Ortalama net artışı (son 2 sınav olan öğrenciler)
  const netGrowths = students
    .filter(s => s.exams.length >= 2)
    .map(s => s.exams[0].totalNet - s.exams[1].totalNet);
  const avgNetGrowth = netGrowths.length > 0
    ? (netGrowths.reduce((a, b) => a + b, 0) / netGrowths.length).toFixed(1)
    : null;

  // En çok gelişen öğrenci bu ay
  const mostImproved = students
    .filter(s => s.exams.length >= 2)
    .sort((a, b) => (b.exams[0].totalNet - b.exams[1].totalNet) - (a.exams[0].totalNet - a.exams[1].totalNet))[0] || null;

  // ── Bugünkü seanslar ─────────────────────────────────────────
  const todayAppts = students
    .flatMap(s => s.appointments
      .filter(a => {
        const d = new Date(a.date);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      })
      .map(a => ({ ...a, student: s }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // ── Risk sinyalleri ──────────────────────────────────────────
  const psychoAlerts = students.filter(s => {
    if (!s.psychoRecords.length) return false;
    const r = s.psychoRecords[0];
    return r.anxietyLevel > 7 || r.motivationLevel < 4;
  });

  const performanceAlerts = students.filter(s =>
    s.exams.length >= 2 && s.exams[0].totalNet < s.exams[1].totalNet - 5
  );

  const inactiveStudents = students.filter(s => {
    if (!s.sessions.length) return true;
    const last = new Date(s.sessions[0].date);
    return (today.getTime() - last.getTime()) / 86_400_000 > 10;
  });

  const communicationAlerts = students.filter(s => {
    if (!s.parentComms.length) return true;
    return (today.getTime() - new Date(s.parentComms[0].date).getTime()) / 86_400_000 > 14;
  });

  // ── Program tamamlanma oranı ─────────────────────────────────
  const programStats = students.reduce((acc, s) => {
    for (const sch of s.schedules) {
      for (const t of sch.tasks) {
        acc.total  += t.questionCount;
        acc.solved += t.solvedQuestions;
      }
    }
    return acc;
  }, { total: 0, solved: 0 });
  const completionRate = programStats.total > 0 ? Math.round((programStats.solved / programStats.total) * 100) : 0;

  // ── Leaderboard ──────────────────────────────────────────────
  const activeSchedules = await prisma.schedule.findMany({
    where: { status: 'ACTIVE' },
    include: { student: true, tasks: true },
  });
  const lbMap: Record<string, { name: string; solved: number; target: number }> = {};
  for (const s of activeSchedules) {
    if (!lbMap[s.studentId]) lbMap[s.studentId] = { name: `${s.student.firstName} ${s.student.lastName}`, solved: 0, target: 0 };
    for (const t of s.tasks) { lbMap[s.studentId].solved += t.solvedQuestions; lbMap[s.studentId].target += t.questionCount; }
  }
  const leaderboard = Object.entries(lbMap).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.solved - a.solved);

  // ── Grup sınav trendi ────────────────────────────────────────
  const allExams = await prisma.exam.findMany({ orderBy: { date: 'asc' } });
  const eg: Record<string, { sum: number; count: number; date: Date }> = {};
  for (const e of allExams) {
    if (!eg[e.name]) eg[e.name] = { sum: 0, count: 0, date: new Date(e.date) };
    eg[e.name].sum += e.totalNet; eg[e.name].count++;
    if (new Date(e.date) < eg[e.name].date) eg[e.name].date = new Date(e.date);
  }
  const groupExamTrend = Object.entries(eg)
    .map(([name, d]) => ({ name, Ortalama: Math.round((d.sum / d.count) * 100) / 100, date: d.date }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, Ortalama }) => ({ name, Ortalama }));

  const totalAlerts = psychoAlerts.length + performanceAlerts.length;
  const weekDay = today.toLocaleDateString('tr-TR', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Stiller ─────────────────────────────────────────────────
  const alertCard = (color: string, bg: string, border: string): React.CSSProperties => ({
    padding: '1rem 1.25rem', background: bg, border: `1px solid ${border}`,
    borderLeft: `4px solid ${color}`, borderRadius: '8px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
  });
  const statCard = (accent: string): React.CSSProperties => ({
    background: 'white', border: '1px solid var(--border)', borderRadius: '10px',
    padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
    borderTop: `3px solid ${accent}`,
  });
  const linkBtn: React.CSSProperties = {
    padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 700,
    textDecoration: 'none', fontSize: '0.78rem', whiteSpace: 'nowrap',
  };

  return (
    <div style={{ maxWidth: '1280px', width: '100%' }}>

      {/* ── SABAH BRİFİNGİ ──────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%)',
        borderRadius: '12px', padding: '2rem 2.5rem', marginBottom: '1.5rem',
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: '60px', bottom: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              {weekDay}, {dateStr}
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Günaydın, Ahmet Bey 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Bugün <strong style={{ color: 'white' }}>{todayAppts.length} öğrenci</strong> ile koçluk seansınız var.
              {totalAlerts > 0 && <> <strong style={{ color: '#FCA5A5' }}>{totalAlerts} öğrenci</strong> öncelikli ilgi bekliyor.</>}
            </p>
            <AiCommandCenter />
          </div>

          {/* LGS Geri Sayım */}
          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.18)', padding: '1.25rem 2rem',
            textAlign: 'center', backdropFilter: 'blur(12px)', flexShrink: 0,
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>LGS 2026 — Kalan Süre</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, color: 'white' }}>{lgsDays}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>gün</div>
          </div>
        </div>

        {/* Hızlı Aksiyonlar */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.12)', position: 'relative' }}>
          <DashboardQuickActions students={students} />
        </div>
      </div>

      {/* ── ÜST ÖZET KARTLAR ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Aktif Öğrenci',       value: students.length,               sub: 'portföyde',            accent: '#2563EB', icon: '👤' },
          { label: 'Bugünkü Seans',        value: todayAppts.length,             sub: 'planlandı',            accent: '#7C3AED', icon: '📅' },
          { label: 'Bu Ay Seans',          value: monthSessions,                 sub: 'gerçekleşti',          accent: '#059669', icon: '✅' },
          { label: 'Ort. Net Artışı',      value: avgNetGrowth ? `+${avgNetGrowth}` : '—', sub: 'son 2 sınav farkı', accent: '#10B981', icon: '📈' },
          { label: 'Program Tamamlama',    value: `%${completionRate}`,          sub: 'bu hafta ort.',        accent: '#F59E0B', icon: '📊' },
          { label: 'Öncelikli Eylem',      value: totalAlerts,                   sub: 'öğrenci ilgi bekliyor', accent: '#DC2626', icon: '⚠️' },
        ].map(s => (
          <div key={s.label} style={statCard(s.accent)}>
            <div style={{ fontSize: '1.1rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AI HAFTALIK İÇGÖRÜ ──────────────────────────────────── */}
      <WeeklyInsight />

      {/* ── KOÇ GÖREV LİSTESİ ──────────────────────────────────── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <CoachTaskList autoTasks={autoTasks} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* ── BUGÜNKÜ SEANS TAKVİMİ ─────────────────────────── */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>📅 Bugünkü Koçluk Seansları</h2>
            <Link href="/sessions" style={{ ...linkBtn, background: 'var(--bg-main)', color: 'var(--primary)', border: '1px solid var(--border)' }}>
              + Randevu Ekle
            </Link>
          </div>
          <div style={{ padding: '1rem' }}>
            {todayAppts.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>☕</div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.88rem' }}>Bugün için planlanmış seans yok.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>Randevu eklemek için "Seans Merkezi"ni kullanın.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {todayAppts.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: '6px', padding: '0.3rem 0.5rem', fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(a.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.student.firstName} {a.student.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.title} · {a.durationMin} dk</div>
                    </div>
                    <Link href={`/students/${a.student.id}`} style={{ ...linkBtn, background: '#EFF6FF', color: '#2563EB' }}>
                      Profile Git →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ÖNCELİKLİ EYLEM GEREKTİREN ──────────────────── */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>🎯 Öncelikli Koçluk Müdahalesi Gerektiren Öğrenciler</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Risk sinyali tespit edilen öğrenciler — bütünsel koçluk desteği gerekiyor.</p>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {psychoAlerts.map(s => (
              <div key={'p'+s.id} style={alertCard('#F59E0B', '#FFFBEB', '#FDE68A')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#78350F', marginBottom: '0.2rem' }}>
                    ⚡ {s.firstName} {s.lastName} — Motivasyon / Kaygı Desteği
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#92400E', lineHeight: 1.5 }}>
                    Son psikolojik değerlendirmede kaygı artışı veya motivasyon düşüklüğü tespit edildi. Bir sonraki seansta bütünsel destek görüşmesi planlanmalıdır.
                  </div>
                </div>
                <Link href={`/students/${s.id}`} style={{ ...linkBtn, background: '#F59E0B', color: 'white' }}>İncele</Link>
              </div>
            ))}
            {performanceAlerts.map(s => (
              <div key={'perf'+s.id} style={alertCard('#EF4444', '#FEF2F2', '#FECACA')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#7F1D1D', marginBottom: '0.2rem' }}>
                    📉 {s.firstName} {s.lastName} — Akademik Gerileme
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#991B1B', lineHeight: 1.5 }}>
                    Son iki deneme arasında 5+ net düşüşü var. Konu analizi yapılmalı ve bireysel gelişim programı güncellenmeli.
                  </div>
                </div>
                <Link href={`/students/${s.id}`} style={{ ...linkBtn, background: '#EF4444', color: 'white' }}>İncele</Link>
              </div>
            ))}
            {inactiveStudents.slice(0, 2).map(s => (
              <div key={'in'+s.id} style={alertCard('#6B7280', '#F9FAFB', '#E5E7EB')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1F2937', marginBottom: '0.2rem' }}>
                    🔇 {s.firstName} {s.lastName} — Seans Sürekliliği Koptu
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.5 }}>
                    10 günden fazladır seans yapılmadı. Süreklilik koçluğun temelidir — iletişime geçilmesi önerilir.
                  </div>
                </div>
                <Link href={`/students/${s.id}`} style={{ ...linkBtn, background: '#6B7280', color: 'white' }}>İletişim</Link>
              </div>
            ))}
            {totalAlerts === 0 && inactiveStudents.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.9rem' }}>Tüm öğrenciler yolunda</div>
                <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.2rem' }}>Kritik risk sinyali tespit edilmedi.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* ── VELİ İLETİŞİM TAKİBİ ─────────────────────────── */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>💬 Veli İletişim Köprüsü</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>14 günden uzun süredir iletişim kurulmayan aileler</p>
            </div>
            <Link href="/parents" style={{ ...linkBtn, background: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' }}>Tümünü Gör</Link>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {communicationAlerts.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>
                ✅ Tüm velilerle iletişim güncel
              </div>
            ) : communicationAlerts.slice(0, 5).map(s => (
              <div key={'c'+s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'var(--bg-main)', borderRadius: '7px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {s.parentName ? `Veli: ${s.parentName}` : 'Veli bilgisi girilmemiş'}
                  </div>
                </div>
                <Link href="/parents" style={{ ...linkBtn, background: '#25D366', color: 'white' }}>WhatsApp</Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROGRAM TAKİP TABLOSU ─────────────────────────── */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>📋 Bireysel Gelişim Programı Takibi</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Bu haftaki program tamamlanma oranları</p>
            </div>
            <Link href="/assignments" style={{ ...linkBtn, background: 'var(--primary)', color: 'white' }}>Program Hazırla</Link>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {leaderboard.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Aktif haftalık program bulunamadı.
              </div>
            ) : leaderboard.slice(0, 6).map((s, i) => {
              const pct = s.target > 0 ? Math.round((s.solved / s.target) * 100) : 0;
              const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '20px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>{i + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color, flexShrink: 0 }}>%{pct}</span>
                    </div>
                    <div style={{ height: '5px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── GELİŞİM GRAFİKLERİ ──────────────────────────────── */}
      {/* En cok gelisen + Son Aktivite */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {mostImproved && (() => {
          const growth = +(mostImproved.exams[0].totalNet - mostImproved.exams[1].totalNet).toFixed(1);
          return (
            <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>🏆 Bu Dönem En Çok Gelişen</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                  {mostImproved.firstName[0]}{mostImproved.lastName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{mostImproved.firstName} {mostImproved.lastName}</div>
                  <div style={{ fontSize: '0.82rem', color: '#065f46' }}>{mostImproved.exams[1].totalNet.toFixed(1)} → <strong>{mostImproved.exams[0].totalNet.toFixed(1)}</strong> net</div>
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: 900, fontSize: '1.5rem', color: '#059669' }}>+{growth}</div>
              </div>
              <Link href={`/students/${mostImproved.id}`} style={{ display: 'inline-block', marginTop: '0.85rem', fontSize: '0.78rem', fontWeight: 700, color: '#059669', textDecoration: 'none' }}>Profili Görüntüle →</Link>
            </div>
          );
        })()}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.88rem' }}>🕐 Son Seans Aktiviteleri</div>
          <div>
            {(recentSessions as any[]).map((s: any) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>
                  {s.student.firstName[0]}{s.student.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.student.firstName} {s.student.lastName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(s.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</div>
              </div>
            ))}
            {recentSessions.length === 0 && <div style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Henüz seans kaydı yok</div>}
          </div>
        </div>
      </div>

      <DashboardChartsClient leaderboard={leaderboard} groupExamTrend={groupExamTrend} />

    </div>
  );
}
