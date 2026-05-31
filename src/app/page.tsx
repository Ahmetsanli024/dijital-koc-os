import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DashboardChartsClient from './DashboardChartsClient';

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
    <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2.5rem', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', padding: '3rem', borderRadius: 'var(--radius-lg)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div>
          <div style={{ fontSize: '1rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            {today.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Günaydın, Ahmet Bey. ☀️
          </h1>
          <p style={{ color: '#E2E8F0', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.5 }}>
            Bugün <strong>{todayAppts.length}</strong> öğrenciyle seansınız var. Dikkat etmeniz gereken <strong>{psychoAlerts.length + performanceAlerts.length}</strong> akademik/psikolojik risk durumu tespit ettim.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/students" className="btn-primary" style={{ background: '#3B82F6', border: 'none', color: 'white', fontWeight: 600 }}>Öğrenci Envanteri</Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Sol Sütun: Günlük Takvim */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📅</span> Bugünkü Seanslarınız
            </h2>
            {todayAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
                <p>Bugün için planlanmış bir koçluk seansınız bulunmuyor.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {todayAppts.map(appt => (
                  <div key={appt.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', minWidth: '60px' }}>
                      {new Date(appt.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{appt.student.firstName} {appt.student.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{appt.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ Sütun: Yapay Zeka Analizi ve Acil Durumlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🧠</span> Psikolojik ve Akademik Uyarılar
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {psychoAlerts.map(s => (
                <div key={'psy-'+s.id} style={{ fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px', color: '#D97706', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{s.firstName} {s.lastName}:</strong> Kaygı düzeyi çok yüksek veya motivasyonu çok düşük. Bugünkü görüşmede mental desteğe odaklanın.</span>
                  <Link href={`/students/${s.id}`} style={{ fontWeight: 600, color: '#D97706' }}>İncele</Link>
                </div>
              ))}
              {performanceAlerts.map(s => (
                <div key={'perf-'+s.id} style={{ fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', color: '#B91C1C', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{s.firstName} {s.lastName}:</strong> [⚠️ Performans Alarmı] Son denemesinde bir öncekine göre 5 netten fazla düşüş var. Özel test üretmeyi değerlendirin.</span>
                  <Link href={`/students/${s.id}`} style={{ fontWeight: 600, color: '#B91C1C' }}>İncele</Link>
                </div>
              ))}
              {psychoAlerts.length === 0 && performanceAlerts.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Şu an için kritik bir risk tespit edilmedi.</p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
               <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#10B981', marginBottom: '1rem' }}>📞 Veli İletişimi Gecikenler</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {communicationAlerts.slice(0, 3).map(s => (
                   <div key={'comm-'+s.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '4px' }}>
                     <span style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</span>
                     <Link href="/parents" style={{ color: 'var(--primary)' }}>Mesaj At</Link>
                   </div>
                 ))}
                 {communicationAlerts.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>Tüm velilerle iletişim güncel.</span>}
               </div>
            </div>
          </div>

        </div>
      </div>

      <DashboardChartsClient leaderboard={leaderboard} groupExamTrend={groupExamTrend} />
    </main>
  );
}
