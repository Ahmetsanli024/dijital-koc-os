"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Bot, FileText, Printer, Save, Trash2, Check, RefreshCw, Upload, Sparkles, User, Calendar, BookOpen } from 'lucide-react';
import PrintView from './PrintView';
import { createSchedule } from '../actions/schedule';

const SUBJECTS = ['TÜRKÇE', 'MATEMATİK', 'FEN BİLİMLERİ', 'T.C. İNKILAP TARİHİ', 'İNGİLİZCE', 'DİN KÜLTÜRÜ', 'PARAGRAF'];
const DAYS = ['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'];

const SUBJECT_COLORS: Record<string, string> = {
  'TÜRKÇE': '#6366f1',
  'MATEMATİK': '#3b82f6',
  'FEN BİLİMLERİ': '#10b981',
  'T.C. İNKILAP TARİHİ': '#f59e0b',
  'İNGİLİZCE': '#ec4899',
  'DİN KÜLTÜRÜ': '#8b5cf6',
  'PARAGRAF': '#64748b'
};

const DAY_MAP: Record<string, string> = {
  'PTESİ': 'PAZARTESİ', 'SALI': 'SALI', 'ÇARŞ': 'ÇARŞAMBA',
  'PERŞ': 'PERŞEMBE', 'CUMA': 'CUMA', 'CMTESİ': 'CUMARTESİ', 'PAZAR': 'PAZAR',
};

export default function WizardClient({ students }: { students: any[] }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [scheduleData, setScheduleData] = useState<Record<string, Record<string, { q: string, t: string }>>>({});
  const [studentNote, setStudentNote] = useState('Bu program senin genel durumun baz alınarak hazırlanmıştır. Görevlerini sorumluluk bilinciyle, ertelemeden tamamlaman başarının en büyük anahtarıdır. Sana inancım tam!');
  
  // AI States
  const [smartFillText, setSmartFillText] = useState('');
  const [isSmartFilling, setIsSmartFilling] = useState(false);
  const [isPdfScanning, setIsPdfScanning] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  useEffect(() => {
    // URL'den studentId gelmişse otomatik seç
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('studentId');
    if (sid && students.some(s => s.id === sid)) {
      setSelectedStudentId(sid);
    }
  }, [students]);

  const handleCellChange = (subject: string, day: string, field: 'q' | 't', value: string) => {
    setScheduleData(prev => {
      const next = { ...prev };
      if (!next[subject]) next[subject] = {};
      if (!next[subject][day]) next[subject][day] = { q: '', t: '' };
      next[subject][day][field] = value;
      return next;
    });
  };

  const handleSmartFill = async () => {
    if (!smartFillText.trim()) return;
    setIsSmartFilling(true);
    setAiMessage(null);
    try {
      const res = await fetch('/api/smart-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: smartFillText, topicsMap: {} }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bilinmeyen hata.');

      const fills: any[] = data.fills || [];
      if (!fills.length) throw new Error('Metinden ders bilgisi çıkarılamadı.');

      setScheduleData(prev => {
        const next = { ...prev };
        fills.forEach(f => {
          const subject = SUBJECTS.find(s =>
            s.toUpperCase().includes(f.subject?.toUpperCase()) ||
            f.subject?.toUpperCase().includes(s.toUpperCase())
          );
          if (!subject) return;
          if (!next[subject]) next[subject] = {};

          if (f.type === 'question') {
            const topics: string[] = f.topics || [];
            let ti = 0;
            f.days.forEach((day: string) => {
              const mappedDay = DAY_MAP[day] || day;
              const topic = topics.length ? topics[ti % topics.length] : '';
              next[subject][mappedDay] = { q: String(f.questionCount || ''), t: topic };
              if (topics.length) ti++;
            });
          }
        });
        return next;
      });
      setAiMessage({ text: 'Yapay zeka analizi başarıyla tamamlandı ve tabloya aktarıldı.', type: 'success' });
      setSmartFillText('');
    } catch (err: any) {
      setAiMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSmartFilling(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsPdfScanning(true);
    setAiMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-exam', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'PDF okunamadı.');

      const subjects: any[] = JSON.parse(data.parsedData?.subjectDetails || '[]');
      if (!subjects.length) throw new Error('PDFden ders verisi çıkarılamadı.');

      // Basit bir dağıtım algoritması
      setScheduleData(prev => {
        const next = { ...prev };
        subjects.forEach((sub: any) => {
          const key = SUBJECTS.find(s => s.includes(sub.name?.toUpperCase().trim()));
          if (!key) return;
          if (!next[key]) next[key] = {};
          
          const weakTopics = sub.topics?.filter((t:any) => t.incorrect > 0 || t.blank > 0).map((t:any) => t.name) || [];
          if (weakTopics.length > 0) {
            let ti = 0;
            DAYS.forEach(day => {
               if (Math.random() > 0.4) { // rastgele günlere dağıt
                 next[key][day] = { q: '30', t: weakTopics[ti % weakTopics.length] };
                 ti++;
               }
            });
          }
        });
        return next;
      });
      
      setAiMessage({ text: 'Karne başarıyla analiz edildi, zayıf konular programlandı.', type: 'success' });
    } catch (err: any) {
      setAiMessage({ text: err.message, type: 'error' });
    } finally {
      setIsPdfScanning(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!selectedStudentId) {
      alert('Lütfen önce bir öğrenci seçin!');
      return;
    }
    
    const isConfirm = window.confirm('Bu programı kaydetmek istiyor musunuz? Önceki aktif programlar arşivlenecek.');
    if (!isConfirm) return;

    try {
      // scheduleData -> tasks array
      const tasks: any[] = [];
      SUBJECTS.forEach(sub => {
        DAYS.forEach(day => {
          const cell = scheduleData[sub]?.[day];
          if (cell && cell.q) {
            tasks.push({
              subject: sub,
              topic: cell.t || '',
              questionCount: parseInt(cell.q) || 0,
              day: day
            });
          }
        });
      });

      if (tasks.length === 0) {
        alert('Kaydedilecek hiçbir görev bulunamadı! Tabloyu doldurun.');
        return;
      }

      await createSchedule(selectedStudentId, tasks);
      alert('✅ Program başarıyla kaydedildi!');
      
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  const clearAll = () => {
    if (window.confirm('Tüm tabloyu temizlemek istediğinize emin misiniz?')) {
      setScheduleData({});
      setAiMessage(null);
    }
  };

  // Header and layout aesthetics
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Hidden Print View */}
      <div style={{ display: 'none' }}><PrintView ref={printRef} scheduleData={scheduleData} studentName={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''} notes={studentNote} /></div>

      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
            <Calendar size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Program Mimarı
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, marginTop: '0.2rem' }}>Öğrencilerinize yapay zeka gücüyle kusursuz haftalık programlar oluşturun.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            <Trash2 size={18} /> Temizle
          </button>
          <button onClick={() => handlePrint()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            <Printer size={18} /> Yazdır (A4)
          </button>
          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s' }}>
            <Save size={18} /> Sisteme Kaydet
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        
        {/* LEFT COLUMN: Controls & AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Student Selector */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#94a3b8' }}>
              <User size={18} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Öğrenci Seçimi</h3>
            </div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">Öğrenci Seçin...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.grade}</option>
              ))}
            </select>
            {selectedStudent && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Sınıf: <strong>{selectedStudent.grade}</strong></span>
                  <span>Hedef: <strong>{selectedStudent.target || 'Belirsiz'}</strong></span>
                </div>
                <div>Son Sınav: <strong>{selectedStudent.exams?.[0]?.totalNet || 'Yok'} Net</strong></div>
              </div>
            )}
          </div>

          {/* AI Tools */}
          <div style={{ background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '100px', height: '100px', background: '#6366f1', filter: 'blur(60px)', opacity: 0.3 }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#818cf8' }}>
              <Bot size={20} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Asistan</h3>
            </div>

            {/* Smart Fill */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>DOĞAL DİL İLE PROGRAM OLUŞTUR</label>
              <textarea
                value={smartFillText}
                onChange={e => setSmartFillText(e.target.value)}
                placeholder="Örn: Pazartesi matematikten çarpanlar katlar 50 soru çözsün, salı fenden 40 soru eklensin..."
                rows={4}
                style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem', outline: 'none', resize: 'none', marginBottom: '0.5rem', fontFamily: 'inherit' }}
              />
              <button 
                onClick={handleSmartFill} 
                disabled={isSmartFilling || !smartFillText.trim()}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 600, cursor: smartFillText.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
              >
                {isSmartFilling ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isSmartFilling ? 'Analiz Ediliyor...' : 'Yapay Zeka ile Doldur'}
              </button>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1.5rem 0' }} />

            {/* PDF Scan */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>KARNEDEN ZAYIF KONU PROGRAMLA</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handlePdfUpload}
                  disabled={isPdfScanning}
                  style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.1)', color: '#cbd5e1', fontWeight: 500, transition: 'all 0.2s' }}>
                  {isPdfScanning ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                  {isPdfScanning ? 'PDF Okunuyor...' : 'PDF veya Görüntü Yükle'}
                </div>
              </div>
            </div>

            {/* Messages */}
            {aiMessage && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: aiMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: aiMessage.type === 'error' ? '#ef4444' : '#34d399', border: `1px solid ${aiMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                {aiMessage.type === 'error' ? '❌' : '✨'} {aiMessage.text}
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#94a3b8' }}>
              <FileText size={18} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Koçun Notu</h3>
            </div>
            <textarea
                value={studentNote}
                onChange={e => setStudentNote(e.target.value)}
                rows={5}
                style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
          
          {/* Days Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(7, 1fr)', gap: '0.5rem', position: 'sticky', top: 0, zIndex: 10, background: '#0f172a', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>DERSLER</div>
            {DAYS.map(day => (
              <div key={day} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                {day.substring(0,3)}
              </div>
            ))}
          </div>

          {/* Subjects Rows */}
          {SUBJECTS.map(sub => {
            const color = SUBJECT_COLORS[sub];
            const hasData = DAYS.some(d => scheduleData[sub]?.[d]?.q || scheduleData[sub]?.[d]?.t);
            
            return (
              <div key={sub} style={{ display: 'grid', gridTemplateColumns: '140px repeat(7, 1fr)', gap: '0.5rem' }}>
                
                {/* Subject Label */}
                <div style={{ background: hasData ? `${color}15` : 'rgba(30, 41, 59, 0.4)', border: `1px solid ${hasData ? color + '40' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                  <div style={{ width: '4px', height: '100%', background: color, borderRadius: '4px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: hasData ? color : '#94a3b8', lineHeight: 1.2 }}>{sub}</span>
                </div>

                {/* Days Cells */}
                {DAYS.map(day => {
                  const cell = scheduleData[sub]?.[day] || { q: '', t: '' };
                  const isFilled = !!cell.q || !!cell.t;
                  
                  return (
                    <div key={day} style={{ background: isFilled ? `${color}10` : 'rgba(30, 41, 59, 0.3)', border: `1px solid ${isFilled ? color + '40' : 'rgba(255,255,255,0.03)'}`, borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'all 0.2s', position: 'relative' }}>
                      <input
                        type="number"
                        placeholder="0"
                        value={cell.q}
                        onChange={e => handleCellChange(sub, day, 'q', e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${isFilled ? color + '50' : 'rgba(255,255,255,0.1)'}`, color: 'white', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', outline: 'none', padding: '0.2rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Konu"
                        value={cell.t}
                        onChange={e => handleCellChange(sub, day, 't', e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center', outline: 'none', padding: '0 0.2rem' }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}
