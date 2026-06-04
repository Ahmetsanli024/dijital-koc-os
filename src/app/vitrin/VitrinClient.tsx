'use client';
import { useState, useTransition } from 'react';
import PageHeader from '../components/PageHeader';

type Story = { id: string; studentName: string; grade: string | null; startNet: number | null; endNet: number | null; lgsScore: number | null; school: string; quote: string | null; period: string | null; createdAt: string };

const SCHOOL_EMOJIS: Record<string, string> = {
  'fen': '🔬', 'anadolu': '📚', 'sosyal': '🎭', 'imam': '🕌',
  'güzel': '🎨', 'spor': '⚽', 'meslek': '🔧',
};
function schoolEmoji(school: string) {
  const s = school.toLowerCase();
  return Object.entries(SCHOOL_EMOJIS).find(([k]) => s.includes(k))?.[1] || '🏫';
}

export default function VitrinClient({ stories: init }: { stories: Story[] }) {
  const [stories, setStories] = useState<Story[]>(init);
  const [showForm, setShowForm] = useState(false);
  const [isPending, start]     = useTransition();
  const [toast, setToast]      = useState('');
  const [form, setForm]        = useState({ studentName: '', grade: '', startNet: '', endNet: '', lgsScore: '', school: '', quote: '', period: `${new Date().getFullYear()} LGS` });

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleAdd = () => {
    if (!form.studentName || !form.school) { showToast('Ad ve okul zorunlu.'); return; }
    start(async () => {
      const res = await fetch('/api/success-stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.story) {
        setStories(prev => [{ ...data.story, createdAt: new Date(data.story.createdAt).toISOString() }, ...prev]);
        setShowForm(false);
        setForm({ studentName: '', grade: '', startNet: '', endNet: '', lgsScore: '', school: '', quote: '', period: `${new Date().getFullYear()} LGS` });
        showToast('Başarı hikayesi eklendi 🏆');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bu hikaye silinsin mi?')) return;
    start(async () => {
      await fetch('/api/success-stories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      setStories(prev => prev.filter(s => s.id !== id));
      showToast('Silindi');
    });
  };

  // Paylaşım metni
  const shareText = (s: Story) =>
    `🏆 ${s.studentName} — ${s.school}\n${s.startNet ? `Net: ${s.startNet} → ${s.endNet || '?'}` : ''} ${s.lgsScore ? `| LGS: ${s.lgsScore}` : ''}\n${s.quote ? `"${s.quote}"` : ''}\n\n#Koçluk #LGS${new Date().getFullYear()} #Başarı`;

  const iS: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-main)', fontFamily: 'inherit' };

  return (
    <div style={{ maxWidth: '1100px', width: '100%' }}>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: '#10B981', color: 'white', fontWeight: 700 }}>{toast}</div>}

      <PageHeader title="Başarı Vitrini" subtitle="Mezun öğrencilerin başarı hikayeleri — motivasyon ve referans arşivi"
        breadcrumb={['Ana Sayfa', 'Başarı Vitrini']} count={stories.length}
        actions={[{ label: '+ Hikaye Ekle', variant: 'primary', onClick: () => setShowForm(s => !s) }]} />

      {/* Ekleme Formu */}
      {showForm && (
        <div style={{ background: 'white', border: '1.5px solid #D97706', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', color: '#D97706' }}>🏆 Yeni Başarı Hikayesi</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>Öğrenci Adı *</label><input value={form.studentName} onChange={e=>setForm(f=>({...f,studentName:e.target.value}))} style={iS} placeholder="Ali Yılmaz" /></div>
            <div><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>Sınıf/Dönem</label><input value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value}))} style={iS} placeholder="8. Sınıf" /></div>
            <div><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>Dönem</label><input value={form.period} onChange={e=>setForm(f=>({...f,period:e.target.value}))} style={iS} /></div>
            <div><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>Başlangıç Neti</label><input type="number" value={form.startNet} onChange={e=>setForm(f=>({...f,startNet:e.target.value}))} style={iS} placeholder="45.2" /></div>
            <div><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>Bitiş Neti</label><input type="number" value={form.endNet} onChange={e=>setForm(f=>({...f,endNet:e.target.value}))} style={iS} placeholder="78.5" /></div>
            <div><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>LGS Puanı</label><input type="number" value={form.lgsScore} onChange={e=>setForm(f=>({...f,lgsScore:e.target.value}))} style={iS} placeholder="472.3" /></div>
            <div style={{ gridColumn:'span 2' }}><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>Kazandığı Okul *</label><input value={form.school} onChange={e=>setForm(f=>({...f,school:e.target.value}))} style={iS} placeholder="Ankara Fen Lisesi" /></div>
            <div><label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.25rem' }}>Öğrenci Alıntısı</label><input value={form.quote} onChange={e=>setForm(f=>({...f,quote:e.target.value}))} style={iS} placeholder="Koçum olmadan..." /></div>
          </div>
          <div style={{ display:'flex', gap:'0.6rem', justifyContent:'flex-end' }}>
            <button onClick={()=>setShowForm(false)} style={{ padding:'0.5rem 1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'white', fontWeight:600, cursor:'pointer' }}>İptal</button>
            <button onClick={handleAdd} disabled={isPending} style={{ padding:'0.5rem 1.5rem', borderRadius:'7px', border:'none', background:'#D97706', color:'white', fontWeight:700, cursor:'pointer' }}>Kaydet</button>
          </div>
        </div>
      )}

      {/* Hikayeler Grid */}
      {stories.length === 0 ? (
        <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'12px', padding:'4rem', textAlign:'center', color:'var(--text-muted)' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🏆</div>
          <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.4rem' }}>Henüz hikaye eklenmedi</div>
          <div style={{ fontSize:'0.85rem' }}>Mezun öğrencilerini ekleyin — motivasyon ve referans arşivi oluşturun</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem' }}>
          {stories.map(s => {
            const improvement = s.startNet && s.endNet ? +(s.endNet - s.startNet).toFixed(1) : null;
            return (
              <div key={s.id} style={{ background:'white', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden', boxShadow:'var(--shadow-sm)', transition:'transform 0.2s', cursor:'default' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-3px)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>

                {/* Üst bant */}
                <div style={{ background:'linear-gradient(135deg,#1E3A8A,#2563EB)', padding:'1.1rem 1.25rem', color:'white', position:'relative' }}>
                  <div style={{ fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.2rem' }}>
                    {s.period || 'LGS Başarısı'}
                  </div>
                  <div style={{ fontWeight:900, fontSize:'1.15rem' }}>{s.studentName}</div>
                  {s.grade && <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.7)', marginTop:'0.1rem' }}>{s.grade}</div>}
                  <div style={{ position:'absolute', right:'1rem', top:'1rem', fontSize:'2rem' }}>{schoolEmoji(s.school)}</div>
                </div>

                <div style={{ padding:'1rem 1.25rem' }}>
                  {/* Okul */}
                  <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--primary)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    🏫 {s.school}
                  </div>

                  {/* Net ilerleme */}
                  {(s.startNet || s.endNet || s.lgsScore) && (
                    <div style={{ display:'flex', gap:'0.6rem', marginBottom:'0.75rem' }}>
                      {s.startNet && <div style={{ flex:1, textAlign:'center', background:'#FEF2F2', borderRadius:'8px', padding:'0.5rem' }}>
                        <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#EF4444' }}>{s.startNet}</div>
                        <div style={{ fontSize:'0.62rem', color:'#94A3B8' }}>Başlangıç</div>
                      </div>}
                      {improvement !== null && <div style={{ display:'flex', alignItems:'center', fontSize:'1rem', color:'#10B981', fontWeight:900 }}>▶</div>}
                      {s.endNet && <div style={{ flex:1, textAlign:'center', background:'#F0FDF4', borderRadius:'8px', padding:'0.5rem' }}>
                        <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#10B981' }}>{s.endNet}</div>
                        <div style={{ fontSize:'0.62rem', color:'#94A3B8' }}>Bitiş</div>
                      </div>}
                      {s.lgsScore && <div style={{ flex:1, textAlign:'center', background:'#EFF6FF', borderRadius:'8px', padding:'0.5rem' }}>
                        <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#2563EB' }}>{s.lgsScore}</div>
                        <div style={{ fontSize:'0.62rem', color:'#94A3B8' }}>LGS Puanı</div>
                      </div>}
                    </div>
                  )}

                  {improvement !== null && improvement > 0 && (
                    <div style={{ textAlign:'center', padding:'0.3rem', background:'linear-gradient(135deg,#F0FDF4,#EFF6FF)', borderRadius:'7px', fontSize:'0.78rem', fontWeight:800, color:'#10B981', marginBottom:'0.75rem' }}>
                      +{improvement} net artışı
                    </div>
                  )}

                  {/* Alıntı */}
                  {s.quote && (
                    <div style={{ padding:'0.6rem 0.85rem', background:'#FFFBEB', borderRadius:'8px', borderLeft:'3px solid #D97706', fontSize:'0.78rem', color:'#78350F', fontStyle:'italic', marginBottom:'0.75rem', lineHeight:1.5 }}>
                      "{s.quote}"
                    </div>
                  )}

                  {/* Butonlar */}
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button onClick={() => { navigator.clipboard.writeText(shareText(s)); showToast('Paylaşım metni kopyalandı!'); }}
                      style={{ flex:2, padding:'0.4rem', borderRadius:'7px', border:'1px solid var(--border)', background:'white', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}>
                      📋 Paylaş
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      style={{ flex:1, padding:'0.4rem', borderRadius:'7px', border:'none', background:'#FEF2F2', color:'#EF4444', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
