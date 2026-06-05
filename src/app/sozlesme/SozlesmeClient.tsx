'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';

type Student = { id: string; firstName: string; lastName: string; grade: string; parentName: string | null; parentPhone: string | null; target: string | null; targetSchool: string | null };
type Settings = { coachName: string; coachTitle: string; phone: string | null; sessionFee: number; sessionDuration: number } | null;

export default function SozlesmeClient({ students, settings }: { students: Student[]; settings: Settings }) {
  const coachName  = settings?.coachName  || 'Ahmet ŞANLI';
  const coachTitle = settings?.coachTitle || 'Rehber Öğretmen';
  const sessionFee = settings?.sessionFee || 0;
  const sessionDur = settings?.sessionDuration || 45;

  const [selectedId, setSelectedId]     = useState('');
  const [startDate, setStartDate]       = useState(new Date().toISOString().split('T')[0]);
  const [totalSessions, setTotalSessions] = useState(36);
  const [customFee, setCustomFee]       = useState(String(sessionFee));
  const [paymentDay, setPaymentDay]     = useState('Her ayın 1\'i');
  const [extraTerms, setExtraTerms]     = useState('');

  const student = students.find(s => s.id === selectedId);

  const handlePrint = () => {
    if (!student) { alert('Öğrenci seçin.'); return; }
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Math.ceil(totalSessions / 4));

    const html = `<html><head><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Times New Roman',serif;padding:50px 60px;color:#111;font-size:12.5px;line-height:1.8}
      h1{text-align:center;font-size:18px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
      .subtitle{text-align:center;font-size:12px;color:#555;margin-bottom:30px}
      .divider{border:none;border-top:2px solid #111;margin:20px 0}
      .parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;padding:16px;border:1px solid #ccc;background:#f9f9f9}
      .party-title{font-weight:bold;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;color:#1E3A8A}
      .party-row{font-size:12px;margin-bottom:3px}
      h2{font-size:13px;font-weight:bold;margin:20px 0 8px;text-decoration:underline;text-transform:uppercase;letter-spacing:.05em}
      .article{margin-bottom:12px;text-align:justify}
      .article-num{font-weight:bold}
      .highlight{background:#FEF3C7;padding:2px 6px;border-radius:3px;font-weight:bold}
      .sig-section{margin-top:60px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:30px;text-align:center}
      .sig-box .line{border-bottom:1px solid #333;margin-bottom:8px;height:50px}
      .sig-box .name{font-weight:bold;font-size:12px}
      .sig-box .role{font-size:10px;color:#666;margin-top:2px}
      .footer{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:10px;color:#999;text-align:center}
      @media print{body{padding:30px 40px}@page{margin:15mm}}
    </style></head><body>
      <h1>Eğitim Koçluğu Hizmet Sözleşmesi</h1>
      <div class="subtitle">Bu sözleşme, aşağıda tarafları belirtilen koçluk hizmetinin şartlarını düzenlemektedir.</div>
      <hr class="divider">

      <div class="parties">
        <div>
          <div class="party-title">Koç (Hizmet Veren)</div>
          <div class="party-row"><strong>Ad Soyad:</strong> ${coachName}</div>
          <div class="party-row"><strong>Unvan:</strong> ${coachTitle}</div>
          ${settings?.phone ? `<div class="party-row"><strong>Telefon:</strong> ${settings.phone}</div>` : ''}
        </div>
        <div>
          <div class="party-title">Öğrenci / Veli (Hizmet Alan)</div>
          <div class="party-row"><strong>Öğrenci:</strong> ${student.firstName} ${student.lastName}</div>
          <div class="party-row"><strong>Sınıf:</strong> ${student.grade}</div>
          <div class="party-row"><strong>Veli:</strong> ${student.parentName || '—'}</div>
          ${student.parentPhone ? `<div class="party-row"><strong>Telefon:</strong> ${student.parentPhone}</div>` : ''}
        </div>
      </div>

      <h2>Madde 1 — Hizmetin Kapsamı</h2>
      <div class="article">
        <span class="article-num">1.1</span> Koç; öğrenciye bireysel eğitim koçluğu, deneme sınav analizi, haftalık çalışma programı hazırlama, motivasyon desteği ve tercih danışmanlığı hizmetleri sunacaktır.
      </div>
      <div class="article">
        <span class="article-num">1.2</span> Akademik hedef: <span class="highlight">${student.targetSchool || student.target || 'Belirlendi'}</span>
      </div>

      <h2>Madde 2 — Seans Düzeni</h2>
      <div class="article">
        <span class="article-num">2.1</span> Koçluk seansları <span class="highlight">${sessionDur} dakika</span> süreli, haftada en az 1 olmak üzere taraflarca kararlaştırılan gün ve saatte gerçekleştirilecektir.
      </div>
      <div class="article">
        <span class="article-num">2.2</span> Toplam seans hedefi: <span class="highlight">${totalSessions} seans</span>. Sözleşme başlangıcı: ${new Date(startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}.
      </div>
      <div class="article">
        <span class="article-num">2.3</span> Seans iptalleri en az 24 saat önceden bildirilmelidir. Bildirilmeyen iptaller gerçekleştirilmiş sayılır.
      </div>

      <h2>Madde 3 — Ücret ve Ödeme</h2>
      <div class="article">
        <span class="article-num">3.1</span> Koçluk hizmet ücreti aylık <span class="highlight">${Number(customFee).toLocaleString('tr-TR')} ₺</span> olarak belirlenmiştir.
      </div>
      <div class="article">
        <span class="article-num">3.2</span> Ödeme tarihi: <span class="highlight">${paymentDay}</span>. Ödemeler belirtilen tarihte yapılacak; gecikmeler taraflar arasında önceden bildirilecektir.
      </div>

      <h2>Madde 4 — Tarafların Yükümlülükleri</h2>
      <div class="article">
        <span class="article-num">4.1 Koç:</span> Öğrencinin bireysel ihtiyaçlarına uygun, güncel ve bilimsel temelli koçluk hizmeti sunmayı; seans özetlerini ve haftalık programları düzenli olarak paylaşmayı kabul eder.
      </div>
      <div class="article">
        <span class="article-num">4.2 Öğrenci/Veli:</span> Koçun hazırladığı programlara sadık kalmayı; seanslara zamanında ve hazırlıklı katılmayı; ödemeleri düzenli yapmayı kabul eder.
      </div>

      ${extraTerms ? `<h2>Madde 5 — Özel Koşullar</h2><div class="article">${extraTerms}</div>` : ''}

      <h2>${extraTerms ? 'Madde 6' : 'Madde 5'} — Sözleşmenin Feshi</h2>
      <div class="article">
        Taraflardan biri sözleşmeyi feshetmek istediğinde, diğer tarafa yazılı olarak en az <span class="highlight">2 (iki) hafta</span> önceden bildirimde bulunacaktır. Fesih bildiriminden önce gerçekleştirilmiş seansların ücreti iade edilmeyecektir.
      </div>

      <div class="sig-section">
        <div class="sig-box"><div class="line"></div><div class="name">${student.firstName} ${student.lastName}</div><div class="role">Öğrenci</div></div>
        <div class="sig-box"><div class="line"></div><div class="name">${student.parentName || 'Veli'}</div><div class="role">Veli / Yasal Temsilci</div></div>
        <div class="sig-box"><div class="line"></div><div class="name">${coachName}</div><div class="role">${coachTitle}</div></div>
      </div>

      <div class="footer">Tarih: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;|&nbsp; Bu sözleşme 2 nüsha olarak düzenlenmiş ve taraflarca imzalanmıştır.</div>
      <script>window.onload=()=>window.print()</script>
    </body></html>`;
    const w = window.open('', '_blank');
    w?.document.write(html);
    w?.document.close();
  };

  const iS: React.CSSProperties = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)', fontFamily: 'inherit' };

  return (
    <div style={{ maxWidth: '780px', width: '100%' }}>
      <PageHeader title="Koçluk Sözleşmesi" subtitle="Öğrenci bilgilerini seçin, sözleşmeyi oluşturun ve imzaya sunun"
        breadcrumb={['Ana Sayfa', 'Sözleşme']}
        actions={[{ label: '🖨️ Sözleşmeyi Oluştur ve Yazdır', variant: 'primary', onClick: handlePrint }]} />

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Öğrenci */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Öğrenci *</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={iS}>
            <option value="">— Öğrenci seçin —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>)}
          </select>
          {student && (
            <div style={{ marginTop: '0.6rem', padding: '0.65rem 0.9rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '0.82rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span>👤 Veli: <strong>{student.parentName || '—'}</strong></span>
              <span>📞 {student.parentPhone || '—'}</span>
              <span>🎯 Hedef: <strong>{student.targetSchool || student.target || '—'}</strong></span>
            </div>
          )}
        </div>

        {/* Sözleşme Parametreleri */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Başlangıç Tarihi</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={iS} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Toplam Seans Hedefi</label>
            <input type="number" value={totalSessions} onChange={e => setTotalSessions(Number(e.target.value))} style={iS} min={1} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Aylık Ücret (₺)</label>
            <input type="number" value={customFee} onChange={e => setCustomFee(e.target.value)} style={iS} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Ödeme Günü</label>
            <select value={paymentDay} onChange={e => setPaymentDay(e.target.value)} style={iS}>
              {["Her ayın 1'i", "Her ayın 5'i", "Her ayın 10'u", "Her ayın 15'i", "Seans başında peşin"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Özel Koşullar */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Özel Koşullar (Opsiyonel)</label>
          <textarea value={extraTerms} onChange={e => setExtraTerms(e.target.value)} rows={3} placeholder="Ek maddeler, özel anlaşmalar..." style={{ ...iS, resize: 'vertical' }} />
        </div>

        {/* Önizleme */}
        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>📋 Sözleşme Önizleme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
            {[
              { l: 'Koç', v: coachName },
              { l: 'Öğrenci', v: student ? `${student.firstName} ${student.lastName}` : '—' },
              { l: 'Seans Süresi', v: `${sessionDur} dakika` },
              { l: 'Toplam Seans', v: `${totalSessions} seans` },
              { l: 'Aylık Ücret', v: `${Number(customFee).toLocaleString('tr-TR')} ₺` },
              { l: 'Ödeme', v: paymentDay },
            ].map(i => (
              <div key={i.l} style={{ display: 'flex', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: '100px' }}>{i.l}:</span>
                <strong>{i.v}</strong>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handlePrint} style={{ padding: '0.85rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
          🖨️ Sözleşmeyi Oluştur ve Yazdır
        </button>
      </div>
    </div>
  );
}
