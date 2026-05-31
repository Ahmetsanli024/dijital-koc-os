'use client';
import React, { useState } from 'react';
import { addFinanceRecord, addAppointment, deleteFinanceRecord, updateAppointmentStatus } from '../actions/finance';

export default function FinanceClient({ students }: { students: any[] }) {
  const [activeTab, setActiveTab] = useState('takvim');

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
      'Kalan Seans Kredisi',
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

      const totalPaid = s.finances
        ?.filter((f: any) => f.type === 'PAYMENT' && f.status === 'PAID')
        ?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0;
      const remainingCredits = ((totalPaid / 1500) - totalSessions).toFixed(1);

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
        remainingCredits,
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
    link.setAttribute('download', `mudur_raporu_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [selectedStudent, setSelectedStudent] = useState('');
  
  // Finance Form
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PAYMENT'); // PAYMENT, DEBT
  const [status, setStatus] = useState('PAID');
  
  // Appt Form
  const [apptTitle, setApptTitle] = useState('Haftalık Koçluk Seansı');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');

  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount || !title) return;
    
    const res = await addFinanceRecord({
      studentId: selectedStudent,
      title,
      amount: parseFloat(amount),
      type,
      status
    });
    
    if (res.success) {
      alert('Finans kaydı eklendi.');
      setAmount(''); setTitle('');
    } else {
      alert('Hata: ' + res.error);
    }
  };

  const handleAddAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !apptDate || !apptTime) return;
    
    const dateTime = new Date(`${apptDate}T${apptTime}`);
    const res = await addAppointment({
      studentId: selectedStudent,
      title: apptTitle,
      date: dateTime,
      durationMin: 45
    });
    
    if (res.success) {
      alert('Randevu eklendi.');
    } else {
      alert('Hata: ' + res.error);
    }
  };

  // Calculate totals
  let totalIncome = 0;
  let totalDebt = 0;
  
  const allFinances = students.flatMap(s => s.finances.map((f:any) => ({ ...f, student: s })));
  const allAppts = students.flatMap(s => s.appointments.map((a:any) => ({ ...a, student: s })));
  
  allFinances.forEach(f => {
    if (f.type === 'PAYMENT' && f.status === 'PAID') totalIncome += f.amount;
    if (f.type === 'DEBT' || f.status === 'PENDING') totalDebt += f.amount;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>İş ve Finans Yönetimi</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Öğrenci ödemelerini, alacaklarınızı ve seans takviminizi yönetin.</p>
        </div>
        <div>
          <button 
            onClick={handleExportCsv} 
            className="btn-primary" 
            style={{ background: '#10B981', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <span>📊</span> Müdür Raporu Üret / Excel İndir
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="card" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none' }}>
          <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '0.5rem' }}>Toplam Tahsilat</div>
          <div style={{ fontSize: '3rem', fontWeight: 900 }}>₺{totalIncome.toLocaleString('tr-TR')}</div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', border: 'none' }}>
          <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '0.5rem' }}>Bekleyen Alacak</div>
          <div style={{ fontSize: '3rem', fontWeight: 900 }}>₺{totalDebt.toLocaleString('tr-TR')}</div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', border: 'none' }}>
          <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '0.5rem' }}>Aktif Randevu</div>
          <div style={{ fontSize: '3rem', fontWeight: 900 }}>{allAppts.filter(a => a.status === 'SCHEDULED').length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('takvim')} style={{ padding: '1rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'takvim' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'takvim' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'takvim' ? 700 : 500, cursor: 'pointer', fontSize: '1rem' }}>📅 Takvim ve Randevular</button>
        <button onClick={() => setActiveTab('finans')} style={{ padding: '1rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'finans' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'finans' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'finans' ? 700 : 500, cursor: 'pointer', fontSize: '1rem' }}>💰 Finans ve Ödemeler</button>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sol Panel: Liste */}
        <div style={{ flex: 2 }}>
          {activeTab === 'takvim' && (
            <div className="card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Yaklaşan Randevular</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Öğrenci</th>
                    <th>Tarih/Saat</th>
                    <th>Açıklama</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {allAppts.filter(a => a.status === 'SCHEDULED').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(appt => (
                    <tr key={appt.id}>
                      <td style={{ fontWeight: 600 }}>{appt.student.firstName} {appt.student.lastName}</td>
                      <td>{new Date(appt.date).toLocaleString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}</td>
                      <td>{appt.title}</td>
                      <td>
                        <button onClick={() => updateAppointmentStatus(appt.id, 'COMPLETED')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--success)', borderColor: 'var(--success)' }}>✔ Tamamlandı</button>
                      </td>
                    </tr>
                  ))}
                  {allAppts.filter(a => a.status === 'SCHEDULED').length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Yaklaşan randevu yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'finans' && (
            <div className="card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Son Finans Hareketleri</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Öğrenci</th>
                    <th>Açıklama</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {allFinances.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15).map(fin => (
                    <tr key={fin.id}>
                      <td>{new Date(fin.date).toLocaleDateString('tr-TR')}</td>
                      <td style={{ fontWeight: 600 }}>{fin.student.firstName} {fin.student.lastName}</td>
                      <td>{fin.title}</td>
                      <td style={{ fontWeight: 800, color: fin.type === 'PAYMENT' ? 'var(--success)' : 'var(--danger)' }}>
                        {fin.type === 'PAYMENT' ? '+' : '-'}₺{fin.amount}
                      </td>
                      <td>
                        <span className={`badge ${fin.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                          {fin.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sağ Panel: Ekleme Formu */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {activeTab === 'takvim' ? 'Randevu Oluştur' : 'Finans Kaydı Ekle'}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Öğrenci Seçin</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} style={{ width: '100%' }}>
                <option value="">-- Seçiniz --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>

            {activeTab === 'takvim' ? (
              <form onSubmit={handleAddAppt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Başlık</label>
                  <input type="text" value={apptTitle} onChange={e => setApptTitle(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Tarih</label>
                    <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} required style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Saat</label>
                    <input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} required style={{ width: '100%' }} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Takvime Ekle</button>
              </form>
            ) : (
              <form onSubmit={handleAddFinance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Kayıt Türü</label>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
                    <option value="PAYMENT">Tahsilat / Ödeme Geldi</option>
                    <option value="DEBT">Borç / Alacak Ekle</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Açıklama (Örn: Kasım Ayı Koçluk)</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Tutar (₺)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%' }} placeholder="Örn: 1500" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Durum</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="PAID">Ödendi (Tamamlandı)</option>
                    <option value="PENDING">Bekliyor (Borçlu)</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', background: 'var(--success)' }}>Kaydı Ekle</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
