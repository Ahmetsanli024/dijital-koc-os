'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BriefData {
  student: { id: string; name: string; grade: string; target: string | null };
  lastExam: { name: string; net: number; trend: number | null } | null;
  program: { pct: number | null; openTasks: number; total: number };
  lastSession: { date: string; title: string; summary: string } | null;
  psycho: { motivation: number; anxiety: number } | null;
  aiSuggestion: string;
}

export function SeansBreefingModal({
  studentId,
  apptTitle,
  apptTime,
  durationMin,
  onClose,
}: {
  studentId: string;
  apptTitle: string;
  apptTime: string;
  durationMin: number;
  onClose: () => void;
}) {
  const [data, setData]       = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`/api/session-brief?studentId=${studentId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Brifing yüklenemedi.'); setLoading(false); });
  }, [studentId]);

  const netColor = (t: number | null) =>
    t === null ? '#64748B' : t > 0 ? '#10B981' : '#EF4444';
  const moColor  = (v: number) => v >= 7 ? '#10B981' : v >= 4 ? '#F59E0B' : '#EF4444';
  const axColor  = (v: number) => v <= 4 ? '#10B981' : v <= 7 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: 'white', borderRadius: '16px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

        {/* Başlık */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', padding: '1.25rem 1.5rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                📋 Seans Öncesi Brifing
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{apptTitle}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.2rem' }}>
                {new Date(apptTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · {durationMin} dk
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        {/* İçerik */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
              <div style={{ fontSize: '0.85rem' }}>Brifing hazırlanıyor...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && <div style={{ color: '#EF4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

          {data && (
            <>
              {/* 4 metrik */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.65rem' }}>
                {/* Son Net */}
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem 1rem', borderLeft: `3px solid ${netColor(data.lastExam?.trend ?? null)}` }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Son Deneme Neti</div>
                  {data.lastExam ? (
                    <>
                      <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#1E3A8A' }}>{data.lastExam.net}</div>
                      {data.lastExam.trend !== null && (
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: netColor(data.lastExam.trend) }}>
                          {data.lastExam.trend > 0 ? '+' : ''}{data.lastExam.trend} değişim
                        </div>
                      )}
                    </>
                  ) : <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sınav yok</div>}
                </div>

                {/* Program */}
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem 1rem', borderLeft: `3px solid ${data.program.pct !== null ? (data.program.pct >= 70 ? '#10B981' : '#F59E0B') : '#94A3B8'}` }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Haftalık Program</div>
                  {data.program.pct !== null ? (
                    <>
                      <div style={{ fontWeight: 900, fontSize: '1.3rem', color: data.program.pct >= 70 ? '#10B981' : '#F59E0B' }}>%{data.program.pct}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.program.openTasks} açık görev</div>
                    </>
                  ) : <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Program yok</div>}
                </div>

                {/* Psikoloji */}
                {data.psycho && (
                  <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem 1rem', borderLeft: '3px solid #7C3AED' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Psikoloji</div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: moColor(data.psycho.motivation) }}>{data.psycho.motivation}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Motivasyon</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: axColor(data.psycho.anxiety) }}>{data.psycho.anxiety}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Kaygı</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Son Seans */}
                {data.lastSession && (
                  <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem 1rem', borderLeft: '3px solid #0EA5E9' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Son Seans</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.15rem' }}>{data.lastSession.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {data.lastSession.summary || '—'}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Önerisi */}
              {data.aiSuggestion && (
                <div style={{ background: 'linear-gradient(135deg, #F5F3FF, #EFF6FF)', border: '1px solid #C4B5FD', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>🤖 AI Seans Önerisi</div>
                  <p style={{ fontSize: '0.83rem', color: '#4C1D95', lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{data.aiSuggestion}</p>
                </div>
              )}

              {/* Alt butonlar */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Link href={`/students/${data.student.id}`} onClick={onClose}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>
                  👤 Profil
                </Link>
                <Link href={`/sessions`} onClick={onClose}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none' }}>
                  ✍️ Seans Notu Yaz
                </Link>
                <Link href={`/assignments?studentId=${data.student.id}`} onClick={onClose}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>
                  📅 Program
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
