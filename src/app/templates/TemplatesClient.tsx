'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';

type Student = { id: string; firstName: string; lastName: string; grade: string; parentName: string | null; parentPhone: string | null; exams: { totalNet: number; name: string }[] };

// ── Şablon Veritabanı ──────────────────────────────────────────
const TEMPLATES = [
  {
    category: 'Veli Bilgilendirme',
    icon: '👨‍👩‍👧',
    color: '#2563EB',
    items: [
      {
        title: 'Haftalık Durum Özeti',
        content: `Sayın {{veli_adı}},\n\nBu hafta {{öğrenci_adı}} ile koçluk seansımızı gerçekleştirdik. {{öğrenci_adı}} öğrencimiz son denemede {{net}} net yapmıştır. Genel gidişat plana uygun seyrediyor; belirlediğimiz hedeflere yönelik programı titizlikle takip ediyoruz.\n\nEvde çalışma disiplinini koruması bu süreçte büyük önem taşımaktadır. Herhangi bir soru için ulaşabilirsiniz.\n\nSaygılarımla,\nAhmet ŞANLI — Eğitim Koçu`,
      },
      {
        title: 'Sınav Analizi Bildirimi',
        content: `Sayın {{veli_adı}},\n\n{{öğrenci_adı}}'nin son deneme sınavı sonuçlarını birlikte değerlendirdik. Sınav neti: {{net}}.\n\nBu sonuçlar doğrultusunda önümüzdeki hafta için kişiye özel çalışma programı güncellendi. Zayıf konuların pekiştirilmesi için düzenli ve odaklı çalışma kritik önem taşımaktadır.\n\nSaygılarımla,\nAhmet ŞANLI — Eğitim Koçu`,
      },
      {
        title: 'Program Güncellemesi',
        content: `Sayın {{veli_adı}},\n\n{{öğrenci_adı}}'nin bireysel gelişim programı güncellenmiştir. Mevcut performans analizi doğrultusunda optimize edilmiş yeni program uygulamaya alındı.\n\nGünlük hedeflerin takip edilmesi büyük önem taşımaktadır. Herhangi bir aksaklık durumunda lütfen benimle iletişime geçin.\n\nSaygılarımla,\nAhmet ŞANLI — Eğitim Koçu`,
      },
    ],
  },
  {
    category: 'Motivasyon Mektubu',
    icon: '🚀',
    color: '#7C3AED',
    items: [
      {
        title: 'Genel Motivasyon',
        content: `Sevgili {{öğrenci_adı}},\n\nBugün sana şunu söylemek istedim: başarı tesadüf değildir. Her gün düzenli çalışmak, zorlandığında vazgeçmemek — bunlar senin en büyük güçlerin.\n\nHedefin olan {{hedef}} için gereken her şeye sahibsin. Sana olan inancım tamdır.\n\nDevam et!\nAhmet ŞANLI`,
      },
      {
        title: 'Sınav Öncesi Moral',
        content: `Sevgili {{öğrenci_adı}},\n\nSınav günü geldi. Bugüne kadar yaptığın çalışmalar boşa gitmeyecek — bundan emin olabilirsin.\n\nSakin ol, konsantre ol ve bildiklerini yansıt. Paniklemeden, soru soru ilerle. Sen hazırsın.\n\nBaşarılar dilerim!\nAhmet ŞANLI`,
      },
      {
        title: 'Net Artışında Tebrik',
        content: `Sevgili {{öğrenci_adı}},\n\nSon denemende {{net}} net yaptın — bu ciddi bir gelişme! Emeklerinin karşılığını aldığını görmek beni çok mutlu etti.\n\nBu ivmeyi korumaya devam et. Hedefin görünür mesafede!\n\nBravo!\nAhmet ŞANLI`,
      },
    ],
  },
  {
    category: 'Seans Özeti',
    icon: '📝',
    color: '#059669',
    items: [
      {
        title: 'Standart Seans Özeti',
        content: `Sayın {{veli_adı}},\n\nBugün {{öğrenci_adı}} ile koçluk seansımızı tamamladık.\n\n📌 Bugün işlenenler: [Konu/Ders]\n✅ Alınan kararlar: [Kararlar]\n📅 Bir sonraki seans: [Tarih/Saat]\n\nSaygılarımla,\nAhmet ŞANLI — Eğitim Koçu`,
      },
      {
        title: 'Motivasyon Odaklı Seans',
        content: `Sayın {{veli_adı}},\n\nBugün {{öğrenci_adı}} ile motivasyon ve hedef odaklı bir görüşme yaptık. Sınav sürecinde zaman zaman yaşanan yorgunluk normaldir.\n\nEvde pozitif ve destekleyici bir ortam oluşturmanız bu süreçte büyük fark yaratır. Baskı yerine teşvik yaklaşımını öneririm.\n\nSaygılarımla,\nAhmet ŞANLI`,
      },
    ],
  },
  {
    category: 'Tebrik & Ödül',
    icon: '🏆',
    color: '#D97706',
    items: [
      {
        title: 'Başarılı Sınav Tebriği',
        content: `Sayın {{veli_adı}},\n\n{{öğrenci_adı}} son denemesinde {{net}} net ile harika bir performans sergiledi! Bu başarı, disiplinli çalışmanın ve aile desteğinin sonucudur.\n\nTebrikler!\n\nAhmet ŞANLI — Eğitim Koçu`,
      },
      {
        title: 'Program Tamamlama Tebriği',
        content: `Sayın {{veli_adı}},\n\n{{öğrenci_adı}} bu haftaki programını eksiksiz tamamladı! Bu disiplin ve azim, hedeflere ulaşmanın temel taşıdır.\n\nBu başarıyı birlikte kutlayalım!\n\nAhmet ŞANLI — Eğitim Koçu`,
      },
    ],
  },
  {
    category: 'Uyarı & Takip',
    icon: '⚠️',
    color: '#EF4444',
    items: [
      {
        title: 'Program Aksaması Uyarısı',
        content: `Sayın {{veli_adı}},\n\nBu hafta {{öğrenci_adı}}'nin çalışma programında aksamalar tespit ettim. Planlanan görevlerin tamamlanma oranı hedefin altında kaldı.\n\nEvdeki çalışma saatlerini birlikte gözden geçirmenizi öneririm. Süreklilik, başarının olmazsa olmazıdır.\n\nSaygılarımla,\nAhmet ŞANLI`,
      },
      {
        title: 'Seans Hatırlatması',
        content: `Sayın {{veli_adı}},\n\n{{öğrenci_adı}} ile bu hafta henüz seans yapamadık. Seans sürekliliğinin koçluk sürecindeki etkinliği doğrudan etkilediğini hatırlatmak isterim.\n\nMüsait olduğunuz bir zamanı belirtirseniz randevu ayarlayabiliriz.\n\nSaygılarımla,\nAhmet ŞANLI`,
      },
    ],
  },
  {
    category: 'Sınav Stratejisi',
    icon: '🎯',
    color: '#0EA5E9',
    items: [
      {
        title: 'LGS Son Sprint Bildirimi',
        content: `Sayın {{veli_adı}},\n\n{{öğrenci_adı}} ile LGS'ye yönelik son sprint planını oluşturduk. Kalan sürede yoğunluğu artırırken stresi minimize edecek bir denge kurmayı hedefliyoruz.\n\nSınav günü saatinde uyanma ve beslenme düzenine özellikle dikkat edilmesini rica ederim.\n\nSaygılarımla,\nAhmet ŞANLI — Eğitim Koçu`,
      },
      {
        title: 'Sınav Günü Sabahı',
        content: `Sayın {{veli_adı}},\n\nBugün {{öğrenci_adı}} için büyük gün. Lütfen sabah kahvaltısını tam yaptırın, zamanında yola çıkın ve pozitif bir enerjiyle uğurlayın.\n\n"Hazırsın, yapabilirsin!" — bu mesajı {{öğrenci_adı}}'ye iletir misiniz?\n\nBaşarılar!\nAhmet ŞANLI`,
      },
    ],
  },
];

// Değişken doldur
function fillTemplate(content: string, student: Student | null, coachName = 'Ahmet ŞANLI'): string {
  if (!student) return content;
  const lastNet = student.exams[0]?.totalNet?.toFixed(1) ?? '—';
  return content
    .replace(/{{öğrenci_adı}}/g, student.firstName)
    .replace(/{{veli_adı}}/g, student.parentName || 'Velimiz')
    .replace(/{{net}}/g, lastNet)
    .replace(/{{hedef}}/g, 'hedef okulun')
    .replace(/{{sınıf}}/g, student.grade)
    .replace(/{{koç_adı}}/g, coachName);
}

export default function TemplatesClient({ students }: { students: Student[] }) {
  const [selectedCategory, setSelectedCategory] = useState(TEMPLATES[0].category);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].items[0]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const student = students.find(s => s.id === selectedStudentId) || null;
  const filledContent = editedContent || fillTemplate(selectedTemplate.content, student);

  const handleSelectTemplate = (item: typeof TEMPLATES[0]['items'][0]) => {
    setSelectedTemplate(item);
    setEditedContent('');
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(filledContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const phone = (student?.parentPhone || '').replace(/\D/g, '');
    if (!phone) { alert('Önce öğrenci seçin veya veli telefonu girilmemiş.'); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(filledContent)}`, '_blank');
  };

  const activeCategory = TEMPLATES.find(t => t.category === selectedCategory)!;

  return (
    <div style={{ maxWidth: '1200px', width: '100%' }}>
      <PageHeader title="Şablon Kütüphanesi" subtitle="Hazır mesaj şablonları — öğrenci seçin, özelleştirin, gönderin"
        breadcrumb={['Ana Sayfa', 'Şablonlar']} />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem' }}>

        {/* Sol: Kategori + Şablon Listesi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {TEMPLATES.map(cat => (
            <div key={cat.category}>
              <button onClick={() => setSelectedCategory(cat.category)}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: selectedCategory === cat.category ? 800 : 600, fontSize: '0.82rem', cursor: 'pointer', background: selectedCategory === cat.category ? cat.color + '15' : 'white', color: selectedCategory === cat.category ? cat.color : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s' }}>
                <span>{cat.icon}</span>{cat.category}
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'var(--bg-main)', padding: '0.05rem 0.35rem', borderRadius: '10px' }}>{cat.items.length}</span>
              </button>
              {selectedCategory === cat.category && (
                <div style={{ marginTop: '0.25rem', marginLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {cat.items.map(item => (
                    <button key={item.title} onClick={() => handleSelectTemplate(item)}
                      style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', textAlign: 'left', fontSize: '0.75rem', fontWeight: selectedTemplate.title === item.title ? 700 : 500, cursor: 'pointer', background: selectedTemplate.title === item.title ? cat.color + '20' : 'none', color: selectedTemplate.title === item.title ? cat.color : 'var(--text-secondary)' }}>
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sağ: Düzenleme Alanı */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Araç çubuğu */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{selectedTemplate.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeCategory.icon} {activeCategory.category}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <select value={selectedStudentId} onChange={e => { setSelectedStudentId(e.target.value); setEditedContent(''); }}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '0.82rem', outline: 'none', background: 'white', minWidth: '180px' }}>
                <option value="">Öğrenci seçin (opsiyonel)</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
          </div>

          {/* Değişkenler */}
          {selectedStudentId && student && (
            <div style={{ padding: '0.6rem 1.25rem', background: '#EFF6FF', borderBottom: '1px solid #BFDBFE', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
              <span style={{ color: '#1E3A8A', fontWeight: 600 }}>✅ Dolduruldu:</span>
              {[
                { k: '{{öğrenci_adı}}', v: student.firstName },
                { k: '{{veli_adı}}', v: student.parentName || '—' },
                { k: '{{net}}', v: student.exams[0]?.totalNet?.toFixed(1) ?? '—' },
              ].map(x => (
                <span key={x.k} style={{ color: '#2563EB' }}><strong>{x.k}</strong> → {x.v}</span>
              ))}
            </div>
          )}

          {/* Metin alanı */}
          <textarea
            value={editedContent || filledContent}
            onChange={e => setEditedContent(e.target.value)}
            rows={16}
            style={{ width: '100%', padding: '1.25rem', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: 1.75, resize: 'vertical', color: 'var(--text-primary)' }}
          />

          {/* Alt butonlar */}
          <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <button onClick={() => setEditedContent('')} style={{ padding: '0.45rem 0.85rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              🔄 Sıfırla
            </button>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={handleCopy} style={{ padding: '0.5rem 1.1rem', borderRadius: '7px', border: '1px solid var(--border)', background: copied ? '#F0FDF4' : 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', color: copied ? '#059669' : 'var(--text-primary)' }}>
                {copied ? '✅ Kopyalandı' : '📋 Kopyala'}
              </button>
              <button onClick={handleWhatsApp} style={{ padding: '0.5rem 1.25rem', borderRadius: '7px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                💬 WhatsApp'ta Gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
