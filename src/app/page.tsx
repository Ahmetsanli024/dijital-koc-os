import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DashboardChartsClient from './DashboardChartsClient';
import DashboardQuickActions from './components/DashboardQuickActions';
import AiCommandCenter from './components/AiCommandCenter';
import LgsSimulatorWidget from './components/LgsSimulatorWidget';

export default async function Home() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' },
    include: {
      exams: { orderBy: { date: 'desc' } },
      parentComms: { orderBy: { date: 'desc' } },
      schedules: {
        where: { status: 'ACTIVE' },
        include: { tasks: true }
      },
      psychoRecords: { orderBy: { date: 'desc' } },
      appointments: { orderBy: { date: 'asc' } },
      sessions: { select: { id: true } }
    }
  });

  const today = new Date();
  const lgsDate = new Date('2026-06-13T00:00:00');
  const lgsDaysLeft = Math.ceil((lgsDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  // 1. Appointments for today
  const todayAppts = students.flatMap(s => 
    s.appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate.getDate() === today.getDate() && 
             apptDate.getMonth() === today.getMonth() && 
             apptDate.getFullYear() === today.getFullYear();
    }).map(a => ({ ...a, student: s }))
  ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());



  // 3. Psycho Alerts (Anxiety > 7 or Motivation < 4 in recent record)
  const psychoAlerts = students.filter(s => {
    if (s.psychoRecords.length === 0) return false;
    const latest = s.psychoRecords[0];
    return latest.anxietyLevel > 7 || latest.motivationLevel < 4;
  });

  // 4. Performance Drop
  const performanceAlerts = students.filter(s => {
    if (s.exams.length < 2) return false;
    return s.exams[0].totalNet < s.exams[1].totalNet - 5;
  });



  // 5. Parent Comm Alerts (> 14 days)
  const communicationAlerts = students.filter(s => {
    if (s.parentComms.length === 0) return true;
    const lastCommDate = new Date(s.parentComms[0].date);
    const diffDays = Math.floor((today.getTime() - lastCommDate.getTime()) / (1000 * 3600 * 24));
    return diffDays > 14;
  });

  // 6. Calculate Leaderboard (ranking students by solved questions from active schedules)
  const activeSchedules = await prisma.schedule.findMany({
    where: { status: 'ACTIVE' },
    include: {
      student: true,
      tasks: true
    }
  });

  const leaderboardMap: { [studentId: string]: { name: string; solved: number; target: number } } = {};
  for (const schedule of activeSchedules) {
    const sId = schedule.studentId;
    if (!leaderboardMap[sId]) {
      leaderboardMap[sId] = {
        name: `${schedule.student.firstName} ${schedule.student.lastName}`,
        solved: 0,
        target: 0
      };
    }
    for (const task of schedule.tasks) {
      leaderboardMap[sId].solved += task.solvedQuestions;
      leaderboardMap[sId].target += task.questionCount;
    }
  }

  const leaderboard = Object.entries(leaderboardMap)
    .map(([id, info]) => ({
      id,
      ...info
    }))
    .sort((a, b) => b.solved - a.solved);

  // 7. Calculate Group Exam Net Average Trend
  const allExams = await prisma.exam.findMany({
    orderBy: { date: 'asc' }
  });

  const examGroups: { [name: string]: { totalNetSum: number; count: number; date: Date } } = {};
  for (const exam of allExams) {
    const key = exam.name;
    if (!examGroups[key]) {
      examGroups[key] = {
        totalNetSum: 0,
        count: 0,
        date: new Date(exam.date)
      };
    }
    examGroups[key].totalNetSum += exam.totalNet;
    examGroups[key].count += 1;
    if (new Date(exam.date) < examGroups[key].date) {
      examGroups[key].date = new Date(exam.date);
    }
  }

  const groupExamTrend = Object.entries(examGroups)
    .map(([name, data]) => ({
      name,
      Ortalama: Math.round((data.totalNetSum / data.count) * 100) / 100,
      date: data.date
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, Ortalama }) => ({ name, Ortalama }));

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', animation: 'fadeInSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Premium Hero Banner */}
      <header style={{ 
        marginBottom: '2rem', 
        background: 'linear-gradient(135deg, #022C22 0%, #064E3B 100%)', 
        padding: '3rem', 
        borderRadius: 'var(--radius-lg)', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '2rem',
        boxShadow: '0 20px 40px rgba(6, 78, 59, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ fontSize: '0.9rem', color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '0.5rem' }}>
              {today.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.04em', color: '#FFFFFF' }}>
              Ana Operasyon Paneli
            </h1>
            <p style={{ color: '#A7F3D0', fontSize: '1.15rem', maxWidth: '600px', lineHeight: 1.6, fontWeight: 300, marginBottom: '2rem' }}>
              Bugün <strong>{todayAppts.length}</strong> öğrenciyle seansınız var. Sistem, dikkat etmeniz gereken <strong>{psychoAlerts.length + performanceAlerts.length}</strong> riskli durum tespit etti.
            </p>

            {/* YZ Destekli Komuta Merkezi */}
            <AiCommandCenter />
          </div>

          {/* LGS/YKS Countdown Widget */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '1.5rem 2.5rem',
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(20px)',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            minWidth: '280px'
          }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6EE7B7', fontWeight: 800, marginBottom: '0.5rem' }}>Büyük Sınava (2026) Son</h3>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '0.2rem', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
              {lgsDaysLeft}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#A7F3D0' }}>GÜN KALDI</div>
          </div>
        </div>

        {/* Quick Actions Glass Bar */}
        <DashboardQuickActions students={students} />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
        
        {/* Sol Sütun: Günlük Ajanda Timeline */}
        <div>
          <div className="card" style={{ height: '100%', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>📅</div>
              Bugünkü Ajanda
            </h2>
            {todayAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>☕</div>
                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Bugün için planlanmış seans bulunmuyor.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '19px', top: '20px', bottom: '20px', width: '2px', background: 'var(--border)' }} />
                {todayAppts.map((appt, index) => (
                  <div key={appt.id} style={{ 
                    display: 'flex', 
                    gap: '1.5rem', 
                    paddingBottom: index === todayAppts.length - 1 ? '0' : '2rem',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', boxShadow: '0 0 0 4px var(--bg-card)' }}>
                      {new Date(appt.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ flex: 1, padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transition: 'var(--transition)' }} className="card-hover-item">
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{appt.student.firstName} {appt.student.lastName}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{appt.title}</div>
                      <Link href={`/students/${appt.student.id}`} style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Profile Git →</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ Sütun: Yapay Zeka Analizi ve Acil Durumlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* AI Intelligence Board */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>🧠</div>
              Koçluk İçgörüleri & Alarmlar
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {psychoAlerts.map(s => (
                <div key={'psy-'+s.id} style={{ 
                  padding: '1.25rem', 
                  background: '#FEF3C7', 
                  borderRadius: 'var(--radius-md)', 
                  color: '#92400E', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #FCD34D'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>⚠️</span> {s.firstName} {s.lastName}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Kaygı düzeyi yüksek veya motivasyonu düşük. <strong>Öncelikli psikolojik görüşme planlayın.</strong></div>
                  </div>
                  <Link href={`/students/${s.id}`} className="btn" style={{ background: '#F59E0B', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>İncele</Link>
                </div>
              ))}
              {performanceAlerts.map(s => (
                <div key={'perf-'+s.id} style={{ 
                  padding: '1.25rem', 
                  background: '#FEE2E2', 
                  borderRadius: 'var(--radius-md)', 
                  color: '#991B1B', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #FCA5A5'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📉</span> {s.firstName} {s.lastName}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Son denemede 5 netten fazla düşüş tespit edildi. <strong>Zayıf konu analizi gereklidir.</strong></div>
                  </div>
                  <Link href={`/students/${s.id}`} className="btn" style={{ background: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>İncele</Link>
                </div>
              ))}
              {psychoAlerts.length === 0 && performanceAlerts.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#F0FDF4', borderRadius: 'var(--radius-md)', color: '#064E3B', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                  <div style={{ fontWeight: 700 }}>Harika Haber!</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Şu an için akademik veya psikolojik kritik bir risk tespit edilmedi. Sistem stabil.</div>
                </div>
              )}
            </div>
          </div>

          {/* Veli İletişimi Board */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2.5rem' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>💬</div>
                 Veli İletişimi Gecikenler
               </h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 {communicationAlerts.slice(0, 3).map(s => (
                   <div key={'comm-'+s.id} style={{ 
                     fontSize: '0.9rem', 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center',
                     padding: '1rem 1.25rem', 
                     background: '#F8FAFC', 
                     borderRadius: 'var(--radius-md)',
                     border: '1px solid var(--border)' 
                   }}>
                     <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.firstName} {s.lastName}</span>
                     <Link href="/parents" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Mesaj At</Link>
                   </div>
                 ))}
                 {communicationAlerts.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>Tüm velilerle iletişim güncel.</span>}
               </div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <LgsSimulatorWidget />
      </div>
      <DashboardChartsClient leaderboard={leaderboard} groupExamTrend={groupExamTrend} />
    </main>
  );
}
