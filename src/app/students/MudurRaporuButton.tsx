'use client';
import React from 'react';

export default function MudurRaporuButton({ students }: { students: any[] }) {
  const handleExportCsv = () => {
    const headers = [
      'Öğrenci Adı Soyadı',
      'Sınıfı & Alanı',
      'Toplam Yapılan Seans',
      'Son 30 Gün Seans',
      'Toplam Ödev Hedefi (Soru)',
      'Toplam Çözülen Soru',
      'Ödev Başarı Oranı',
      'Son Sınav Neti',
      'Son 3 Sınav Net Ortalaması',
      'Son Seans Süre Durumu'
    ];

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const rows = students.map((s: any) => {
      const fullName = `${s.firstName} ${s.lastName}`;
      const gradeField = `${s.grade || ''} - ${s.field || ''}`;
      const totalSessions = s.sessions?.length || 0;
      const last30DaysSessions = s.sessions?.filter((sess: any) => new Date(sess.date) >= thirtyDaysAgo).length || 0;
      
      let totalPlannedQuestions = 0;
      let totalSolvedQuestions = 0;
      s.schedules?.forEach((sched: any) => {
        sched.tasks?.forEach((task: any) => {
          totalPlannedQuestions += task.questionCount || 0;
          totalSolvedQuestions += task.solvedQuestions || 0;
        });
      });

      const homeworkRate = totalPlannedQuestions > 0 
        ? `%${Math.round((totalSolvedQuestions / totalPlannedQuestions) * 100)}` 
        : '%0';

      const latestExam = s.exams?.[0];
      const latestNet = latestExam ? latestExam.totalNet : '-';

      const last3Exams = s.exams?.slice(0, 3) || [];
      const avgNet = last3Exams.length > 0 
        ? (last3Exams.reduce((sum: number, e: any) => sum + e.totalNet, 0) / last3Exams.length).toFixed(2)
        : '-';

      const latestSession = s.sessions?.[0];
      const latestSessionTime = latestSession ? (latestSession.timeManagement || 'Belirtilmedi') : '-';

      return [
        fullName,
        gradeField,
        totalSessions.toString(),
        last30DaysSessions.toString(),
        totalPlannedQuestions.toString(),
        totalSolvedQuestions.toString(),
        homeworkRate,
        latestNet.toString(),
        avgNet,
        latestSessionTime
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map((r: string[]) => r.map(val => `"${val.replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mudur_akademik_raporu_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExportCsv} 
      className="btn-primary" 
      style={{ background: '#10B981', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
    >
      <span>📊</span> Müdür Raporu Üret / Excel İndir
    </button>
  );
}
