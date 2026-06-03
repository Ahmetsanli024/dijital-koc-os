'use client';
import { useState, useMemo } from 'react';
import { HIGH_SCHOOLS, calculateWinProbability } from '@/lib/lgsCalculator';
import PageHeader from '../components/PageHeader';
import Link from 'next/link';

type Student = { id: string; firstName: string; lastName: string; grade: string; target: string | null; targetSchool: string | null; targetCity: string | null; targetNets: string | null; exams: { totalNet: number; name: string; date: string }[] };

const TERCIH_TYPES = [
  { key: 'ideal',    label: 'İdeal',    desc: 'En yüksek hedef — büyük çaba gerektirir',  color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'hedef',   label: 'Hedef',    desc: 'Gerçekçi ana hedef — ulaşılabilir',          color: '#2563EB', bg: '#EFF6FF' },
  { key: 'guvenli', label: 'Güvenli',  desc: 'Yüksek ihtimalle kazanılır',                 color: '#059669', bg: '#F0FDF4' },
  { key: 'yedek',   label: 'Yedek',    desc: 'Kesin sonuç garantisi için alternatif',       color: '#D97706', bg: '#FFFBEB' },
];

type TercihItem = { schoolId: string; schoolName: string; city: string; baseScore: number; probability: number; type: 'ideal' | 'hedef' | 'guvenli' | 'yedek' | 'none'; note: string };

export default function TercihClient({ students }: { students: Student[] }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [manualScore, setManualScore]             = useState<number | ''>('');
  const [cityFilter, setCityFilter]               = useState('');
  const [typeFilter, setTypeFilter]               = useState('');
  const [tercihList, setTercihList]               = useState<TercihItem[]>([]);
  const [showOnlyAdded, setShowOnlyAdded]         = useState(false);
  const [saveMsg, setSaveMsg]                     = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Tahmini puan: manual > son 3 sınavın ortalaması
  const estimatedScore = useMemo(() => {
    if (manualScore !== '') return Number(manualScore);
    if (!selectedStudent || !selectedStudent.exams.length) return null;
    const nets = selectedStudent.exams.slice(0, 3).map(e => e.totalNet);
    const avg  = nets.reduce((a, b) => a + b, 0) / nets.length;
    // Net → puana dönüşüm (kaba tahmin)
    return Math.min(500, Math.round(150 + (avg / 90) * 350));
  }, [selectedStudent, manualScore]);

  // Sıralama: olasılığa göre
  const schools = useMemo(() => {
    if (!estimatedScore) return [];
    return HIGH_SCHOOLS
      .filter(s => !cityFilter || s.city === cityFilter)
      .map(s => ({ ...s, probability: calculateWinProbability(estimatedScore, s.baseScore) }))
      .sort((a, b) => b.probability - a.probability);
  }, [estimatedScore, cityFilter]);

  const cities = Array.from(new Set(HIGH_SCHOOLS.map(s => s.city))).sort();

  const addToList = (school: typeof schools[0], type: TercihItem['type']) => {
    setTercihList(prev => {
      const existing = prev.find(t => t.schoolId === school.name);
      if (existing) return prev.map(t => t.schoolId === school.name ? { ...t, type } : t);
      return [...prev, { schoolId: school.name, schoolName: school.name, city: school.city, baseScore: school.baseScore, probability: school.probability, type, note: '' }];
    });
  };

  const removeFromList = (schoolId: string) => setTercihList(prev => prev.filter(t => t.schoolId !== schoolId));
  const updateNote = (schoolId: string, note: string) => setTercihList(prev => prev.map(t => t.schoolId === schoolId ? { ...t, note } : t));

  const probColor = (p: number) => p >= 75 ? '#10B981' : p >= 45 ? '#F59E0B' : '#EF4444';
  const probLabel = (p: number) => p >= 75 ? 'Yüksek' : p >= 45 ? 'Orta' : 'Düşük';

  const grouped = TERCIH_TYPES.reduce((acc, t) => {
    acc[t.key] = tercihList.filter(i => i.type === t.key);
    return acc;
  }, {} as Record<string, TercihItem[]>);

  const handleSave = async () => {
    if (!selectedStudentId || !tercihList.length) return;
    try {
      const res = await fetch('/api/tercih', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId, list: tercihList, estimatedScore }),
      });
      if (res.ok) { setSaveMsg('✅ Tercih listesi kaydedildi.'); setTimeout(() => setSaveMsg(''), 3000); }
    } catch { setSaveMsg('❌ Kayıt hatası.'); }
  };

  const handlePrint = () => {
    const printContent = `
      <html><head><style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 14px; font-weight: bold; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .note { color: #555; font-style: italic; }
        .footer { margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
      </style></head><body>
      <h1>Tercih Danışmanlık Raporu</h1>
      <div class="sub">
        Öğrenci: ${selectedStudent?.firstName} ${selectedStudent?.lastName} &nbsp;|&nbsp;
        Tahmini Puan: ${estimatedScore} &nbsp;|&nbsp;
        Tarih: ${new Date().toLocaleDateString('tr-TR')}
      </div>
      ${TERCIH_TYPES.map(t => {
        const items = grouped[t.key];
        if (!items?.length) return '';
        return `<div class="section">
          <h2 style="background:${t.bg};color:${t.color}">${t.label} Tercihler</h2>
          <table><tr><th>#</th><th>Okul</th><th>Şehir</th><th>Taban Puan</th><th>Kazanma İhtimali</th><th>Not</th></tr>
          ${items.map((item, i) => `<tr><td>${i+1}</td><td>${item.schoolName}</td><td>${item.city}</td><td>${item.baseScore}</td><td>${item.probability}%</td><td class="note">${item.note || ''}</td></tr>`).join('')}
          </table></div>`;
      }).join('')}
      <div class="footer">Ahmet ŞANLI — Eğitim Koçu · Bu rapor koçluk danışmanlığı kapsamında hazırlanmıştır.</div>
      <script>window.onload=()=>window.print()</script>
      </body></html>`;
    const w = window.open('', '_blank');
    w?.document.write(printContent);
    w?.document.close();
  };

  // Gösterilecek okullar
  const displayedSchools = showOnlyAdded
    ? schools.filter(s => tercihList.some(t => t.schoolId === s.name))
    : schools;

  return (
    <div style={{ maxWidth: '1280px', width: '100%' }}>
      {saveMsg && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.7rem 1.25rem', borderRadius: '8px', background: saveMsg.startsWith('✅') ? '#10B981' : '#EF4444', color: 'white', fontWeight: 700 }}>
          {saveMsg}
        </div>
      )}

      <PageHeader
        title="Tercih Danışmanlığı"
        subtitle="LGS sonrası okul eşleştirme, tercih listesi oluşturma ve risk analizi"
        breadcrumb={['Ana Sayfa', 'Tercih Danışmanlığı']}
        actions={[
          { label: '🖨️ Rapor Yazdır', variant: 'secondary', onClick: handlePrint },
          { label: '💾 Listeyi Kaydet', variant: 'primary', onClick: handleSave },
        ]}
      />

      {/* Giriş Parametreleri */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Öğrenci & Puan Ayarları</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Öğrenci</label>
            <select value={selectedStudentId} onChange={e => { setSelectedStudentId(e.target.value); setManualScore(''); setTercihList([]); }}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)' }}>
              <option value="">— Öğrenci seçin —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Tahmini Puan {estimatedScore && !manualScore && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>(otomatik: {estimatedScore})</span>}
            </label>
            <input type="number" value={manualScore} onChange={e => setManualScore(e.target.value ? Number(e.target.value) : '')}
              placeholder={estimatedScore ? String(estimatedScore) : '200 – 500'}
              min={200} max={500}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Şehir Filtresi</label>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)' }}>
              <option value="">Tüm şehirler</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Öğrenci bilgi şeridi */}
        {selectedStudent && (
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {[
              { label: 'Mevcut Hedef', value: selectedStudent.target || '—' },
              { label: 'Hedef Okul', value: selectedStudent.targetSchool || '—' },
              { label: 'Hedef Şehir', value: selectedStudent.targetCity || '—' },
              { label: 'Son Sınav', value: selectedStudent.exams[0] ? `${selectedStudent.exams[0].totalNet} net` : '—' },
              { label: 'Ort. Net (son 3)', value: selectedStudent.exams.length ? (selectedStudent.exams.slice(0,3).reduce((a,e)=>a+e.totalNet,0)/Math.min(3,selectedStudent.exams.length)).toFixed(1)+' net' : '—' },
            ].map(i => (
              <div key={i.label}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{i.label}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{i.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {estimatedScore && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem' }}>

          {/* SOL: Okul Listesi */}
          <div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.25rem', background: '#F8FAFC', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  Eşleşen Okullar <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.8rem' }}>({schools.length} okul · {estimatedScore} puan)</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showOnlyAdded} onChange={e => setShowOnlyAdded(e.target.checked)} />
                  Sadece eklenenleri göster
                </label>
              </div>
              <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0 }}>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Okul', 'Şehir', 'Taban', 'İhtimal', 'Tercih Türü'].map(h => (
                        <th key={h} style={{ padding: '0.55rem 0.85rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSchools.map((school, i) => {
                      const added = tercihList.find(t => t.schoolId === school.name);
                      const pc = school.probability;
                      return (
                        <tr key={school.name} style={{ borderBottom: '1px solid var(--border)', background: added ? '#F0F7FF' : 'white' }}>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{school.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Kontenjan: {school.quota}</div>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.82rem' }}>{school.city}</td>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.88rem' }}>{school.baseScore}</td>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div style={{ width: '40px', height: '5px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pc}%`, background: probColor(pc) }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: probColor(pc) }}>{pc}%</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: probColor(pc), fontWeight: 700 }}>{probLabel(pc)}</div>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {TERCIH_TYPES.map(t => (
                                <button key={t.key} onClick={() => addToList(school, t.key as any)}
                                  style={{ padding: '0.2rem 0.45rem', borderRadius: '5px', border: 'none', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                                    background: added?.type === t.key ? t.color : t.bg,
                                    color: added?.type === t.key ? 'white' : t.color }}>
                                  {t.label}
                                </button>
                              ))}
                              {added && (
                                <button onClick={() => removeFromList(school.name)}
                                  style={{ padding: '0.2rem 0.4rem', borderRadius: '5px', border: 'none', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: '#FEF2F2', color: '#EF4444' }}>
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {displayedSchools.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {schools.length === 0 ? 'Puanınıza uygun eşleşme bulunamadı.' : 'Henüz tercih listesine okul eklenmedi.'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SAĞ: Tercih Listesi */}
          <div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: '80px' }}>
              <div style={{ padding: '0.85rem 1.25rem', background: '#F8FAFC', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem' }}>
                📋 Tercih Listesi ({tercihList.length} okul)
              </div>

              {tercihList.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tercih listesi boş</p>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Sol taraftan okullara "Tercih Türü" atayın</p>
                </div>
              ) : (
                <div style={{ padding: '1rem' }}>
                  {TERCIH_TYPES.map(type => {
                    const items = grouped[type.key];
                    if (!items?.length) return null;
                    return (
                      <div key={type.key} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: type.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: type.color }}>{type.label} Tercihler</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{type.desc}</span>
                        </div>
                        {items.map((item, i) => (
                          <div key={item.schoolId} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0.6rem 0.75rem', background: type.bg, borderRadius: '7px', marginBottom: '0.35rem', borderLeft: `3px solid ${type.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{i+1}. {item.schoolName}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>{item.city} · {item.baseScore}</span>
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: probColor(item.probability) }}>{item.probability}%</span>
                            </div>
                            <input placeholder="Not ekle..." value={item.note} onChange={e => updateNote(item.schoolId, e.target.value)}
                              style={{ width: '100%', padding: '0.25rem 0.45rem', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.72rem', outline: 'none', background: 'rgba(255,255,255,0.7)' }} />
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {/* Risk Analizi */}
                  <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      ⚖️ Risk Analizi
                    </div>
                    {(() => {
                      const allProbs = tercihList.map(t => t.probability);
                      const highRisk = tercihList.filter(t => t.probability < 30).length;
                      const safe = tercihList.filter(t => t.probability >= 70).length;
                      const alerts = [];
                      if (highRisk > 2) alerts.push({ msg: `${highRisk} tercih çok düşük ihtimal (<30%). Risk yüksek.`, color: '#EF4444' });
                      if (safe === 0) alerts.push({ msg: 'Güvenli (>70%) tercih yok — yedek eklemeyi düşünün.', color: '#F59E0B' });
                      if (tercihList.length < 3) alerts.push({ msg: 'Tercih sayısı az. En az 3-4 okul eklenmesi önerilir.', color: '#3B82F6' });
                      if (alerts.length === 0) alerts.push({ msg: 'Liste dengeli görünüyor. ✅', color: '#10B981' });
                      return alerts.map((a, i) => (
                        <div key={i} style={{ padding: '0.45rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: a.color, background: a.color + '15', marginBottom: '0.3rem' }}>
                          {a.msg}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!estimatedScore && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Öğrenci ve Puan Seçin</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Üstteki formdan bir öğrenci seçin veya tahmini puan girin.<br />
            Sistem otomatik olarak puana uygun liseleri ve kazanma ihtimallerini gösterir.
          </p>
        </div>
      )}
    </div>
  );
}
