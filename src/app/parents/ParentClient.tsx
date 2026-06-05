'use client';
import React, { useState, useEffect, useTransition } from 'react';
import { logParentCommunication, markAsSent } from '../actions/parent';
import PageHeader from '../components/PageHeader';

const TOPICS = [
  'Genel Değerlendirme', 'Deneme Analizi', 'Program Güncellemesi',
  'Motivasyon Desteği', 'Sınav Strateji', 'Acil Görüşme Talebi',
];

const TEMPLATES: Record<string, (name: string, parent: string, examInfo: string, weakInfo: string) => string> = {
  'Genel Değerlendirme': (n, p, e, w) =>
    `Sayın ${p},\n\n${n} ile bu haftaki koçluk seansımızı gerçekleştirdik. ${e ? `Son denemesinde ${e}. ` : ''}Genel gidişat olumlu seyrediyor; belirlediğimiz hedeflere yönelik programı titizlikle takip ediyoruz.\n\n${w ? `Özellikle ${w} konularında ek çalışma yapmasını önerdim. ` : ''}Evde çalışma disiplinini koruması bu süreçte çok önemli.\n\nHer türlü soru için ulaşabilirsiniz. İyi günler,\n\nAhmet ŞANLI\nRehber Öğretmen`,
  'Deneme Analizi': (n, p, e, w) =>
    `Sayın ${p},\n\n${n}'nin ${e ? e + ' sonuçlarını' : 'son deneme sonuçlarını'} birlikte değerlendirdik.\n\n${w ? `📌 Öncelikli çalışılması gereken alanlar: ${w}\n\n` : ''}Bu eksiklikler göz önünde bulundurularak önümüzdeki haftanın programı güncellendi. Konuların pekiştirilmesi için düzenli ve odaklı çalışma süreci kritik önem taşıyor.\n\nSaygılarımla,\n\nAhmet ŞANLI\nRehber Öğretmen`,
  'Motivasyon Desteği': (n, p, _e, _w) =>
    `Sayın ${p},\n\nBu hafta ${n} ile motivasyon ve hedef odaklı bir görüşme yaptık. Sınav sürecinde zaman zaman karşılaşılan yorgunluk ve motivasyon dalgalanmaları son derece normaldir.\n\n${n}'e evde pozitif ve destekleyici bir ortam sağlamanız bu süreçte büyük fark yaratır. Baskı yerine teşvik, eleştiri yerine güven verici bir yaklaşım benimsemenizi öneririm.\n\nBirlikte başaracağız. İyi günler,\n\nAhmet ŞANLI\nRehber Öğretmen`,
  'Program Güncellemesi': (n, p, _e, w) =>
    `Sayın ${p},\n\n${n}'nin bireysel gelişim programı güncellendi. ${w ? `${w} konularına daha fazla ağırlık verecek şekilde yeniden düzenlendi.` : 'Mevcut performansa göre optimize edildi.'}\n\nYeni program doğrultusunda günlük hedeflerin takip edilmesi büyük önem taşımaktadır. Herhangi bir aksaklık durumunda lütfen benimle iletişime geçin.\n\nSaygılarımla,\n\nAhmet ŞANLI\nRehber Öğretmen`,
  'Sınav Strateji': (n, p, _e, _w) =>
    `Sayın ${p},\n\n${n} ile sınav strateji ve zaman yönetimi üzerine kapsamlı bir görüşme gerçekleştirdik. Sınava yaklaşırken yoğunluğu kademeli artırmak, güçlü konuları pekiştirmek ve sınav günü rutinini oturtmak üzerine yol haritası oluşturduk.\n\nSinav günü saatinde uyanma ve beslenme düzenine dikkat edilmesini önemle rica ederim.\n\nSaygılarımla,\n\nAhmet ŞANLI\nRehber Öğretmen`,
  'Acil Görüşme Talebi': (n, p, _e, _w) =>
    `Sayın ${p},\n\n${n} ile ilgili önemli bir konuyu sizinle paylaşmak istiyorum. En kısa sürede bir görüşme ayarlamamız gerektiğini düşünüyorum.\n\nMüsait olduğunuz bir zamanı belirtirseniz görüşme ayarlayabiliriz.\n\nSaygılarımla,\n\nAhmet ŞANLI\nRehber Öğretmen`,
};

export default function ParentClient({ students }: { students: any[] }) {
  const [selectedId, setSelectedId]   = useState('');
  const [topic, setTopic]             = useState(TOPICS[0]);
  const [message, setMessage]         = useState('');
  const [isSaving, setIsSaving]       = useState(false);
  const [toast, setToast]             = useState('');
  const [, startTransition]           = useTransition();

  const student    = students.find(s => s.id === selectedId);
  const allDrafts  = students.flatMap(s => (s.parentComms || []).filter((c: any) => c.isDraft).map((c: any) => ({ ...c, student: s })));
  const allHistory = students.flatMap(s => (s.parentComms || []).filter((c: any) => !c.isDraft).map((c: any) => ({ ...c, student: s }))).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  // Otomatik şablon üretimi
  useEffect(() => {
    if (!student) { setMessage(''); return; }
    const e = student.exams?.[0] ? `${student.exams[0].name} — ${student.exams[0].totalNet} net` : '';
    let w = '';
    if (student.exams?.[0]?.aiTopics) {
      try {
        const subs = JSON.parse(student.exams[0].aiTopics);
        const list: string[] = [];
        subs.forEach((s: any) => {
          const weaks = (s.topics || []).filter((t: any) => t.isWeak || t.percentage < 50).map((t: any) => t.name);
          if (weaks.length) list.push(`${s.name}: ${weaks.slice(0,2).join(', ')}`);
        });
        w = list.slice(0, 2).join('; ');
      } catch {}
    }
    const fn = TEMPLATES[topic] || TEMPLATES['Genel Değerlendirme'];
    setMessage(fn(student.firstName, student.parentName || 'Velimiz', e, w));
  }, [selectedId, topic, students]);

  const handleSave = async (isDraft: boolean) => {
    if (!student || !message.trim()) { showToast('Öğrenci seçin ve mesaj girin.'); return; }
    setIsSaving(true);
    const res = await logParentCommunication(student.id, topic, message, isDraft);
    setIsSaving(false);
    if (res.success) {
      if (!isDraft) {
        const phone = (student.parentPhone || '').replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        showToast('Mesaj WhatsApp\'ta açıldı ✅');
      } else {
        showToast('Taslak kaydedildi 💾');
      }
    } else {
      showToast('Hata: ' + res.error);
    }
  };

  const handleSendDraft = async (draftId: string, phone: string, text: string) => {
    startTransition(async () => {
      const res = await markAsSent(draftId);
      if (res.success) {
        window.open(`https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`, '_blank');
        showToast('Gönderildi ✅');
      }
    });
  };

  const iS: React.CSSProperties = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)', fontFamily: 'inherit' };

  return (
    <div style={{ maxWidth: '1200px', width: '100%' }}>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: '#10B981', color: 'white', fontWeight: 700 }}>{toast}</div>}

      <PageHeader title="Veli İletişim Köprüsü" subtitle="Profesyonel veli bildirimleri, taslak yönetimi ve iletişim geçmişi"
        breadcrumb={['Ana Sayfa', 'Veli İletişimi']} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* SOL: Yeni Mesaj */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem' }}>
              ✍️ Yeni Veli Mesajı
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Öğrenci</label>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={iS}>
                  <option value="">— Seçin —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} {s.parentPhone ? `· ${s.parentPhone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {student && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.65rem 0.85rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Veli: {student.parentName || '—'}</div>
                    <div style={{ color: '#16A34A' }}>{student.parentPhone || 'Telefon girilmemiş'}</div>
                  </div>
                  {student.exams?.[0] && (
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#2563EB' }}>{student.exams[0].totalNet} net</div>
                      <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>{student.exams[0].name}</div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Mesaj Konusu</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {TOPICS.map(t => (
                    <button key={t} onClick={() => setTopic(t)}
                      style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                        background: topic === t ? 'var(--primary)' : 'var(--bg-main)',
                        color: topic === t ? 'white' : 'var(--text-secondary)' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Mesaj İçeriği</label>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{message.length} karakter</span>
                </div>
                <textarea rows={10} value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Öğrenci seçince otomatik mesaj oluşturulur. Düzenleyebilirsiniz."
                  style={{ ...iS, resize: 'vertical', lineHeight: 1.65, fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => handleSave(true)} disabled={isSaving || !selectedId}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: (!selectedId || isSaving) ? 0.5 : 1 }}>
                  💾 Taslak Kaydet
                </button>
                <button onClick={() => handleSave(false)} disabled={isSaving || !selectedId}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: (!selectedId || isSaving) ? 0.5 : 1 }}>
                  {isSaving ? '⏳ Kaydediliyor...' : '💬 WhatsApp Gönder'}
                </button>
              </div>
            </div>
          </div>

          {/* Bekleyen Taslaklar */}
          {allDrafts.length > 0 && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>📌 Bekleyen Taslaklar</span>
                <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: 800 }}>{allDrafts.length}</span>
              </div>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {allDrafts.map((d: any) => (
                  <div key={d.id} style={{ padding: '0.75rem', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.student.firstName} {d.student.lastName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#92400E' }}>{d.topic} · {new Date(d.date).toLocaleDateString('tr-TR')}</div>
                      </div>
                      <button onClick={() => handleSendDraft(d.id, d.student.parentPhone || '', d.message)}
                        style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}>
                        Gönder
                      </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#78350F', marginTop: '0.35rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {d.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ: İletişim Geçmişi */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 Tüm İletişim Geçmişi</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{allHistory.length} mesaj</span>
          </div>
          <div style={{ maxHeight: '620px', overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {allHistory.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                <div style={{ fontWeight: 600 }}>Henüz gönderilmiş mesaj yok</div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>Sol taraftan ilk veli mesajınızı gönderin</div>
              </div>
            ) : allHistory.map((c: any) => (
              <div key={c.id} style={{ padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '9px', border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem' }}>
                      {c.student.firstName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.student.firstName} {c.student.lastName}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.student.parentName || 'Veli'} · {c.student.parentPhone || '—'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', background: '#EFF6FF', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>{c.topic}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{new Date(c.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, margin: 0 }}>
                  {c.message}
                </p>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { window.open(`https://wa.me/${(c.student.parentPhone||'').replace(/\D/g,'')}?text=${encodeURIComponent(c.message)}`, '_blank'); }}
                    style={{ padding: '0.25rem 0.6rem', borderRadius: '5px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.68rem', cursor: 'pointer' }}>
                    Tekrar Gönder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
