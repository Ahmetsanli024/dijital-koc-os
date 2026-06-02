'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardQuickActions({ students }: { students: any[] }) {
  const [showUpload, setShowUpload]           = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [file, setFile]                       = useState<File | null>(null);
  const [isUploading, setIsUploading]         = useState(false);

  const handleUpload = async () => {
    if (!selectedStudent || !file) { alert('Lütfen öğrenci ve sınav dosyasını seçin.'); return; }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('studentId', selectedStudent); fd.append('examType', 'SINGLE');
      const res  = await fetch('/api/upload-exam', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.exam) { window.location.href = `/students/${selectedStudent}/exam/${data.exam.id}/xray`; }
      else alert(data.error || 'Sınav yüklenemedi.');
    } catch { alert('Bağlantı hatası.'); }
    finally { setIsUploading(false); setShowUpload(false); }
  };

  const ghost: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.55rem 1.1rem', borderRadius:'7px', background:'rgba(255,255,255,0.14)', color:'white', border:'1px solid rgba(255,255,255,0.22)', fontWeight:700, fontSize:'0.82rem', textDecoration:'none', cursor:'pointer', whiteSpace:'nowrap' };

  return (
    <>
      <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
        <Link href="/students"    style={{ ...ghost, background:'white', color:'#1E3A8A', border:'none' }}>👤 Koçluk Portföyü</Link>
        <Link href="/assignments" style={ghost}>📅 Bireysel Program Hazırla</Link>
        <button onClick={() => setShowUpload(true)} style={ghost}>📊 Sınav Analizi Yap</button>
        <Link href="/sessions"    style={ghost}>🤝 Seans Merkezi</Link>
      </div>

      {showUpload && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.72)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, backdropFilter:'blur(6px)' }}>
          <div style={{ width:'100%', maxWidth:'520px', background:'white', borderRadius:'14px', padding:'2rem', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h2 style={{ fontWeight:800, fontSize:'1.05rem' }}>📊 Sınav Analizi Başlat</h2>
              <button onClick={() => setShowUpload(false)} style={{ background:'none', border:'none', fontSize:'1.1rem', cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
            </div>
            <p style={{ fontSize:'0.83rem', color:'var(--text-secondary)', marginBottom:'1.25rem', lineHeight:1.6 }}>
              Öğrencinin deneme sınav karnesini (PDF) yükleyin. Yapay zeka konu bazlı zayıflıkları tespit eder ve bireysel gelişim planı için öncelik haritası çıkarır.
            </p>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.35rem' }}>Öğrenci</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} style={{ width:'100%', padding:'0.65rem 0.9rem', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'0.88rem', background:'var(--bg-main)', outline:'none' }}>
                <option value="">— Öğrenci seçin —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.35rem' }}>Sınav Karnesi (PDF)</label>
              <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.9rem 1rem', borderRadius:'8px', border:`2px dashed ${file?'#10B981':'var(--border)'}`, background:file?'#F0FDF4':'var(--bg-main)', cursor:'pointer' }}>
                <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0]||null)} style={{ display:'none' }} disabled={isUploading} />
                <span style={{ fontSize:'1.4rem' }}>{file?'✅':'📄'}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.86rem', color:file?'#065F46':'var(--text-secondary)' }}>{file ? file.name : 'Dosya seçmek için tıklayın'}</div>
                  {!file && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>PDF · Sınavza, Hız, Nartest, Özdebir vb. karneler</div>}
                </div>
              </label>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.6rem' }}>
              <button onClick={() => setShowUpload(false)} style={{ padding:'0.55rem 1.1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'white', fontWeight:600, cursor:'pointer', fontSize:'0.83rem' }}>Vazgeç</button>
              <button onClick={handleUpload} disabled={isUploading||!selectedStudent||!file}
                style={{ padding:'0.55rem 1.4rem', borderRadius:'7px', border:'none', background:isUploading?'#94A3B8':'var(--primary)', color:'white', fontWeight:700, cursor:'pointer', fontSize:'0.83rem', opacity:(!selectedStudent||!file)?0.5:1 }}>
                {isUploading ? '⏳ Analiz yapılıyor...' : 'Analizi Başlat →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
