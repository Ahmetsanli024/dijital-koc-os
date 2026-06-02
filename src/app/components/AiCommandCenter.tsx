'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AiCommandCenter() {
  const [command, setCommand]   = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command && !file) return;
    setLoading(true); setMsg(null);
    try {
      let pdfBase64 = '';
      if (file) { const buf = await file.arrayBuffer(); pdfBase64 = Buffer.from(buf).toString('base64'); }
      const res  = await fetch('/api/ai-command', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt:command, pdfBase64, filename:file?.name }) });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message, ok: true });
        if (data.intent === 'create_student') setTimeout(() => router.push(`/students/${data.student.id}`), 1500);
        else if (data.intent === 'search_exam' && data.examId) setTimeout(() => router.push(`/students/${data.studentId}/exam/${data.examId}/xray`), 1500);
        else if (data.intent === 'upload_exam') setTimeout(() => router.push(`/students/${data.studentId}?upload=true`), 1500);
        setCommand(''); setFile(null);
      } else setMsg({ text: data.error || 'İşlem gerçekleştirilemedi.', ok: false });
    } catch { setMsg({ text: 'Bağlantı hatası.', ok: false }); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:'680px' }}>
      <form onSubmit={handleSubmit} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={{ flex:1, position:'relative' }}>
          <span style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', fontSize:'1rem', opacity:0.6 }}>🤖</span>
          <input
            type="text" value={command} onChange={e => setCommand(e.target.value)} disabled={isLoading}
            placeholder="Asistana yaz: 'Ali Yılmaz 8. Sınıf ekle' veya 'Son sınavı analiz et'..."
            style={{ width:'100%', padding:'0.85rem 3rem 0.85rem 2.5rem', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.22)', background:'rgba(0,0,0,0.28)', backdropFilter:'blur(8px)', color:'white', fontSize:'0.88rem', outline:'none' }}
          />
          <label style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', cursor:'pointer', opacity: file ? 1 : 0.55 }}>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0]||null)} style={{ display:'none' }} disabled={isLoading} />
            <span title="PDF ekle" style={{ fontSize:'1rem' }}>📎</span>
          </label>
        </div>
        <button type="submit" disabled={isLoading} style={{ padding:'0.85rem 1.25rem', borderRadius:'9px', border:'none', background:'rgba(255,255,255,0.18)', color:'white', fontWeight:800, fontSize:'0.82rem', cursor:'pointer', whiteSpace:'nowrap' }}>
          {isLoading ? '⏳' : 'Gönder'}
        </button>
      </form>

      {file && (
        <div style={{ marginTop:'0.4rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span>📄 {file.name}</span>
          <button onClick={() => setFile(null)} style={{ background:'none', border:'none', color:'rgba(255,100,100,0.9)', cursor:'pointer', fontWeight:800, fontSize:'0.7rem' }}>✕ Kaldır</button>
        </div>
      )}

      {msg && (
        <div style={{ marginTop:'0.75rem', padding:'0.75rem 1rem', borderRadius:'8px', background: msg.ok ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)', borderLeft:`3px solid ${msg.ok?'#10B981':'#EF4444'}`, color:'white', fontWeight:600, fontSize:'0.85rem', lineHeight:1.5 }}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
