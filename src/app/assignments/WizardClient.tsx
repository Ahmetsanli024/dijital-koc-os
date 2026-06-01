'use client';
import React, { useState, useEffect } from 'react';
import { toggleTaskCompletion, createSchedule } from '../actions/schedule';

const DAYS = ['CUMA', 'CUMARTESİ', 'PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE'];
const SUBJECTS = ['TÜRKÇE', 'MATEMATİK', 'FEN BİLİMLERİ', 'T.C. İNKILAP TARİHİ', 'İNGİLİZCE', 'DİN KÜLTÜRÜ'];

const TOPICS_MAP: Record<string, string[]> = {
  'TÜRKÇE': ['SÖZCÜKTE ANLAM', 'CÜMLEDE ANLAM', 'PARAGRAFTA ANLAM', 'FİİLİMSİLER', 'YAZIM KURALLARI', 'NOKTALAMA İŞARETLERİ', 'CÜMLENİN ÖGELERİ', 'CÜMLE TÜRLERİ', 'FİİLDE ÇATI', 'ANLATIM BOZUKLUKLARI', 'METİN TÜRLERİ VE SÖZ SANATLARI', 'SÖZEL MANTIK', 'BRANŞ DENEME'],
  'MATEMATİK': ['ÇARPANLAR VE KATLAR', 'ÜSLÜ İFADELER', 'KAREKÖKLÜ İFADELER', 'VERİ ANALİZİ', 'BASİT OLAYLARIN OLMA OLASILIĞI', 'CEBİRSEL İFADELER VE ÖZDEŞLİKLER', 'DOĞRUSAL DENKLEMLER', 'EŞİTSİZLİKLER', 'ÜÇGENLER', 'EŞLİK VE BENZERLİK', 'DÖNÜŞÜM GEOMETRİSİ', 'GEOMETRİK CİSİMLER'],
  'FEN BİLİMLERİ': ['MEVSİMLER VE İKLİM', 'DNA VE GENETİK KOD', 'BASINÇ', 'MADDE VE ENDÜSTRİ', 'BASİT MAKİNELER', 'ENERJİ DÖNÜŞÜMLERİ VE ÇEVRE BİLİMİ', 'ELEKTRİK YÜKLERİ VE ELEKTRİK ENERJİSİ'],
  'T.C. İNKILAP TARİHİ': ['BİR KAHRAMAN DOĞUYOR', 'MİLLİ UYANIŞ', 'MİLLİ BİR DESTAN', 'ATATÜRKÇÜLÜK', 'DEMOKRATİKLEŞME ÇABALARI', 'DIŞ POLİTİKA', 'ATATÜRK\'ÜN ÖLÜMÜ'],
  'İNGİLİZCE': ['FRIENDSHIP', 'TEEN LIFE', 'IN THE KITCHEN', 'ON THE PHONE', 'THE INTERNET', 'ADVENTURES', 'TOURISM', 'CHORES', 'SCIENCE', 'NATURAL FORCES'],
  'DİN KÜLTÜRÜ': ['KADER İNANCI', 'ZEKAT VE SADAKA', 'DİN VE HAYAT', 'HZ. MUHAMMED\'İN ÖRNEKLİĞİ', 'KUR\'AN-I KERİM VE ÖZELLİKLERİ'],
  'PARAGRAF': ['GÜNLÜK RUTİN', 'KARIŞIK DENEME', 'ZAMANLI TEST']
};

const getMockPercentage = (topic: string) => {
  const hash = topic.length * 7 % 100;
  return hash < 30 ? hash + 15 : hash;
};

const findMatchingSubject = (aiName: string): string | undefined => {
  if (!aiName) return undefined;
  const upper = aiName.toUpperCase().trim();
  
  if (upper.includes('TÜRKÇE') || upper.includes('TURKCE') || upper.includes('TRK') || upper.includes('TUR')) return 'TÜRKÇE';
  if (upper.includes('MATEMATİK') || upper.includes('MATEMATIK') || upper.includes('MAT')) return 'MATEMATİK';
  if (upper.includes('FEN') || upper.includes('FİZ') || upper.includes('KİM') || upper.includes('BİY')) return 'FEN BİLİMLERİ';
  if (upper.includes('İNKILAP') || upper.includes('INKILAP') || upper.includes('TARİH') || upper.includes('TARIH') || upper.includes('T.C.')) return 'T.C. İNKILAP TARİHİ';
  if (upper.includes('İNGİLİZCE') || upper.includes('INGILIZCE') || upper.includes('İNG') || upper.includes('ING') || upper.includes('ENGLISH')) return 'İNGİLİZCE';
  if (upper.includes('DİN') || upper.includes('DIN') || upper.includes('AHLAK') || upper.includes('KÜLTÜR') || upper.includes('KULTUR')) return 'DİN KÜLTÜRÜ';
  if (upper.includes('PARAGRAF')) return 'PARAGRAF';
  
  return undefined;
};

type SubjectSmartState = {
  days: string[];
  topics: string[];
  q: string;
  aiParsedTopics?: {name: string, percentage: number, isWeak: boolean}[];
};

const SmartSubjectCard = ({ subject, topics, state, onUpdate }: { 
  subject: string, 
  topics: string[], 
  state: SubjectSmartState,
  onUpdate: (s: SubjectSmartState) => void 
}) => {
  const isActive = state.topics.length > 0;

  const toggleDay = (day: string) => {
    const nextDays = state.days.includes(day) ? state.days.filter(d => d !== day) : [...state.days, day];
    onUpdate({ ...state, days: nextDays });
  };

  const toggleTopic = (topic: string) => {
    const nextTopics = state.topics.includes(topic) ? state.topics.filter(t => t !== topic) : [...state.topics, topic];
    onUpdate({ ...state, topics: nextTopics });
  };

  // Eğer yapay zekadan gerçek konular geldiyse onları kullan, eksik olan standart konuları da sonuna ekle
  const aiTopics = state.aiParsedTopics && state.aiParsedTopics.length > 0 
    ? [...state.aiParsedTopics].sort((a,b) => a.percentage - b.percentage) 
    : [];

  const otherTopics = topics
    .filter(t => !aiTopics.some(aiT => aiT.name.toUpperCase().includes(t.toUpperCase()) || t.toUpperCase().includes(aiT.name.toUpperCase())))
    .map(t => ({ name: t, percentage: null, isWeak: false }));

  const displayTopics = aiTopics.length > 0 
    ? [...aiTopics, ...otherTopics] 
    : topics.map(t => ({ name: t, percentage: null, isWeak: false }));

  const handleLowTopics = () => {
    // Yapay zeka geldiyse isWeak olanları seç, yoksa baştan 3 tane seç
    const low = state.aiParsedTopics && state.aiParsedTopics.length > 0
      ? state.aiParsedTopics.filter(t => t.isWeak || t.percentage < 50).map(t => t.name)
      : displayTopics.slice(0, 3).map(t => t.name);
    onUpdate({ ...state, topics: low });
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        
        {/* Subject Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '200px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isActive ? 'var(--primary)' : 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {isActive && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>✓</span>}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{subject}</h3>
        </div>

        {/* Daily Goal Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>HEDEF</span>
          <input 
            type="text" 
            value={state.q}
            onChange={(e) => onUpdate({ ...state, q: e.target.value })}
            placeholder="50 Soru, Syf 20-30..."
            style={{ width: '120px', padding: '0.3rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', outline: 'none' }} 
          />
        </div>

        {/* Days Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', flex: 1 }}>
          {['PTESİ', 'SALI', 'ÇARŞ', 'PERŞ', 'CUMA', 'CMTESİ', 'PAZAR'].map(day => (
            <button 
              key={day}
              onClick={() => toggleDay(day)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: 'none', background: state.days.includes(day) ? 'var(--primary)' : 'var(--border)', color: state.days.includes(day) ? 'white' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              {day}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleLowTopics} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
          📉 Zayıf Konuları Seç
        </button>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
          {displayTopics.map(({name: topic, percentage, isWeak}) => ( // Tüm konular sığsın
            <button 
              key={topic}
              onClick={() => toggleTopic(topic)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: state.topics.includes(topic) ? '1px solid var(--primary)' : '1px solid var(--border)', background: state.topics.includes(topic) ? 'rgba(4, 120, 87, 0.05)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: state.topics.includes(topic) ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {topic} {percentage !== null && <span style={{ color: isWeak ? 'var(--danger)' : 'var(--success)' }}>({percentage}%)</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function WizardClient({ students }: { students: any[] }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('standart');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSmartDist, setShowSmartDist] = useState(true);
  const [selectedArchiveExams, setSelectedArchiveExams] = useState<string[]>([]);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  type ScheduleData = Record<string, Record<string, { q: string, t: string }>>;
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  
  const [smartState, setSmartState] = useState<Record<string, SubjectSmartState>>({});
  
  const [studentNote, setStudentNote] = useState<string>('Bu program senin genel durumun baz alınarak hazırlanmıştır. Görevlerini sorumluluk bilinciyle, ertelemeden tamamlaman başarının en büyük anahtarıdır. Sana inancım tam!');

  useEffect(() => {
    if (selectedStudent) {
      const initialState: Record<string, SubjectSmartState> = {};
      const ALL_DAYS = ['PTESİ', 'SALI', 'ÇARŞ', 'PERŞ', 'CUMA', 'CMTESİ', 'PAZAR'];
      
      SUBJECTS.forEach(sub => {
        initialState[sub] = { days: [...ALL_DAYS], topics: [], q: sub === 'PARAGRAF' ? '30' : '50' };
      });
      setSmartState(initialState);
    }
  }, [selectedStudent]);

  const [analysisSeconds, setAnalysisSeconds] = useState(0);

  // Arşivden Sınav Seçimi - AI Dağıtımını Tetikler
  const handleSyncTopicList = async () => {
    if (!selectedStudent || !selectedStudent.exams || selectedStudent.exams.length === 0) {
      alert('Öğrencinin kayıtlı sınavı bulunmuyor.');
      return;
    }

    // Aggregate topics from all SINGLE exams to avoid double counting
    const subjectMap: Record<string, Record<string, { correct: number, incorrect: number, blank: number }>> = {};
    const singleExams = selectedStudent.exams.filter((e:any) => e.examType === 'SINGLE' || !e.examType);
    const examsToUse = singleExams.length > 0 ? singleExams : selectedStudent.exams; // fallback to all if no singles

    examsToUse.forEach((exam: any) => {
      if (exam.subjectDetails && exam.subjectDetails !== '[]') {
        try {
          const details = JSON.parse(exam.subjectDetails);
          details.forEach((sub: any) => {
            if (!subjectMap[sub.name]) subjectMap[sub.name] = {};
            if (sub.topics) {
              sub.topics.forEach((t: any) => {
                if (!subjectMap[sub.name][t.name]) {
                  subjectMap[sub.name][t.name] = { correct: 0, incorrect: 0, blank: 0 };
                }
                subjectMap[sub.name][t.name].correct += (t.correct || 0);
                subjectMap[sub.name][t.name].incorrect += (t.incorrect || 0);
                subjectMap[sub.name][t.name].blank += (t.blank || 0);
              });
            }
          });
        } catch (e) {}
      }
    });

    const aggregatedData = Object.keys(subjectMap).map(subName => {
      return {
        subject: subName,
        topics: Object.entries(subjectMap[subName]).map(([name, stats]) => {
          const total = stats.correct + stats.incorrect + stats.blank;
          return {
            name,
            correct: stats.correct,
            incorrect: stats.incorrect,
            blank: stats.blank,
            successPercentage: total > 0 ? Math.round((stats.correct / total) * 100) : 0
          };
        })
      };
    });

    if (aggregatedData.length === 0) {
      alert('Sınavlardan konu verisi çıkarılamadı. Lütfen konu analizi içeren bir sınav yükleyin.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisSeconds(0);
    const interval = setInterval(() => {
      setAnalysisSeconds(s => s + 1);
    }, 1000);

    try {
      const res = await fetch('/api/ai-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aggregatedData, 
          studentName: selectedStudent.firstName + ' ' + selectedStudent.lastName 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Yapay zeka analizinde hata oluştu.');
      }

      const { aiData } = data;
      const nextState = { ...smartState };
      
      // AI'dan gelen subject verilerini smartState'e uygula
      if (aiData && aiData.subjects) {
        aiData.subjects.forEach((subjectOutput: any) => {
          const rawSubName = subjectOutput.name || '';
          const sub = findMatchingSubject(rawSubName);
          if (sub && nextState[sub]) {
            const weeklyQ = parseInt(subjectOutput.questionCount) || 0;
            const activeDaysCount = nextState[sub].days.length || 7;
            const dailyQ = weeklyQ > 0 ? Math.round(weeklyQ / activeDaysCount).toString() : nextState[sub].q;
            nextState[sub].q = dailyQ;
            if (subjectOutput.topics && Array.isArray(subjectOutput.topics)) {
              nextState[sub].aiParsedTopics = subjectOutput.topics;
              // Eksik (isWeak) olanları otomatik seç
              const weakNames = subjectOutput.topics.filter((t:any) => t.isWeak).map((t:any) => t.name);
              if (weakNames.length > 0) {
                nextState[sub].topics = weakNames;
              } else if (subjectOutput.weakTopic && subjectOutput.weakTopic !== 'Genel Tekrar' && subjectOutput.weakTopic !== 'Günlük Rutin') {
                nextState[sub].topics = [subjectOutput.weakTopic];
              }
            } else if (subjectOutput.weakTopic && subjectOutput.weakTopic !== 'Genel Tekrar' && subjectOutput.weakTopic !== 'Günlük Rutin') {
              // Geriye dönük uyumluluk
              nextState[sub].topics = [subjectOutput.weakTopic];
            }
          }
        });
      }
      
      setSmartState(nextState);
      
      // AI sonuçlarını anında tabloya aktar
      setScheduleData(prev => {
        const next = { ...prev };
        SUBJECTS.forEach(subject => {
          const state = nextState[subject];
          if (state && state.topics.length > 0 && state.days.length > 0) {
            next[subject] = { ...(next[subject] || {}) };
            let topicIndex = 0;
            state.days.forEach(day => {
              const mappedDay = day === 'PTESİ' ? 'PAZARTESİ' : 
                                day === 'SALI' ? 'SALI' : 
                                day === 'ÇARŞ' ? 'ÇARŞAMBA' : 
                                day === 'PERŞ' ? 'PERŞEMBE' : 
                                day === 'CUMA' ? 'CUMA' : 
                                day === 'CMTESİ' ? 'CUMARTESİ' : 'PAZAR';
                                
              const topic = state.topics[topicIndex % state.topics.length];
              next[subject][mappedDay] = { q: state.q, t: topic };
              topicIndex++;
            });
          }
        });
        return next;
      });
      
      // AI'dan dönen değerlendirmeyi doğrudan öğrenci notuna ekle
      if (aiData?.evaluationSummary) {
        setStudentNote(aiData.evaluationSummary + '\n\nBu eksikleri kapatmak için bu haftaki görevlerini ertelemeden tamamlaman başarının anahtarıdır. Sana inancım tam!');
      }
      
      alert(`AI Analizi Tamamlandı!\n\nRehber Öğretmen Değerlendirmesi programa eklendi.`);
      
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleBulkAdd = () => {
    setScheduleData(prev => {
      const next = { ...prev };
      
      SUBJECTS.forEach(subject => {
        const state = smartState[subject];
        if (state && state.topics.length > 0 && state.days.length > 0) {
          next[subject] = { ...(next[subject] || {}) };
          let topicIndex = 0;
          state.days.forEach(day => {
            const mappedDay = day === 'PTESİ' ? 'PAZARTESİ' : 
                              day === 'SALI' ? 'SALI' : 
                              day === 'ÇARŞ' ? 'ÇARŞAMBA' : 
                              day === 'PERŞ' ? 'PERŞEMBE' : 
                              day === 'CUMA' ? 'CUMA' : 
                              day === 'CMTESİ' ? 'CUMARTESİ' : 'PAZAR';
                              
            const topic = state.topics[topicIndex % state.topics.length];
            next[subject][mappedDay] = { q: state.q, t: topic };
            topicIndex++;
          });
        }
      });
      return next;
    });
    alert('Seçili olan konular haftalık programa aktarıldı!');
  };

  const handleSaveToArchive = async () => {
    if (!selectedStudent) {
      alert('Lütfen önce bir öğrenci seçin.');
      return;
    }

    const tasksData: any[] = [];
    Object.entries(scheduleData).forEach(([subject, daysObj]) => {
      Object.entries(daysObj).forEach(([day, taskInfo]) => {
        if (taskInfo.t || taskInfo.q) {
          const targetValue = (taskInfo.q || '').trim();
          const isPureNumeric = /^\d+$/.test(targetValue);
          tasksData.push({
            subject,
            day,
            topic: taskInfo.t || 'Genel Tekrar',
            questionCount: isPureNumeric ? parseInt(targetValue) : 0,
            pagesRange: !isPureNumeric && targetValue.length > 0 ? targetValue : null
          });
        }
      });
    });

    if (tasksData.length === 0) {
      alert('Program boş olamaz. Lütfen en az bir göreve soru sayısı veya konu başlığı girin.');
      return;
    }

    try {
      const result = await createSchedule(selectedStudent.id, tasksData);
      
      if (result.success) {
        alert('Çalışma programı başarıyla arşive kaydedildi!');
        window.location.href = `/students/${selectedStudent.id}?tab=programlar`;
      } else {
        alert('Kaydedilirken hata oluştu: ' + result.error);
      }
    } catch (e) {
      alert('Sistem hatası oluştu.');
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <style>{`
        .print-only {
          display: none !important;
        }
        .print-only-block {
          display: none !important;
        }
        @media print {
          .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; }
          .time-header { writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; font-weight: 800; background: var(--bg-main); }

          /* Clean background and hide default headers/aside of RootLayout */
          html, body {
            background: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Hide app sidebar, top-header and general wizard buttons/tabs */
          aside,
          header.top-header,
          header,
          .no-print,
          .no-print * {
            display: none !important;
          }

          .print-only {
            display: inline-block !important;
          }
          .print-only-block {
            display: block !important;
          }

          /* Force container to occupy full A4 width cleanly without scale distortion */
          .print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            z-index: 99999 !important;
            overflow: visible !important;
            transform: none !important;
          }
          
          .print-area > div {
            transform: none !important;
            width: 100% !important;
            margin: 0 !important;
          }

          @page {
            size: A4 landscape;
            margin: 8mm 10mm;
          }
          
          /* Strict table styling for print */
          .print-area table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 2px solid #000 !important;
            margin-top: 0.4rem !important;
            margin-bottom: 0.5rem !important;
            table-layout: fixed !important;
            page-break-inside: avoid;
          }
          
          .print-area table tr {
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          
          .print-area table th, 
          .print-area table td {
            border: 1px solid #000 !important;
            padding: 4px 3px !important;
            font-size: 0.7rem !important;
            line-height: 1.1 !important;
            color: #000 !important;
            background: none !important;
            word-wrap: break-word !important;
          }

          .print-area table th {
            font-weight: 800 !important;
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-area table td div {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Bottom layout details (note & eval) under the table, signatures below details */
          .print-area .details-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.25rem !important;
            margin-top: 0.6rem !important;
            width: 100% !important;
          }

          .print-area .details-container > div {
            border: 1px solid #000 !important;
            padding: 0.6rem !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
            background: white !important;
          }

          .print-area .details-container h4 {
            font-size: 0.75rem !important;
            font-weight: 800 !important;
            margin: 0 0 0.3rem 0 !important;
            color: #000 !important;
            border-bottom: 1px solid #000 !important;
            padding-bottom: 0.2rem !important;
          }

          .print-area .details-container p,
          .print-area .details-container div {
            font-size: 0.7rem !important;
            line-height: 1.3 !important;
            color: #000 !important;
          }

          .print-area .signatures-container {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 1rem !important;
            width: 100% !important;
            padding: 0 1rem !important;
            box-sizing: border-box !important;
          }

          .print-area .signatures-container > div {
            text-align: center !important;
            min-width: 150px !important;
          }

          .print-area .signatures-container p {
            margin: 0 !important;
            font-size: 0.75rem !important;
            color: #000 !important;
          }
          
          .print-area .signatures-container p:first-child {
            font-weight: 800 !important;
            border-bottom: 1px dotted #555 !important;
            padding-bottom: 1.5rem !important;
            margin-bottom: 0.25rem !important;
          }
        }
        
        .smart-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .smart-scroll::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <header className="no-print" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          Ödev Kontrol & Haftalık Program
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Öğrenci analiz belgesi üzerinden YZ destekli akıllı program hazırlama.</p>
      </header>

      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        {['Öğrenci Seçimi', 'Ödev Kontrolü', 'Program Tasarımı'].map((label, idx) => {
          const s = idx + 1;
          const active = step >= s;
          return (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ height: '6px', background: active ? 'var(--primary)' : 'var(--border)', borderRadius: '3px', transition: 'all 0.3s' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: active ? 800 : 600, color: active ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{s}. {label}</span>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <section className="card" style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.3s' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Hangi öğrenci için plan hazırlayacağız?</h2>
          <select 
            onChange={(e) => {
              const std = students.find(s => s.id === e.target.value);
              setSelectedStudent(std);
            }}
            style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border)', fontSize: '1rem', marginBottom: '1.5rem', background: 'var(--bg-main)' }}>
            <option value="">Envanterden Öğrenci Seçin...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
            ))}
          </select>
          <button 
            className="btn-primary" 
            onClick={nextStep} 
            disabled={!selectedStudent}
            style={{ width: '100%', padding: '1rem', opacity: selectedStudent ? 1 : 0.5 }}>
            Ödev Kontrolüne Geç ➡️
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="card" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Geçmiş Ödev Kontrolü</h2>
            <button className="btn-secondary" onClick={prevStep}>Geri Dön</button>
          </div>
          
          {selectedStudent?.schedules && selectedStudent.schedules.length > 0 ? (
            <div>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Öğrencinin önceki haftaya ait ödevleri aşağıda listelenmiştir. Yapılan görevleri işaretleyin.</p>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {selectedStudent.schedules[0].tasks.map((task: any) => (
                   <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{task.subject}</span>
                       <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{task.topic} • {task.day} • {task.questionCount} Soru</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 600, color: task.isCompleted ? 'var(--success)' : 'var(--text-muted)' }}>
                         {task.isCompleted ? 'Yapıldı' : 'Bekliyor'}
                       </span>
                       <input 
                         type="checkbox" 
                         checked={task.isCompleted}
                         onChange={async (e) => {
                           task.isCompleted = e.target.checked;
                           // Trigger re-render by cloning state
                           setSelectedStudent({...selectedStudent});
                           await toggleTaskCompletion(task.id, e.target.checked);
                         }}
                         style={{ width: '20px', height: '20px', accentColor: 'var(--success)', cursor: 'pointer' }}
                       />
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          ) : (
             <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Bu öğrenciye ait geçmiş bir çalışma programı bulunmuyor.
             </div>
          )}
          
          <button 
            className="btn-primary" 
            onClick={nextStep} 
            style={{ width: '100%', padding: '1rem', marginTop: '1.5rem' }}>
            Yeni Program Tasarımına Geç ➡️
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="print-area" style={{ animation: 'fadeIn 0.3s', padding: 0, overflow: 'visible' }}>
          <div className="no-print" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>HAFTALIK DERS ÇALIŞMA PLANI</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedStudent?.firstName} {selectedStudent?.lastName} - {selectedStudent?.grade}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select 
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="btn-secondary"
                style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', outline: 'none', background: 'white', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
              >
                <option value="standart">Standart Şablon</option>
                <option value="detayli">Detaylı Takip Şablonu</option>
                <option value="birlestirilmis">Birleştirilmiş Konu Şablonu</option>
                <option value="zaman_dilimli">Zaman Dilimli Şablon</option>
              </select>
              <button className="btn-secondary" onClick={() => setShowSmartDist(!showSmartDist)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                {showSmartDist ? 'Akıllı Dağıtımı Gizle' : '🧠 Akıllı Dağıtımı Aç'}
              </button>
              <button className="btn-secondary" onClick={() => { prevStep(); }}>← Geri</button>
            </div>
          </div>

          {showSmartDist && (
            <div className="no-print" style={{ padding: '1.5rem 2rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', animation: 'fadeIn 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🧠 Akıllı Dağıtım
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Analiz belgesi yükleyin, YZ eksikleri belirlesin ve LGS ağırlıklarına göre soru sayılarını atasın.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={handleSyncTopicList}
                    disabled={isAnalyzing || !selectedStudent?.exams?.length}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'rgba(16, 185, 129, 0.05)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!selectedStudent?.exams?.length || isAnalyzing) ? 0.5 : 1 }}>
                    {isAnalyzing ? '🔄 Senkronize Ediliyor...' : '🔄 Konu Takip Listesiyle Senkronize Et'}
                  </button>
                                    <button className="btn-primary" onClick={handleBulkAdd} style={{ padding: '0.75rem 1.5rem' }}>
                    Planı Programa Aktar ⬇️
                  </button>
                </div>
              </div>
              
              {/* Compact Scrollable Area */}
              <div className="smart-scroll" style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {SUBJECTS.map(subject => (
                  smartState[subject] ? 
                  <SmartSubjectCard 
                    key={subject} 
                    subject={subject} 
                    topics={TOPICS_MAP[subject]} 
                    state={smartState[subject]} 
                    onUpdate={(newState) => setSmartState(prev => ({...prev, [subject]: newState}))} 
                  /> : null
                ))}
              </div>
            </div>
          )}

          
          {/* Sadece yazıcıda çıkacak başlık */}
          <div className="print-only-block" style={{ display: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
              <div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000', margin: 0 }}>HAFTALIK DERS ÇALIŞMA PROGRAMI</h1>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>
                  Öğrenci: {selectedStudent?.firstName} {selectedStudent?.lastName} | Sınıf: {selectedStudent?.grade}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto', padding: '1.5rem', background: 'white' }}>
            
            {selectedTemplate === 'standart' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', border: '1px solid var(--text-primary)', textAlign: 'left', width: '140px', background: 'var(--bg-main)' }}>DERS / GÖREV</th>
                  {DAYS.map(day => (
                    <th key={day} style={{ padding: '1rem', border: '1px solid var(--text-primary)', textAlign: 'center', width: '140px', background: 'var(--bg-main)' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBJECTS.map((subject) => (
                  <tr key={subject}>
                    <td style={{ padding: '1rem', border: '1px solid var(--text-primary)', fontWeight: 800, background: 'var(--bg-main)' }}>{subject}</td>
                    {DAYS.map((day) => {
                      const cellData = scheduleData[subject]?.[day] || { q: '', t: '' };

                      return (
                         <td key={`${subject}-${day}`} style={{ border: '1px solid var(--text-primary)', verticalAlign: 'top', padding: 0, position: 'relative' }}>
                          <div style={{ padding: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <input 
                                  className="no-print"
                                  type="text" 
                                  value={cellData.q} 
                                  onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...cellData, q: e.target.value}}}))} 
                                  style={{ fontWeight: 800, fontSize: '0.95rem', width: '55px', border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', padding: '0', flexShrink: 0 }} 
                                />
                                <div 
                                  className="print-only"
                                  style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginRight: '0.2rem' }}
                                >
                                  {cellData.q}
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', opacity: cellData.q ? 1 : 0.4 }}>SORU</span>
                              </div>
                              <input type="checkbox" style={{ width: '14px', height: '14px', accentColor: 'var(--text-primary)', border: '1px solid var(--text-primary)' }} />
                            </div>
                            <textarea 
                              className="no-print"
                              rows={2} 
                              placeholder="" 
                              value={cellData.t} 
                              onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...cellData, t: e.target.value}}}))}
                              style={{ fontSize: '0.8rem', color: 'var(--text-primary)', border: 'none', outline: 'none', width: '100%', resize: 'none', background: 'transparent', padding: 0, fontFamily: 'var(--font-geist-sans)', fontWeight: cellData.t ? 700 : 400 }} 
                            />
                            <div 
                              className="print-only"
                              style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', fontWeight: cellData.t ? 700 : 400, whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '30px' }}
                            >
                              {cellData.t || ' '}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>KONU</span>
                              <span className="no-print" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>✎</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ background: 'var(--bg-main)' }}>
                  <td style={{ padding: '1rem', border: '1px solid var(--text-primary)', fontWeight: 800 }}>GÜNLÜK TOPLAM</td>
                  {DAYS.map((day) => {
                    let total = 0;
                    SUBJECTS.forEach(sub => {
                      const q = parseInt(scheduleData[sub]?.[day]?.q) || 0;
                      total += q;
                    });
                    
                    return (
                      <td key={`total-${day}`} style={{ padding: '1rem', border: '1px solid var(--text-primary)', textAlign: 'center' }}>
                        <input 
                          className="no-print"
                          type="text" 
                          readOnly 
                          value={total > 0 ? total : ''} 
                          placeholder="0" 
                          style={{ fontWeight: 800, fontSize: '1.2rem', border: 'none', outline: 'none', background: 'transparent', width: '100%', textAlign: 'center', color: total > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }} 
                        />
                        <div 
                          className="print-only"
                          style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', textAlign: 'center', width: '100%' }}
                        >
                          {total > 0 ? total : '0'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SORU</div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
            )}

            {selectedTemplate === 'detayli' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.8rem', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>Dersler</th>
                    {['1. GÜN', '2. GÜN', '3. GÜN', '4. GÜN', '5. GÜN', '6. GÜN', '7. GÜN'].map(day => (
                      <th key={day} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>{day}</th>
                    ))}
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map((subject) => {
                    let totalQ = 0;
                    DAYS.forEach(day => { totalQ += parseInt(scheduleData[subject]?.[day]?.q) || 0; });
                    return (
                      <React.Fragment key={subject}>
                        <tr>
                          <td rowSpan={4} style={{ border: '1px solid var(--text-primary)', fontWeight: 800, width: '40px' }}>
                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto' }}>{subject}</div>
                          </td>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left', width: '150px' }}>Konu ve Kaynak Adı</td>
                          {DAYS.map(day => (
                            <td key={'konu-'+day} style={{ border: '1px solid var(--text-primary)', padding: 0 }}>
                              <textarea 
                                className="no-print"
                                value={scheduleData[subject]?.[day]?.t || ''} 
                                onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{q:''}), t: e.target.value}}}))} 
                                style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', resize: 'none', background: 'transparent', fontSize: '0.75rem', textAlign: 'center', outline: 'none' }} 
                              />
                              <div 
                                className="print-only"
                                style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '20px', textAlign: 'center', width: '100%' }}
                              >
                                {scheduleData[subject]?.[day]?.t || ' '}
                              </div>
                            </td>
                          ))}
                          <td rowSpan={4} style={{ border: '1px solid var(--text-primary)', fontWeight: 800, fontSize: '1.2rem', verticalAlign: 'middle' }}>{totalQ > 0 ? totalQ : ''}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left' }}>Günlük Soru Hedefi</td>
                          {DAYS.map(day => (
                            <td key={'hedef-'+day} style={{ border: '1px solid var(--text-primary)', padding: 0, background: 'rgba(0,0,0,0.02)' }}>
                              <input 
                                className="no-print"
                                type="text" 
                                value={scheduleData[subject]?.[day]?.q || ''} 
                                onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{t:''}), q: e.target.value}}}))} 
                                style={{ width: '100%', border: 'none', textAlign: 'center', background: 'transparent', fontWeight: 800, outline: 'none' }} 
                              />
                              <div 
                                className="print-only"
                                style={{ fontWeight: 800, textAlign: 'center', width: '100%' }}
                              >
                                {scheduleData[subject]?.[day]?.q || ' '}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left' }}>Çözülen Soru Sayısı</td>
                          {DAYS.map(day => <td key={'cozulen-'+day} style={{ border: '1px solid var(--text-primary)' }}></td>)}
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left' }}>Çalışılan Süre</td>
                          {DAYS.map(day => <td key={'sure-'+day} style={{ border: '1px solid var(--text-primary)' }}></td>)}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}

            {selectedTemplate === 'birlestirilmis' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.8rem', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)', width: '120px' }}>Dersler</th>
                    {['1. GÜN', '2. GÜN', '3. GÜN', '4. GÜN', '5. GÜN', '6. GÜN', '7. GÜN'].map(day => (
                      <th key={day} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>{day}</th>
                    ))}
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)', width: '80px' }}>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map((subject) => {
                    let totalQ = 0;
                    const allTopics = new Set<string>();
                    DAYS.forEach(day => {
                      totalQ += parseInt(scheduleData[subject]?.[day]?.q) || 0;
                      if (scheduleData[subject]?.[day]?.t) {
                        allTopics.add(scheduleData[subject][day].t);
                      }
                    });
                    const mergedTopics = Array.from(allTopics).join(' + ');

                    return (
                      <React.Fragment key={subject}>
                        <tr>
                          <td rowSpan={2} style={{ border: '1px solid var(--text-primary)', fontWeight: 800 }}>
                             <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto', padding: '1rem 0' }}>{subject}</div>
                          </td>
                          {DAYS.map(day => (
                            <td key={'q-'+day} style={{ border: '1px solid var(--text-primary)', padding: 0, background: 'rgba(0,0,0,0.05)' }}>
                               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', gap: '0.2rem' }}>
                                 <input 
                                   className="no-print"
                                   type="text" 
                                   value={scheduleData[subject]?.[day]?.q || ''} 
                                   onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{t:''}), q: e.target.value}}}))} 
                                   style={{ width: '55px', border: 'none', textAlign: 'center', background: 'transparent', fontWeight: 800, outline: 'none', padding: '0', flexShrink: 0 }} 
                                 />
                                 <div 
                                   className="print-only"
                                   style={{ fontWeight: 800, textAlign: 'center', marginRight: '0.2rem' }}
                                 >
                                   {scheduleData[subject]?.[day]?.q}
                                 </div>
                                 <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>SORU</span>
                               </div>
                            </td>
                          ))}
                          <td rowSpan={2} style={{ border: '1px solid var(--text-primary)', fontWeight: 800, fontSize: '1.2rem', verticalAlign: 'middle' }}>{totalQ > 0 ? totalQ : ''}</td>
                        </tr>
                        <tr>
                          <td colSpan={7} style={{ border: '1px solid var(--text-primary)', padding: '1rem', fontWeight: 700 }}>
                            <textarea 
                              className="no-print"
                              value={mergedTopics} 
                              readOnly 
                              placeholder="Bu dersten planlanmış konu yok" 
                              style={{ width: '100%', textAlign: 'center', border: 'none', resize: 'none', background: 'transparent', fontWeight: 800, outline: 'none', fontFamily: 'inherit' }} 
                            />
                            <div 
                              className="print-only"
                              style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'center', width: '100%' }}
                            >
                              {mergedTopics || 'Bu dersten planlanmış konu yok'}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}

            {selectedTemplate === 'zaman_dilimli' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.8rem', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>DERS/İÇERİK</th>
                    {['1. GÜN', '2. GÜN', '3. GÜN', '4. GÜN', '5. GÜN', '6. GÜN', '7. GÜN'].map(day => (
                      <th key={day} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>{day}</th>
                    ))}
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {['Sabah', 'Öğle Arası', 'Etüt', 'Akşam'].map(period => (
                     <React.Fragment key={period}>
                       {SUBJECTS.map((subject, idx) => {
                          let rowContent = (day: string) => {
                            if (period === 'Etüt') return (
                              <>
                                <textarea 
                                  className="no-print"
                                  value={scheduleData[subject]?.[day]?.t || ''} 
                                  onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{q:''}), t: e.target.value}}}))} 
                                  style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', resize: 'none', background: 'transparent', fontSize: '0.7rem', textAlign: 'center', outline: 'none' }} 
                                />
                                <div 
                                  className="print-only"
                                  style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '20px', textAlign: 'center', width: '100%' }}
                                >
                                  {scheduleData[subject]?.[day]?.t || ' '}
                                </div>
                              </>
                            );
                            if (period === 'Akşam') return (
                              <>
                                <input 
                                  className="no-print"
                                  type="text" 
                                  value={scheduleData[subject]?.[day]?.q ? scheduleData[subject]?.[day]?.q + ' SORU' : ''} 
                                  onChange={e => { const val = e.target.value.replace(' SORU',''); setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{t:''}), q: val}}}))}} 
                                  style={{ width: '100%', border: 'none', textAlign: 'center', background: 'transparent', fontSize: '0.7rem', fontWeight: 600, outline: 'none' }} 
                                />
                                <div 
                                  className="print-only"
                                  style={{ fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', width: '100%' }}
                                >
                                  {scheduleData[subject]?.[day]?.q ? scheduleData[subject]?.[day]?.q + ' SORU' : ' '}
                                </div>
                              </>
                            );
                            return (
                              <>
                                <textarea 
                                  className="no-print"
                                  style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', resize: 'none', background: 'transparent', fontSize: '0.7rem', textAlign: 'center', outline: 'none' }} 
                                />
                                <div 
                                  className="print-only"
                                  style={{ minHeight: '20px', width: '100%' }}
                                >
                                  &nbsp;
                                </div>
                              </>
                            );
                          };

                         return (
                           <tr key={subject + period}>
                             {idx === 0 && (
                               <td rowSpan={SUBJECTS.length} style={{ border: '1px solid var(--text-primary)', width: '30px', background: 'var(--bg-main)' }}>
                                 <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto', fontWeight: 800 }}>{period}</div>
                               </td>
                             )}
                             <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 800, width: '100px' }}>{subject}</td>
                             {DAYS.map(day => (
                               <td key={period+subject+day} style={{ border: '1px solid var(--text-primary)', padding: 0 }}>
                                 {rowContent(day)}
                               </td>
                             ))}
                             {idx === 0 && <td rowSpan={SUBJECTS.length} style={{ border: '1px solid var(--text-primary)' }}></td>}
                           </tr>
                         );
                       })}
                     </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}

          </div>

          <div className="print-details-section" style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'white' }}>
            <div className="details-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ border: '1px solid var(--text-primary)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>SEVGİLİ ÖĞRENCİM,</h4>
                <textarea 
                  className="no-print"
                  value={studentNote} 
                  onChange={(e) => setStudentNote(e.target.value)} 
                  style={{ width: '100%', border: 'none', resize: 'vertical', minHeight: '120px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-geist-sans)', lineHeight: '1.6' }} 
                  rows={8} 
                />
                <div 
                  className="print-only"
                  style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {studentNote}
                </div>
              </div>

              <div style={{ border: '1px solid var(--text-primary)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>ÖĞRENCİ DEĞERLENDİRMESİ</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bu hafta sana verilen görevleri tamamlarken çalışma verimini nasıl değerlendirirsin? Zorlandığın konular neler oldu?</p>
                <div style={{ borderBottom: '1px dotted var(--text-muted)', marginTop: '1.5rem' }}></div>
                <div style={{ borderBottom: '1px dotted var(--text-muted)', marginTop: '1.5rem' }}></div>
              </div>
            </div>

            <div className="signatures-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Öğrenci</p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{selectedStudent?.firstName} {selectedStudent?.lastName}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Eğitim Danışmanı & Rehber Öğretmen</p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>Ahmet ŞANLI</p>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  window.print();
                }} 
                style={{ padding: '1rem 2.5rem', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.3rem' }}>🖨️</span> Programı Yazdır
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveToArchive} 
                style={{ padding: '1rem 3rem', background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'white', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.3rem' }}>💾</span> Arşive Kaydet
              </button>
            </div>
          </div>
        </section>
      )}

      {isAnalyzing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="card" style={{
            width: '500px',
            maxWidth: '90vw',
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            {/* Spinning Brain Icon with Gradient Ring */}
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '4px solid var(--border)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{
                fontSize: '2.5rem',
                animation: 'pulse 1.5s ease-in-out infinite',
                userSelect: 'none'
              }}>🧠</div>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Yapay Zeka Analiz Ediyor
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Öğrencinin karne verileri yapay zeka koçu tarafından işleniyor.
            </p>
            
            {/* Progress Step List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left', margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 0 ? 1 : 0.4, transition: 'all 0.3s' }}>
                <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 2 ? 'var(--success)' : 'rgba(4, 120, 87, 0.1)', color: analysisSeconds >= 2 ? 'white' : 'var(--primary)', fontWeight: 'bold' }}>
                  {analysisSeconds >= 2 ? '✓' : '•'}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analysisSeconds >= 2 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  Sınav verileri ve karne okunuyor...
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 2 ? 1 : 0.4, transition: 'all 0.3s' }}>
                <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 7 ? 'var(--success)' : (analysisSeconds >= 2 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)'), color: analysisSeconds >= 7 ? 'white' : 'var(--primary)', fontWeight: 'bold' }}>
                  {analysisSeconds >= 7 ? '✓' : (analysisSeconds >= 2 ? '•' : '•')}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analysisSeconds >= 7 ? 'var(--text-secondary)' : (analysisSeconds >= 2 ? 'var(--text-primary)' : 'var(--text-muted)') }}>
                  Zayıf yönler ve konu eksikleri tespit ediliyor...
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 7 ? 1 : 0.4, transition: 'all 0.3s' }}>
                <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 7 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)', color: 'var(--primary)', fontWeight: 'bold' }}>
                  •
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analysisSeconds >= 7 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  Haftalık soru hedefleri ve koçluk notu hazırlanıyor...
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
              İşlem süresi sınav boyutuna göre değişebilir. Lütfen bekleyin.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
