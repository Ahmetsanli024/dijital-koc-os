'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addExam } from '../actions/exam';
import PageHeader from '../components/PageHeader';

const EXAM_TYPES = [
  { value: 'SINGLE', label: 'Tekli Deneme Sınavı', icon: '📝', desc: 'Tek bir LGS denemesinin ayrıntılı karnesi' },
  { value: 'MERGED', label: 'Birleştirilmiş Karne (Son 5/10)', icon: '📊', desc: 'Birden çok denemenin toplu konu başarı dökümü' },
  { value: 'PRIORITY', label: 'Öncelikli Konu Analizi', icon: '🎯', desc: 'Deneme ortalamalarına dayalı öncelik raporu' },
];

export default function UploadExamClient({ students }: { students: any[] }) {
  const router = useRouter();
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examName, setExamName] = useState('');
  const [totalNet, setTotalNet] = useState('');
  const [totalCorrect, setTotalCorrect] = useState('');
  const [totalIncorrect, setTotalIncorrect] = useState('');
  const [totalBlank, setTotalBlank] = useState('');
  const [subjectDetails, setSubjectDetails] = useState('[]');
  const [rawText, setRawText] = useState('');
  const [examType, setExamType] = useState('SINGLE');
  const [errorMsg, setErrorMsg] = useState('');

  const isSingleExam = examType === 'SINGLE';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsParsing(true);
      setErrorMsg('');
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/parse-exam', {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        
        if (data.success && data.parsedData) {
          setParsedData(data.parsedData);
          
          // Sınav adı: tür bazlı varsayılan
          if (examType === 'MERGED') {
            const name = (data.parsedData.name && data.parsedData.name !== 'İsimsiz Sınav') 
              ? data.parsedData.name 
              : 'Birleştirilmiş Karne Analizi';
            setExamName(name);
          } else if (examType === 'PRIORITY') {
            const name = (data.parsedData.name && data.parsedData.name !== 'İsimsiz Sınav') 
              ? data.parsedData.name 
              : 'Öncelikli Konu Analizi';
            setExamName(name);
          } else {
            setExamName(data.parsedData.name || file.name.replace('.pdf', ''));
          }
          
          setTotalNet(String(data.parsedData.totalNet ?? 0));
          setTotalCorrect(String(data.parsedData.totalCorrect ?? 0));
          setTotalIncorrect(String(data.parsedData.totalIncorrect ?? 0));
          setTotalBlank(String(data.parsedData.totalBlank ?? 0));
          setSubjectDetails(data.parsedData.subjectDetails || '[]');
          setRawText(data.parsedData.rawText || '');
        } else {
          setErrorMsg(data.error || 'PDF okunamadı.');
        }
      } catch (err) {
        setErrorMsg('Sunucuya bağlanırken hata oluştu.');
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!selectedStudent) {
        alert('Lütfen önce aşağıdaki formdan bir öğrenci seçin.');
        e.target.value = '';
        return;
      }
      setIsParsing(true);
      setErrorMsg('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', selectedStudent);

      try {
        const res = await fetch('/api/vision-ocr', {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        
        if (data.success && data.exam) {
          alert('Sınav başarıyla eklendi! Yapay Zeka fotoğrafı okudu.');
          router.push('/students/' + selectedStudent);
        } else {
          setErrorMsg(data.error || 'Görsel okunamadı.');
        }
      } catch (err) {
        setErrorMsg('Sunucuya bağlanırken hata oluştu.');
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) { alert('Lütfen bir öğrenci seçin.'); return; }
    if (!examName.trim()) { alert('Lütfen sınav adı yazın.'); return; }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const netVal = parseFloat(String(totalNet).replace(',', '.'));
      const correctVal = parseInt(String(totalCorrect));
      const incorrectVal = parseInt(String(totalIncorrect));
      const blankVal = parseInt(String(totalBlank));

      const result = await addExam(
        selectedStudent, 
        examName.trim(), 
        Number.isFinite(netVal) ? netVal : 0,
        Number.isFinite(correctVal) ? correctVal : 0,
        Number.isFinite(incorrectVal) ? incorrectVal : 0,
        Number.isFinite(blankVal) ? blankVal : 0,
        '-',
        rawText,
        examType,
        subjectDetails
      );

      if (result && result.success) {
        resetForm();
        router.push(`/students/${selectedStudent}`);
      } else {
        setErrorMsg('Kayıt hatası: ' + (result?.error || 'Bilinmeyen hata. Lütfen tekrar deneyin.'));
      }
    } catch (err: any) {
      console.error('handleSave hatası:', err);
      setErrorMsg('Kaydetme hatası: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setParsedData(null);
    setExamName('');
    setTotalNet('');
    setTotalCorrect('');
    setTotalIncorrect('');
    setTotalBlank('');
    setSubjectDetails('[]');
    setRawText('');
    setExamType('SINGLE');
    setErrorMsg('');
  };

  return (
    <div style={{ maxWidth: '820px', width: '100%' }}>
      <PageHeader title="Deneme Analizi (AI)" subtitle="PDF karne yükle — Yapay zeka konu bazlı analizi çıkarsın, siz onaylayıp öğrenciye atayın"
        breadcrumb={['Ana Sayfa', 'Deneme Analizi']} />

      {errorMsg && (
        <div style={{ padding: '0.85rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '4px solid #EF4444', borderRadius: '8px', marginBottom: '1.25rem', color: '#991B1B', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {!parsedData ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', border: '2px dashed var(--border)', background: 'rgba(255,255,255,0.5)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>PDF Karne Türünü Seçin</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>Yükleyeceğiniz belge türünü seçtikten sonra dosyayı yükleyin.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '500px', marginBottom: '2rem' }}>
            {EXAM_TYPES.map(type => (
              <label 
                key={type.value}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', 
                  padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                  border: examType === type.value ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: examType === type.value ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-main)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                <input type="radio" name="examType" value={type.value} checked={examType === type.value} onChange={() => setExamType(type.value)} style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{type.icon} {type.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{type.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
            <label className="btn-primary" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', opacity: isParsing ? 0.7 : 1, padding: '0.85rem 2rem', fontSize: '1rem' }}>
              <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUpload} disabled={isParsing} />
              <span>{isParsing ? '⏳ Okunuyor...' : '📂 PDF Seç'}</span>
            </label>
            
            <label className="btn-secondary" style={{ flex: 1, textAlign: 'center', cursor: (!selectedStudent || isParsing) ? 'not-allowed' : 'pointer', opacity: (!selectedStudent || isParsing) ? 0.5 : 1, padding: '0.85rem 2rem', fontSize: '1rem', position: 'relative' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isParsing || !selectedStudent} />
              <span>📸 Kameradan Oku</span>
            </label>
          </div>
          {!selectedStudent && <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.5rem' }}>* Kameradan okutmak için önce aşağıdan öğrenci seçmelisiniz.</p>}
          
          <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '500px' }}>
             <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
               <option value="">-- Görsel Okuma İçin Öğrenci Seçin --</option>
               {students.map((s:any) => (
                 <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
               ))}
             </select>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid var(--primary)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>✅ PDF Okundu — Kontrol Edin</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Veriler PDF&apos;ten çekildi. Gerekirse düzenleyin ve öğrenciyi seçip kaydedin.</p>
            {!isSingleExam && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: examType === 'MERGED' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: examType === 'MERGED' ? 'rgb(139, 92, 246)' : 'rgb(217, 119, 6)', fontWeight: 600, border: examType === 'MERGED' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)' }}>
                {examType === 'MERGED' ? '📊 Birleştirilmiş Karne' : '🎯 Öncelikli Konu Analizi'} — Doğru/Yanlış/Boş/Net bilgileri bu belge türünde gerekmez
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hangi Öğrenciye Ait?</label>
            <select required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
              <option value="">-- Öğrenci Seçin --</option>
              {students.map((s:any) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sınav / Belge Adı</label>
            <input type="text" required value={examName} onChange={(e) => setExamName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
          </div>

          {isSingleExam && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.5rem' }}>Doğru</label>
                  <input type="number" value={totalCorrect} onChange={(e) => setTotalCorrect(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem' }}>Yanlış</label>
                  <input type="number" value={totalIncorrect} onChange={(e) => setTotalIncorrect(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Boş</label>
                  <input type="number" value={totalBlank} onChange={(e) => setTotalBlank(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>Net</label>
                  <input type="text" value={totalNet} onChange={(e) => setTotalNet(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: 800 }} />
                </div>
              </div>
              
              {subjectDetails && subjectDetails !== '[]' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>🧠 Yapay Zeka Ders Analizi</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Ders</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--success)' }}>Doğru</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--danger)' }}>Yanlış</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Boş</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--primary)' }}>Net</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Hatalı Konular</th>
                        </tr>
                      </thead>
                      <tbody>
                        {JSON.parse(subjectDetails).map((sub: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{sub.name}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{sub.correct}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{sub.incorrect}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{sub.blank}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800 }}>{sub.net}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--danger)', fontSize: '0.8rem' }}>
                              {sub.weakTopics ? sub.weakTopics.join(', ') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Başarı %:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {totalCorrect ? ((parseInt(totalCorrect) / 90) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={resetForm} className="btn-secondary" style={{ flex: 1 }}>← İptal</button>
            <button type="submit" disabled={isSaving} className="btn-primary" style={{ flex: 2, opacity: isSaving ? 0.7 : 1 }}>
              {isSaving ? '⏳ Kaydediliyor...' : '💾 Öğrencinin Dosyasına Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
