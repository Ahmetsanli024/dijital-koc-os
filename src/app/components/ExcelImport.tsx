'use client';
import { useState, useTransition } from 'react';

interface Props {
  students: { id: string; firstName: string; lastName: string }[];
  onImported: (count: number) => void;
}

export default function ExcelImport({ students, onImported }: Props) {
  const [rows, setRows]           = useState<any[]>([]);
  const [preview, setPreview]     = useState(false);
  const [isPending, start]        = useTransition();
  const [msg, setMsg]             = useState('');
  const [matchedStudent, setMatchedStudent] = useState('');

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      const XLSX = await import('xlsx');
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf);
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length < 2) { showMsg('Excel dosyası boş görünüyor.'); return; }

      // Başlıklar: 1. satır
      const headers = data[0].map((h: any) => String(h).toLowerCase().trim());
      const parsed  = data.slice(1).filter(row => row.some(Boolean)).map(row => {
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
        return obj;
      });

      setRows(parsed);
      setPreview(true);
      showMsg(`${parsed.length} satır okundu. Aşağıdan kontrol edip kaydedin.`);
    } catch (err) {
      showMsg('Excel okunamadı. .xlsx formatında olduğundan emin olun.');
    }
  };

  const handleSave = () => {
    if (!matchedStudent) { showMsg('Öğrenci seçmediniz.'); return; }
    start(async () => {
      let saved = 0;
      for (const row of rows) {
        // Esnek alan eşleşmesi
        const title   = row['konu'] || row['başlık'] || row['title'] || row['seans konusu'] || 'Görüşme';
        const content = row['not'] || row['içerik'] || row['notlar'] || row['content'] || row['yapılanlar'] || '';
        const dateRaw = row['tarih'] || row['date'] || row['seans tarihi'] || '';

        if (!content && !title) continue;

        const dateObj = dateRaw ? new Date(dateRaw) : new Date();

        await fetch('/api/sessions-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: matchedStudent, title, content, date: dateObj.toISOString() }),
        });
        saved++;
      }
      setRows([]);
      setPreview(false);
      onImported(saved);
      showMsg(`✅ ${saved} seans kaydı aktarıldı!`);
    });
  };

  // Örnek Excel şablonu indir
  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const data = [
      ['tarih', 'konu', 'yapılanlar', 'motivasyon', 'not'],
      ['01.06.2025', 'Motivasyon Görüşmesi', 'Öğrenciyle sınav strateji konuşuldu.', '8', 'İyi görüşme'],
      ['08.06.2025', 'Program Değerlendirme', 'Haftalık program güncellendi.', '7', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Seanslar');
    XLSX.writeFile(wb, 'seans_sablonu.xlsx');
  };

  return (
    <div style={{ background: 'white', border: '1.5px solid #D97706', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
      {msg && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: msg.startsWith('✅') ? '#10B981' : '#F59E0B', color: 'white', fontWeight: 700 }}>{msg}</div>}

      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#D97706' }}>📊 Excel'den Seans Aktar</div>
        <button onClick={downloadTemplate} style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #D97706', background: '#FFFBEB', color: '#D97706', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
          📥 Şablon İndir
        </button>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Excel dosyasında şu sütunlar olmalı: <strong>tarih, konu, yapılanlar/not</strong>. Önce şablonu indirin, doldurun, ardından yükleyin.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Öğrenci Seçin</label>
            <select value={matchedStudent} onChange={e => setMatchedStudent(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)' }}>
              <option value="">— Seçin —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Excel Dosyası</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #D97706', background: '#FFFBEB', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#D97706' }}>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: 'none' }} />
              📂 Excel Seç
            </label>
          </div>
        </div>

        {preview && rows.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem' }}>Önizleme ({rows.length} satır):</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {Object.keys(rows[0]).slice(0, 5).map(h => (
                      <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid var(--border)', textTransform: 'uppercase', fontSize: '0.68rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {Object.values(row).slice(0, 5).map((v: any, j) => (
                        <td key={j} style={{ padding: '0.4rem 0.6rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 5 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>...ve {rows.length - 5} satır daha</div>}

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setRows([]); setPreview(false); }} style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}>İptal</button>
              <button onClick={handleSave} disabled={isPending || !matchedStudent}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '7px', border: 'none', background: '#D97706', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: !matchedStudent ? 0.5 : 1 }}>
                {isPending ? '⏳ Aktarılıyor...' : `✅ ${rows.length} Seansı Kaydet`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
