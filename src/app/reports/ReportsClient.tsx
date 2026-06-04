'use client';
import { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';

type Student = {
  id: string; firstName: string; lastName: string; grade: string;
  target: string | null; targetSchool: string | null; parentName: string | null;
  exams: any[]; sessions: any[]; psychoRecords: any[]; schedules: any[];
};

export default function ReportsClient({ students }: { students: Student[] }) {
  const [selectedId, setSelectedId] = useState('');
  const [period, setPeriod]         = useState('monthly');
  const [isGenerating, setGenerating]= useState(false);

  const student = students.find(s => s.id === selectedId);

  // ── Hesaplamalar ──────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!student) return null;
    const exams = student.exams;
    const sessions = student.sessions;

    // Net trendi
    const lastNet  = exams[0]?.totalNet || 0;
    const firstNet = exams[exams.length - 1]?.totalNet || 0;
    const netChange = lastNet - firstNet;

    // Seans sayısı
    const sessionCount = sessions.length;

    // Ortalama psikoloji
    const psychoAvg = student.psychoRecords.length
      ? {
          motivation: (student.psychoRecords.reduce((a: number, r: any) => a + r.motivationLevel, 0) / student.psychoRecords.length).toFixed(1),
          anxiety:    (student.psychoRecords.reduce((a: number, r: any) => a + r.anxietyLevel,    0) / student.psychoRecords.length).toFixed(1),
          focus:      (student.psychoRecords.reduce((a: number, r: any) => a + r.focusLevel,      0) / student.psychoRecords.length).toFixed(1),
        }
      : null;

    // Program tamamlanma
    const allTasks = student.schedules.flatMap((s: any) => s.tasks || []);
    const progPct  = allTasks.length > 0
      ? Math.round((allTasks.filter((t: any) => t.isCompleted).length / allTasks.length) * 100)
      : null;

    // Kronik zayıf konular
    const weakTopics: string[] = [];
    exams.slice(0, 3).forEach((e: any) => {
      if (e.subjectDetails && e.subjectDetails !== '[]') {
        try {
          JSON.parse(e.subjectDetails).forEach((sub: any) => {
            (sub.topics || []).filter((t: any) => (t.incorrect || 0) > 0).forEach((t: any) => {
              if (!weakTopics.includes(`${sub.name} — ${t.name}`)) weakTopics.push(`${sub.name} — ${t.name}`);
            });
          });
        } catch {}
      }
    });

    // Net tablosu (son 5 sınav)
    const netTable = exams.slice(0, 5).reverse().map((e: any) => ({
      name: e.name,
      date: new Date(e.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      net: e.totalNet,
    }));

    return { lastNet, firstNet, netChange, sessionCount, psychoAvg, progPct, weakTopics: weakTopics.slice(0, 6), netTable };
  }, [student]);

  // ── Dönem Sonu Karne PDF ─────────────────────────────────────
  const handleTermKarne = () => {
    if (!student || !stats) return;
    const s    = student;
    const st   = stats;
    const html = `<html><head><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#111;font-size:12px;line-height:1.6}
      .page{padding:32px;max-width:780px;margin:0 auto}
      /* Header */
      .karne-header{background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:24px 32px;color:white;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0}
      .karne-title{font-size:22px;font-weight:900;letter-spacing:-0.5px}
      .karne-sub{font-size:12px;opacity:0.8;margin-top:4px}
      .karne-logo{text-align:right;font-size:13px;opacity:0.85}
      /* Öğrenci Bilgileri */
      .student-bar{background:#F8FAFC;border-bottom:2px solid #E2E8F0;padding:16px 32px;display:flex;gap:40px;font-size:12px}
      .student-bar strong{display:block;font-size:14px;font-weight:800;color:#1E3A8A;margin-bottom:2px}
      /* Sections */
      .section{padding:20px 32px;border-bottom:1px solid #E2E8F0}
      .section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:12px;display:flex;align-items:center;gap:6px}
      /* Metrik Kartlar */
      .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:0}
      .metric-card{border:1px solid #E2E8F0;border-radius:10px;padding:14px;text-align:center}
      .metric-val{font-size:24px;font-weight:900;color:#1E3A8A;line-height:1}
      .metric-lbl{font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:.05em;margin-top:4px}
      .metric-sub{font-size:11px;color:#94A3B8;margin-top:2px}
      /* Sınav Tablosu */
      table{width:100%;border-collapse:collapse;font-size:11px}
      th,td{border:1px solid #E2E8F0;padding:7px 10px;text-align:left}
      th{background:#F8FAFC;font-weight:800;color:#374151;text-transform:uppercase;font-size:10px;letter-spacing:.04em}
      tr:nth-child(even){background:#F8FAFC}
      /* Barlar */
      .bar-wrap{height:6px;background:#E2E8F0;border-radius:3px;overflow:hidden;margin-top:4px}
      .bar{height:100%;border-radius:3px}
      /* Konu etiketi */
      .topic-tag{display:inline-block;background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:10px;margin:2px;font-size:10px;font-weight:700}
      /* İmza */
      .signature-section{display:flex;justify-content:space-between;padding:20px 32px;border-top:2px solid #1E3A8A;margin-top:0}
      .sig-box{text-align:center;width:220px}
      .sig-line{border-bottom:1px dotted #94A3B8;margin-bottom:8px;height:32px}
      .sig-name{font-weight:800;font-size:12px}
      .sig-title{font-size:10px;color:#64748B}
      @media print{body{padding:0}@page{margin:10mm}}
    </style></head><body>
    <div class="karne-header">
      <div><div class="karne-title">Dönem Sonu Karne</div><div class="karne-sub">Koçluk Süreci Değerlendirme Raporu</div></div>
      <div class="karne-logo">Ahmet ŞANLI<br>Eğitim Koçu<br>${new Date().toLocaleDateString('tr-TR')}</div>
    </div>
    <div class="student-bar">
      <div><strong>${s.firstName} ${s.lastName}</strong>Sınıf: ${s.grade}</div>
      <div><strong>Hedef</strong>${s.targetSchool || s.target || '—'}</div>
      <div><strong>Veli</strong>${s.parentName || '—'}</div>
      <div><strong>Rapor Tarihi</strong>${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>

    <div class="section">
      <div class="section-title">📊 Dönem Özet Göstergeleri</div>
      <div class="metrics">
        <div class="metric-card"><div class="metric-val">${st.lastNet || '—'}</div><div class="metric-lbl">Son Net</div><div class="metric-sub">${st.netChange > 0 ? '▲ +' : '▼ '}${st.netChange.toFixed(1)} değişim</div></div>
        <div class="metric-card"><div class="metric-val">${st.firstNet || '—'}</div><div class="metric-lbl">Başlangıç Neti</div><div class="metric-sub">İlk sınav</div></div>
        <div class="metric-card"><div class="metric-val">${st.sessionCount}</div><div class="metric-lbl">Koçluk Seansı</div><div class="metric-sub">Gerçekleşti</div></div>
        <div class="metric-card"><div class="metric-val">${st.progPct !== null ? '%' + st.progPct : '—'}</div><div class="metric-lbl">Program Uyum</div><div class="metric-sub">Ortalama tamamlama</div></div>
      </div>
    </div>

    ${st.netTable.length > 0 ? `
    <div class="section">
      <div class="section-title">📈 Deneme Sınavı Seyri</div>
      <table><thead><tr><th>Sınav Adı</th><th>Tarih</th><th>Net</th><th>Değişim</th><th>Durum</th></tr></thead>
      <tbody>${st.netTable.map((e: any, i: number, arr: any[]) => {
        const prev = arr[i - 1];
        const diff = prev ? +(e.net - prev.net).toFixed(1) : null;
        const color = diff === null ? '#64748B' : diff > 0 ? '#059669' : '#DC2626';
        return `<tr><td><strong>${e.name}</strong></td><td>${e.date}</td><td style="font-weight:800;color:#1E3A8A;font-size:14px">${e.net}</td>
        <td style="color:${color};font-weight:800">${diff !== null ? (diff > 0 ? '+' : '') + diff : '—'}</td>
        <td style="color:${color}">${diff !== null ? (diff > 0 ? '▲ Yükseliş' : '▼ Düşüş') : 'İlk Sınav'}</td></tr>`;
      }).join('')}</tbody></table>
    </div>` : ''}

    ${st.psychoAvg ? `
    <div class="section">
      <div class="section-title">🧠 Psikolojik Süreç Özeti</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${[
          { label: 'Motivasyon', val: st.psychoAvg.motivation, color: '#10B981' },
          { label: 'Odak', val: st.psychoAvg.focus, color: '#3B82F6' },
          { label: 'Kaygı Düzeyi', val: st.psychoAvg.anxiety, color: '#F59E0B' },
        ].map(m => `<div style="border:1px solid #E2E8F0;border-radius:8px;padding:12px">
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:6px"><span>${m.label}</span><span style="color:${m.color}">${m.val}/10</span></div>
          <div class="bar-wrap"><div class="bar" style="width:${Number(m.val) * 10}%;background:${m.color}"></div></div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    ${st.weakTopics.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Çalışılması Gereken Alanlar</div>
      <div>${st.weakTopics.map((t: string) => `<span class="topic-tag">${t}</span>`).join('')}</div>
    </div>` : ''}

    <div class="section">
      <div class="section-title">📋 Koç Değerlendirmesi & Önümüzdeki Dönem Planı</div>
      <table><thead><tr><th>Alan</th><th>Değerlendirme</th><th>Öneri</th></tr></thead><tbody>
        <tr><td>Akademik Gelişim</td><td>${st.netChange > 2 ? '✅ Olumlu' : st.netChange < -2 ? '⚠️ Gerileyen' : 'Stabil'}</td><td>${st.netChange > 2 ? 'Mevcut programı sürdürün' : 'Program güçlendirilmeli'}</td></tr>
        <tr><td>Program Uyumu</td><td>${st.progPct === null ? 'Veri yok' : st.progPct >= 70 ? '✅ Yüksek' : st.progPct >= 40 ? '⚠️ Orta' : '❌ Düşük'}</td><td>${st.progPct === null ? 'Program oluşturulmalı' : st.progPct >= 70 ? 'Devam et' : 'Günlük takip artırılmalı'}</td></tr>
        <tr><td>Öncelikli Konu</td><td colspan="2">${st.weakTopics[0] || 'Detaylı analiz için sınav yükleyin'}</td></tr>
      </tbody></table>
    </div>

    <div class="signature-section">
      <div class="sig-box"><div class="sig-line"></div><div class="sig-name">${s.firstName} ${s.lastName}</div><div class="sig-title">Öğrenci</div></div>
      <div class="sig-box"><div class="sig-line"></div><div class="sig-name">${s.parentName || 'Veli'}</div><div class="sig-title">Veli</div></div>
      <div class="sig-box"><div class="sig-line"></div><div class="sig-name">Ahmet ŞANLI</div><div class="sig-title">Eğitim Koçu</div></div>
    </div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`;
    const w = window.open('', '_blank');
    w?.document.write(html);
    w?.document.close();
    setGenerating(false);
  };

  const handlePrint = () => {
    if (!student || !stats) return;
    setGenerating(true);
    const periodLabel = period === 'monthly' ? 'Aylık' : period === 'quarterly' ? 'Dönemlik' : 'Genel';

    const html = `<html><head><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;color:#111;font-size:13px;line-height:1.6}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1E3A8A;padding-bottom:16px;margin-bottom:24px}
      .title{font-size:20px;font-weight:900;color:#1E3A8A}
      .sub{font-size:12px;color:#666;margin-top:4px}
      .logo{text-align:right;font-size:12px;color:#666}
      .logo strong{display:block;font-size:14px;color:#111}
      .section{margin-bottom:24px}
      .section-title{font-size:13px;font-weight:800;color:#1E3A8A;text-transform:uppercase;letter-spacing:.06em;border-left:3px solid #1E3A8A;padding-left:8px;margin-bottom:10px}
      .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
      .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .card{border:1px solid #E2E8F0;border-radius:8px;padding:12px;text-align:center}
      .card .val{font-size:24px;font-weight:900;color:#1E3A8A}
      .card .lbl{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.05em;margin-top:2px}
      .card .sub-val{font-size:12px;color:#666;margin-top:2px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #E2E8F0;padding:7px 10px;text-align:left}
      th{background:#F8FAFC;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
      .up{color:#10B981;font-weight:700} .down{color:#EF4444;font-weight:700} .flat{color:#94A3B8}
      .tag{display:inline-block;padding:2px 8px;border-radius:12px;background:#FEF3C7;color:#92400E;font-size:10px;font-weight:700;margin:2px}
      .footer{margin-top:40px;border-top:1px solid #E2E8F0;padding-top:12px;display:flex;justify-content:space-between;font-size:10px;color:#999}
      .psych-bar{height:6px;background:#E2E8F0;border-radius:3px;overflow:hidden;margin-top:4px}
      .psych-bar-inner{height:100%;border-radius:3px}
    </style></head><body>
      <div class="header">
        <div>
          <div class="title">${periodLabel} Gelişim Raporu</div>
          <div class="sub">Öğrenci: <strong>${student.firstName} ${student.lastName}</strong> &nbsp;·&nbsp; Sınıf: ${student.grade} &nbsp;·&nbsp; Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
          ${student.parentName ? `<div class="sub">Veli: ${student.parentName}</div>` : ''}
        </div>
        <div class="logo">
          <strong>Ahmet ŞANLI</strong>
          Eğitim Koçu &amp; Danışmanı
        </div>
      </div>

      <!-- Özet Metrikler -->
      <div class="section">
        <div class="section-title">Özet Göstergeler</div>
        <div class="grid-4">
          <div class="card"><div class="val">${stats.lastNet || '—'}</div><div class="lbl">Son Deneme Neti</div></div>
          <div class="card"><div class="val ${stats.netChange > 0 ? 'up' : stats.netChange < 0 ? 'down' : 'flat'}">${stats.netChange > 0 ? '+' : ''}${stats.netChange.toFixed(1)}</div><div class="lbl">Net Değişimi</div><div class="sub-val">${stats.firstNet} → ${stats.lastNet}</div></div>
          <div class="card"><div class="val">${stats.sessionCount}</div><div class="lbl">Koçluk Seansı</div></div>
          <div class="card"><div class="val">${stats.progPct !== null ? `%${stats.progPct}` : '—'}</div><div class="lbl">Program Tamamlama</div></div>
        </div>
      </div>

      <!-- Net Tablosu -->
      ${stats.netTable.length > 0 ? `
      <div class="section">
        <div class="section-title">Deneme Sınavı Gelişimi</div>
        <table><thead><tr><th>Sınav</th><th>Tarih</th><th>Net</th><th>Durum</th></tr></thead>
        <tbody>${stats.netTable.map((e: any, i: number, arr: any[]) => {
          const prev = arr[i-1];
          const diff = prev ? (e.net - prev.net).toFixed(1) : null;
          const cls  = diff === null ? 'flat' : Number(diff) > 0 ? 'up' : Number(diff) < 0 ? 'down' : 'flat';
          return `<tr><td>${e.name}</td><td>${e.date}</td><td style="font-weight:700">${e.net}</td><td class="${cls}">${diff !== null ? (Number(diff)>0?'+':'')+diff : '—'}</td></tr>`;
        }).join('')}</tbody></table>
      </div>` : ''}

      <!-- Psikolojik Değerlendirme -->
      ${stats.psychoAvg ? `
      <div class="section">
        <div class="section-title">Psikolojik &amp; Motivasyon Değerlendirmesi</div>
        <div class="grid-2">
          ${[
            {label:'Motivasyon', val: stats.psychoAvg.motivation, color:'#10B981'},
            {label:'Odak',       val: stats.psychoAvg.focus,      color:'#3B82F6'},
            {label:'Kaygı Düzeyi',val:stats.psychoAvg.anxiety,   color:'#F59E0B'},
          ].map(m => `<div class="card" style="text-align:left">
            <div style="display:flex;justify-content:space-between"><span style="font-size:11px;font-weight:700;color:#666">${m.label}</span><span style="font-weight:900;font-size:16px;color:${m.color}">${m.val}/10</span></div>
            <div class="psych-bar"><div class="psych-bar-inner" style="width:${Number(m.val)*10}%;background:${m.color}"></div></div>
          </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Zayıf Konular -->
      ${stats.weakTopics.length > 0 ? `
      <div class="section">
        <div class="section-title">Tespit Edilen Eksik Alanlar</div>
        <div>${stats.weakTopics.map((t: string) => `<span class="tag">${t}</span>`).join('')}</div>
      </div>` : ''}

      <!-- Tavsiyeler -->
      <div class="section">
        <div class="section-title">Koç Değerlendirmesi &amp; Öneriler</div>
        <table><thead><tr><th>Alan</th><th>Değerlendirme</th></tr></thead><tbody>
          <tr><td>Genel Seyir</td><td>${stats.netChange > 2 ? '✅ Olumlu ilerleme — mevcut programı sürdürün' : stats.netChange < -2 ? '⚠️ Düşüş eğilimi — program güncellenmeli' : 'Stabil seyir — ivme için yoğunluk artırın'}</td></tr>
          <tr><td>Program Uyumu</td><td>${stats.progPct === null ? 'Aktif program yok — haftalık program oluşturulmalı' : stats.progPct >= 70 ? '✅ Yüksek uyum — disiplin sürsün' : stats.progPct >= 40 ? '⚠️ Orta uyum — günlük takip artırılmalı' : '❌ Düşük uyum — öncelikle motivasyon desteği'}</td></tr>
          <tr><td>Öncelikli Konu</td><td>${stats.weakTopics[0] || 'Ayrıntılı konu verisi için sınav karnesi yükleyin'}</td></tr>
        </tbody></table>
      </div>

      <div class="footer">
        <div>Bu rapor ${new Date().toLocaleDateString('tr-TR')} tarihinde koçluk danışmanlığı kapsamında hazırlanmıştır.</div>
        <div>Ahmet ŞANLI — Eğitim Koçu &amp; Danışmanı</div>
      </div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`;

    const w = window.open('', '_blank');
    w?.document.write(html);
    w?.document.close();
    setGenerating(false);
  };

  return (
    <div style={{ maxWidth: '1100px', width: '100%' }}>
      <PageHeader
        title="Gelişim Raporları"
        subtitle="Öğrenci bazlı dönemsel gelişim raporu oluşturun ve veliye gönderin"
        breadcrumb={['Ana Sayfa', 'Gelişim Raporları']}
        actions={[
          { label: '📋 Dönem Sonu Karne', variant: 'secondary', onClick: handleTermKarne },
          { label: isGenerating ? '⏳...' : '🖨️ Aylık Rapor', variant: 'primary', onClick: handlePrint },
        ]}
      />

      {/* Parametreler */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Öğrenci</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)' }}>
              <option value="">— Öğrenci seçin —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Rapor Dönemi</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[{ v: 'monthly', l: 'Aylık' }, { v: 'quarterly', l: 'Dönemlik' }, { v: 'full', l: 'Genel' }].map(p => (
                <button key={p.v} onClick={() => setPeriod(p.v)}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    background: period === p.v ? 'var(--primary)' : 'var(--bg-main)',
                    color: period === p.v ? 'white' : 'var(--text-secondary)' }}>
                  {p.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {student && stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Özet Metrik Kartları */}
          {[
            { label: 'Son Net', value: stats.lastNet || '—', sub: stats.exams?.[0]?.name || '', color: '#2563EB' },
            { label: 'Net Değişimi', value: `${stats.netChange > 0 ? '+' : ''}${stats.netChange.toFixed(1)}`, sub: `${stats.firstNet} → ${stats.lastNet}`, color: stats.netChange > 0 ? '#10B981' : '#EF4444' },
            { label: 'Seans Sayısı', value: stats.sessionCount, sub: 'Toplam yapılan', color: '#7C3AED' },
            { label: 'Program', value: stats.progPct !== null ? `%${stats.progPct}` : '—', sub: 'Tamamlanma oranı', color: '#059669' },
            { label: 'Ort. Motivasyon', value: stats.psychoAvg?.motivation || '—', sub: '/ 10', color: '#F59E0B' },
            { label: 'Toplam Sınav', value: student.exams.length, sub: 'Analiz edildi', color: '#0EA5E9' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.1rem 1.25rem', borderTop: `3px solid ${m.color}` }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: m.color, lineHeight: 1.1, marginTop: '0.2rem' }}>{m.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Öğrenci Seçin</h3>
          <p style={{ fontSize: '0.88rem' }}>Rapor oluşturmak için üstten bir öğrenci seçin. PDF olarak yazdırabilir veya WhatsApp'tan veliye gönderebilirsiniz.</p>
        </div>
      )}

      {student && stats && stats.netTable.length > 0 && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem' }}>📊 Deneme Sınavı Geçmişi</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Sınav Adı', 'Tarih', 'Net', 'Değişim'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.netTable.map((e: any, i: number, arr: any[]) => {
                const prev = arr[i - 1];
                const diff = prev ? +(e.net - prev.net).toFixed(1) : null;
                const dColor = diff === null ? '#94A3B8' : diff > 0 ? '#10B981' : '#EF4444';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{e.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{e.date}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{e.net}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: dColor }}>{diff !== null ? `${diff > 0 ? '+' : ''}${diff}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
