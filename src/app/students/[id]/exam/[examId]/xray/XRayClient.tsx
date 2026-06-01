'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function XRayClient({ student, exam }: { student: any, exam: any }) {
  const [isScanning, setIsScanning] = useState(true);
  const [xrayData, setXrayData] = useState<{ diagnosis: string[], prescription: string[], summary: string } | null>(null);

  useEffect(() => {
    // Start scanning process
    const runScan = async () => {
      try {
        const res = await fetch('/api/generate-xray', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student, exam })
        });
        const data = await res.json();
        if (data.success) {
          setXrayData(data.result);
        }
      } catch (error) {
        console.error("X-Ray generation failed");
      } finally {
        setTimeout(() => setIsScanning(false), 2000); // minimum 2 saniye scan animasyonu göster
      }
    };
    
    runScan();
  }, [student, exam]);

  return (
    <div style={{ minHeight: '100vh', background: '#050A15', color: '#E2E8F0', fontFamily: 'monospace', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Grid & Scanlines */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))', backgroundSize: '100% 4px, 6px 100%', zIndex: 0, pointerEvents: 'none' }}></div>

      {isScanning && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.2), transparent)', animation: 'scan 2s linear infinite', zIndex: 10, pointerEvents: 'none' }}></div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header HUD */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(6, 182, 212, 0.3)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#06B6D4', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', margin: 0, textShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}>
              AI SINAV RÖNTGENİ
            </h1>
            <div style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', gap: '2rem' }}>
              <span>HASTA (ÖĞRENCİ) KODU: <strong style={{ color: '#F8FAFC' }}>{student.id.substring(0,8).toUpperCase()}</strong></span>
              <span>TARİH: <strong style={{ color: '#F8FAFC' }}>{new Date().toLocaleDateString('tr-TR')}</strong></span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: isScanning ? '#F59E0B' : '#10B981', fontSize: '1.2rem', fontWeight: 800, animation: 'blink 1.5s infinite', textTransform: 'uppercase' }}>
              {isScanning ? 'SİSTEM TARANIYOR...' : 'ANALİZ TAMAMLANDI'}
            </div>
            <Link href={`/students/${student.id}?tab=karneler`} style={{ display: 'inline-block', marginTop: '1rem', color: '#06B6D4', border: '1px solid #06B6D4', padding: '0.5rem 1rem', textDecoration: 'none', fontWeight: 700, transition: 'all 0.2s', background: 'rgba(6, 182, 212, 0.1)' }}>
              ÖĞRENCİ DOSYASINA DÖN ↲
            </Link>
          </div>
        </header>

        {/* Content HUD */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* Sol Panel: Hasta / Sınav Detayı */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ border: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: 10, background: '#050A15', padding: '0 10px', color: '#06B6D4', fontWeight: 800 }}>KİMLİK BİLGİSİ</div>
              <h2 style={{ fontSize: '1.8rem', color: '#F8FAFC', margin: '0 0 0.5rem 0' }}>{student.firstName} {student.lastName}</h2>
              <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>SINIF: {student.grade} | HEDEF: {student.target || 'BELİRTİLMEDİ'}</div>
            </div>

            <div style={{ border: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: 10, background: '#050A15', padding: '0 10px', color: '#06B6D4', fontWeight: 800 }}>VİTAL BULGULAR (SINAV)</div>
              <h3 style={{ color: '#F8FAFC', margin: '0 0 1rem 0' }}>{exam.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.7rem' }}>TOPLAM NET</div>
                  <div style={{ color: '#10B981', fontSize: '1.5rem', fontWeight: 900 }}>{exam.totalNet || '-'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.7rem' }}>YANLIŞ / BOŞ</div>
                  <div style={{ color: '#F43F5E', fontSize: '1.5rem', fontWeight: 900 }}>{exam.totalIncorrect || 0} / {exam.totalBlank || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Panel: AI Teşhis ve Reçete */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Teşhis */}
            <div style={{ border: '1px solid rgba(244, 63, 94, 0.5)', background: 'rgba(244, 63, 94, 0.05)', padding: '2rem', position: 'relative', minHeight: '200px' }}>
              <div style={{ position: 'absolute', top: -10, left: 10, background: '#050A15', padding: '0 10px', color: '#F43F5E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="blink">⚠️</span> KLİNİK TEŞHİS (ZAYIFLIKLAR)
              </div>
              
              {isScanning ? (
                <div style={{ color: '#F43F5E', opacity: 0.7, fontFamily: 'monospace' }}>Veriler taranıyor, anomali tespiti yapılıyor...</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#F8FAFC', lineHeight: 1.8 }}>
                  {xrayData?.diagnosis.map((d, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>{d}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Reçete */}
            <div style={{ border: '1px solid rgba(16, 185, 129, 0.5)', background: 'rgba(16, 185, 129, 0.05)', padding: '2rem', position: 'relative', minHeight: '200px', flex: 1 }}>
              <div style={{ position: 'absolute', top: -10, left: 10, background: '#050A15', padding: '0 10px', color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💊</span> DİJİTAL KOÇ REÇETESİ
              </div>
              
              {isScanning ? (
                <div style={{ color: '#10B981', opacity: 0.7, fontFamily: 'monospace' }}>Çözüm yolları hesaplanıyor, müdahale planı oluşturuluyor...</div>
              ) : (
                <>
                  <div style={{ color: '#E2E8F0', marginBottom: '1rem', fontStyle: 'italic', borderBottom: '1px dashed rgba(16, 185, 129, 0.3)', paddingBottom: '1rem' }}>
                    {xrayData?.summary}
                  </div>
                  <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#F8FAFC', lineHeight: 1.8 }}>
                    {xrayData?.prescription.map((p, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{p}</li>
                    ))}
                  </ol>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
