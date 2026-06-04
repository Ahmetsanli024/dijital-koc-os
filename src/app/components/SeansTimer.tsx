'use client';
import { useState, useEffect, useRef } from 'react';

interface SeansTimerProps {
  durationMin: number;
  studentName: string;
  onComplete?: () => void;
}

export function SeansTimer({ durationMin, studentName, onComplete }: SeansTimerProps) {
  const totalSec   = durationMin * 60;
  const [elapsed, setElapsed]   = useState(0);
  const [running, setRunning]   = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= totalSec) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            onComplete?.();
            return totalSec;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, totalSec, onComplete]);

  const remaining  = totalSec - elapsed;
  const mins       = Math.floor(remaining / 60);
  const secs       = remaining % 60;
  const pct        = Math.min(100, (elapsed / totalSec) * 100);

  const color = finished ? '#10B981' : pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#2563EB';
  const radius = 42;
  const circ   = 2 * Math.PI * radius;
  const dash   = circ * (1 - pct / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'white', borderRadius: '14px', border: '1px solid var(--border)', maxWidth: '280px', width: '100%' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {studentName} — Seans Zamanlayıcı
      </div>

      {/* Dairesel progress */}
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: '1.6rem', color, lineHeight: 1 }}>
            {finished ? '✓' : `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {finished ? 'Tamamlandı' : `/ ${durationMin} dk`}
          </div>
        </div>
      </div>

      {/* İlerleme çubuğu metni */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
        {finished ? '🎉 Seans tamamlandı!' : running ? `${Math.round(pct)}% geçti` : 'Hazır'}
      </div>

      {/* Butonlar */}
      <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
        {!finished && (
          <button onClick={() => setRunning(r => !r)}
            style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: running ? '#FEF3C7' : color, color: running ? '#92400E' : 'white', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            {running ? '⏸ Duraklat' : elapsed === 0 ? '▶ Başlat' : '▶ Devam'}
          </button>
        )}
        <button onClick={() => { setElapsed(0); setRunning(false); setFinished(false); }}
          style={{ flex: finished ? 2 : 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          {finished ? '🔄 Yeni Seans' : '↺ Sıfırla'}
        </button>
      </div>

      {finished && (
        <div style={{ width: '100%', padding: '0.6rem 0.85rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '0.78rem', fontWeight: 700, color: '#065F46', textAlign: 'center' }}>
          Seans notu yazmayı unutmayın! 📝
        </div>
      )}
    </div>
  );
}
