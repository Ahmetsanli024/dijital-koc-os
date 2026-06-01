'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardQuickActions({ students }: { students: any[] }) {
  const [showFastUpload, setShowFastUpload] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedStudent || !file) {
      alert('Lütfen öğrenci ve dosya seçin.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', selectedStudent);
      formData.append('examType', 'SINGLE');

      const res = await fetch('/api/upload-exam', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.exam) {
        // Redirect to the AI Exam X-Ray analysis page instead of standard tab
        window.location.href = `/students/${selectedStudent}/exam/${data.exam.id}/xray`;
      } else {
        alert(data.error || 'Yükleme başarısız.');
      }
    } catch (e) {
      alert('Sistem hatası.');
    } finally {
      setIsUploading(false);
      setShowFastUpload(false);
    }
  };

  return (
    <>
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        background: 'rgba(255, 255, 255, 0.1)', 
        padding: '1rem', 
        borderRadius: 'var(--radius-md)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        zIndex: 1,
        flexWrap: 'wrap'
      }}>
        <Link href="/students" className="btn" style={{ background: '#FFFFFF', color: '#064E3B', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
          <span>👥</span> Dijital Öğrenci Envanteri
        </Link>
        <Link href="/assignments" className="btn" style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
          <span>📅</span> Hızlı Ders Programı Hazırlama
        </Link>
        <button onClick={() => setShowFastUpload(true)} className="btn" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <span>🚀</span> Hızlı Sınav Okut
        </button>
      </div>

      {showFastUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '550px', 
            background: 'white', 
            padding: '2.5rem', 
            animation: 'fadeInSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            
            {/* Optik Tarayıcı Animasyonu */}
            {isUploading && (
              <>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary), 0 0 30px var(--primary)', animation: 'scanLine 1.5s linear infinite', zIndex: 10 }}></div>
                <style>{`
                  @keyframes scanLine {
                    0% { top: 0; opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { top: 100%; opacity: 1; }
                  }
                `}</style>
              </>
            )}

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(30, 58, 138, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>📸</div>
              Optik Veri Aktarımı (AI)
            </h2>
            
            <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}> Hedef Öğrenci Profili</label>
              <select 
                value={selectedStudent} 
                onChange={e => setSelectedStudent(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border)', fontSize: '1rem', background: 'var(--bg-main)', color: 'var(--text-primary)', fontWeight: 600, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">-- Lütfen veri aktarılacak öğrenciyi seçin --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📄 Sınav Sonuç Belgesi (PDF Yükleme)</label>
              <div style={{ border: '2px dashed var(--primary)', padding: '2.5rem 1rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: 'rgba(30, 58, 138, 0.03)', transition: 'all 0.3s', cursor: 'pointer' }}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                  id="fast-upload-input"
                  disabled={isUploading}
                />
                <label htmlFor="fast-upload-input" style={{ cursor: isUploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    {file ? '✅' : '📥'}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontWeight: 800, color: file ? 'var(--success)' : 'var(--primary)', fontSize: '1.1rem' }}>
                      {file ? file.name : "Sisteme Yüklemek İçin Tıklayın"}
                    </span>
                    {!file && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Sadece PDF formatı desteklenir</span>}
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button onClick={() => setShowFastUpload(false)} disabled={isUploading} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', padding: '0.5rem' }}>
                İşlemi İptal Et
              </button>
              <button 
                onClick={handleUpload} 
                disabled={isUploading || !selectedStudent || !file}
                className="btn-primary" 
                style={{ 
                  padding: '1rem 2rem', 
                  background: isUploading ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                  border: 'none',
                  fontSize: '1rem',
                  letterSpacing: '0.05em'
                }}
              >
                {isUploading ? 'Yapay Zeka Taraması Yapılıyor...' : 'Veriyi Sisteme İşle →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
