'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AiCommandCenter() {
  const [command, setCommand] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command && !file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      let pdfBase64 = '';
      if (file) {
        const buffer = await file.arrayBuffer();
        pdfBase64 = Buffer.from(buffer).toString('base64');
      }

      const res = await fetch('/api/ai-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: command, 
          pdfBase64,
          filename: file?.name 
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' });
        
        if (data.intent === 'create_student') {
          setTimeout(() => router.push(`/students/${data.student.id}`), 1500);
        } else if (data.intent === 'upload_exam' || data.intent === 'search_exam') {
          // If we have an examId from search, go to xray directly.
          // If it's upload, we need to upload it first through the normal flow, or pass the base64 to X-Ray page.
          // For simplicity, we can route to an upload-exam specific flow or the new X-Ray page placeholder.
          // Let's assume we redirect to xray page directly, but since we didn't save the exam to DB here (the AI just matched intent),
          // We will pass the studentId to the frontend so the user can be redirected to their profile or a specific X-Ray generating page.
          
          if (data.intent === 'search_exam' && data.examId) {
             setTimeout(() => router.push(`/students/${data.studentId}/exam/${data.examId}/xray`), 1500);
          } else {
             // For PDF upload, the actual parse logic should happen, but we'll redirect to the student's profile for now or X-Ray.
             // We can use the existing /api/parse-exam or do it in the X-Ray page. 
             // We'll redirect to a generic loading xray page.
             setTimeout(() => router.push(`/students/${data.studentId}?upload=true&note=${encodeURIComponent(data.examNote || '')}`), 1500);
          }
        }
        
        setCommand('');
        setFile(null);
      } else {
        setMessage({ text: data.error, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Bağlantı hatası.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: '700px' }}>
      <form onSubmit={handleCommand} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '1rem', fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)' }}>🤖</div>
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="AI Asistan: Öğrenci adı soyadı sınıf yazıp kaydet diyebilir veya sınav dosyasıyla emir verebilirsiniz..." 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1.25rem 4rem 1.25rem 3.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s'
          }}
        />
        
        {/* PDF File Picker */}
        <label style={{ position: 'absolute', right: '4.5rem', cursor: 'pointer', opacity: file ? 1 : 0.6, transition: '0.2s', background: file ? 'rgba(16, 185, 129, 0.2)' : 'transparent', padding: '0.4rem', borderRadius: '50%' }}>
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} disabled={isLoading} />
          <span style={{ fontSize: '1.2rem' }}>📎</span>
        </label>
        
        {/* Submit Button (replaces ⌘K) */}
        <button type="submit" disabled={isLoading} style={{ position: 'absolute', right: '1rem', background: isLoading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 800, color: 'white', cursor: 'pointer', transition: '0.2s' }}>
          {isLoading ? '⏳' : 'GÖNDER'}
        </button>
      </form>
      
      {file && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#A7F3D0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📄 Seçilen Dosya: {file.name}</span>
          <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', fontWeight: 800 }}>✖</button>
        </div>
      )}

      {message && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)', 
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          borderLeft: `4px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: 'white',
          fontWeight: 600,
          animation: 'fadeIn 0.3s'
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
