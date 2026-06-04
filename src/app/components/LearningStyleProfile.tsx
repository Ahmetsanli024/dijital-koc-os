'use client';
import { useState, useTransition } from 'react';
import { updateStudent } from '../actions/student';

const QUESTIONS = [
  { id: 'q1', text: 'Yeni bir konuyu nasıl öğrenmek istersin?', options: [
    { label: 'Şema ve görsel okuyarak', style: 'gorsel' },
    { label: 'Birinin anlatmasını dinleyerek', style: 'isitsel' },
    { label: 'Örnek sorular çözerek', style: 'kinestetik' },
  ]},
  { id: 'q2', text: 'Ders çalışırken ne zaman daha çok verim alırsın?', options: [
    { label: 'Sabah erken saatlerde', style: 'sabah' },
    { label: 'Öğleden sonra', style: 'oglen' },
    { label: 'Akşam saatlerinde', style: 'aksam' },
  ]},
  { id: 'q3', text: 'Kaç dakika kesintisiz konsantre olabilirsin?', options: [
    { label: '20 dakika ve altı', style: 'kisa' },
    { label: '20-45 dakika', style: 'orta' },
    { label: '45 dakika ve üzeri', style: 'uzun' },
  ]},
  { id: 'q4', text: 'Hangi çalışma ortamı sana daha uygun?', options: [
    { label: 'Sessiz ve izole bir yer', style: 'sessiz' },
    { label: 'Hafif müzikli', style: 'muzikli' },
    { label: 'Kafe/kütüphane gibi bir uğultu', style: 'uğultu' },
  ]},
  { id: 'q5', text: 'Bir şeyi nasıl daha iyi hatırlarsın?', options: [
    { label: 'Renkli notlar ve diyagramlarla', style: 'gorsel' },
    { label: 'Yüksek sesle tekrar ederek', style: 'isitsel' },
    { label: 'Yazarak ve uygulayarak', style: 'kinestetik' },
  ]},
];

function analyzeStyle(answers: Record<string, string>) {
  const counts: Record<string, number> = {};
  Object.values(answers).forEach(v => { counts[v] = (counts[v] || 0) + 1; });

  const gorsel      = (counts['gorsel'] || 0);
  const isitsel     = (counts['isitsel'] || 0);
  const kinestetik  = (counts['kinestetik'] || 0);
  const primaryStyle = gorsel >= isitsel && gorsel >= kinestetik ? 'Görsel' : isitsel >= kinestetik ? 'İşitsel' : 'Kinestetik';

  const peakTime = counts['sabah'] ? 'Sabah' : counts['oglen'] ? 'Öğleden Sonra' : 'Akşam';
  const focusDur = counts['uzun'] ? '45+ dk' : counts['orta'] ? '20-45 dk' : '20 dk';
  const env      = counts['sessiz'] ? 'Sessiz Ortam' : counts['muzikli'] ? 'Müzikli' : 'Kalabalık Ortam';

  return { primaryStyle, peakTime, focusDur, env,
    tips: primaryStyle === 'Görsel'
      ? ['Renkli notlar ve zihin haritaları kullan', 'Konuları şema/tablo haline getir', 'Video ders daha etkili olabilir']
      : primaryStyle === 'İşitsel'
        ? ['Konuları yüksek sesle oku/anlat', 'Ders kayıtlarını dinle', 'Tartışma grupları faydalı']
        : ['Bol uygulama sorusu çöz', 'Kısa molalarla çalış', 'El yazısıyla not al'],
  };
}

export default function LearningStyleProfile({ studentId, existingStyle }: { studentId: string; existingStyle?: string | null }) {
  const existing = existingStyle ? (() => { try { return JSON.parse(existingStyle); } catch { return null; } })() : null;
  const [answers, setAnswers]   = useState<Record<string, string>>({});
  const [result, setResult]     = useState<ReturnType<typeof analyzeStyle> | null>(existing);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isPending, start]      = useTransition();

  const allAnswered = QUESTIONS.every(q => answers[q.id]);

  const handleSubmit = () => {
    const analysis = analyzeStyle(answers);
    setResult(analysis);
    setShowQuiz(false);
    start(async () => {
      await updateStudent(studentId, { learningStyle: JSON.stringify(analysis) });
    });
  };

  if (!result && !showQuiz) {
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>🧠 Öğrenme Stili Profili</span>
          <button onClick={() => setShowQuiz(true)} style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>
            Analizi Başlat →
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>5 soruluk kısa anket ile öğrencinin öğrenme stilini belirleyin.</p>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div style={{ background: 'white', border: '1.5px solid var(--primary)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
          🧠 Öğrenme Stili Anketi
          <button onClick={() => setShowQuiz(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {QUESTIONS.map((q, i) => (
            <div key={q.id}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.4rem', color: '#1F2937' }}>
                {i + 1}. {q.text}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {q.options.map(opt => (
                  <button key={opt.style} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.style }))}
                    style={{ padding: '0.45rem 0.75rem', borderRadius: '7px', border: `1.5px solid ${answers[q.id] === opt.style ? 'var(--primary)' : 'var(--border)'}`, background: answers[q.id] === opt.style ? '#EFF6FF' : 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: answers[q.id] === opt.style ? 700 : 500, cursor: 'pointer', color: answers[q.id] === opt.style ? 'var(--primary)' : '#374151' }}>
                    {answers[q.id] === opt.style ? '● ' : '○ '}{opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} disabled={!allAnswered || isPending}
            style={{ padding: '0.6rem', borderRadius: '8px', border: 'none', background: allAnswered ? 'var(--primary)' : '#CBD5E1', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: allAnswered ? 'pointer' : 'not-allowed' }}>
            {isPending ? 'Kaydediliyor...' : `Analiz Et (${Object.keys(answers).length}/${QUESTIONS.length})`}
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const styleIcon = result.primaryStyle === 'Görsel' ? '👁️' : result.primaryStyle === 'İşitsel' ? '👂' : '✋';
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>🧠 Öğrenme Stili Profili</span>
          <button onClick={() => { setResult(null); setShowQuiz(true); setAnswers({}); }} style={{ padding: '0.2rem 0.55rem', borderRadius: '5px', border: '1px solid var(--border)', background: 'white', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}>Yeniden Yap</button>
        </div>
        <div style={{ padding: '0.85rem 1rem' }}>
          {/* Ana stil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', padding: '0.75rem', background: '#EFF6FF', borderRadius: '9px' }}>
            <span style={{ fontSize: '1.75rem' }}>{styleIcon}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary)' }}>{result.primaryStyle} Öğrenen</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Baskın öğrenme stili</div>
            </div>
          </div>
          {/* Detaylar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {[
              { icon: '🕐', label: 'Pik Saati', value: result.peakTime },
              { icon: '⏱', label: 'Odak Süresi', value: result.focusDur },
              { icon: '🏠', label: 'Ortam', value: result.env },
            ].map(d => (
              <div key={d.label} style={{ textAlign: 'center', padding: '0.5rem', background: '#F8FAFC', borderRadius: '7px' }}>
                <div style={{ fontSize: '1.1rem' }}>{d.icon}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.label}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{d.value}</div>
              </div>
            ))}
          </div>
          {/* İpuçları */}
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Koçluk Önerileri</div>
          {result.tips.map((tip: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: '#374151', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--primary)', flexShrink: 0 }}>•</span>{tip}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
