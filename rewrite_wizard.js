const fs = require('fs');
const path = './src/app/assignments/WizardClient.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace states
code = code.replace(/const \[step, setStep\] = useState\(1\);/, `const [showSyncModal, setShowSyncModal] = useState(false);\n  const [selectedExamId, setSelectedExamId] = useState('');\n  const [examFile, setExamFile] = useState<File | null>(null);`);
code = code.replace(/const \[isExamDropdownOpen, setIsExamDropdownOpen\] = useState\(false\);/, '');

// Replace nextStep and prevStep with our modal logic
const syncLogic = `
  const handlePdfUploadSync = async () => {
    if (!examFile) return;
    setShowSyncModal(false);
    setIsAnalyzing(true);
    setAnalysisSeconds(0);
    const interval = setInterval(() => setAnalysisSeconds(s => s + 1), 1000);

    try {
      const formData = new FormData();
      formData.append('pdf', examFile);
      
      const uploadRes = await fetch('/api/upload-exam', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);
      
      const res = await fetch('/api/ai-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aggregatedData: [{ subject: "Yapay Zeka Analizi", topics: uploadData.topics || [] }],
          studentName: selectedStudent.firstName + ' ' + selectedStudent.lastName,
          rawScanData: uploadData.rawText 
        })
      });
      
      const distData = await res.json();
      if (!res.ok) throw new Error(distData.error);
      
      const { aiData } = distData;
      setSmartState(prev => {
        const next = { ...prev };
        Object.keys(aiData.subjects).forEach(aiSubject => {
          const mapped = findMatchingSubject(aiSubject);
          if (mapped && next[mapped]) {
            next[mapped] = { ...next[mapped], aiParsedTopics: aiData.subjects[aiSubject] };
          }
        });
        return next;
      });
      
      if (aiData?.evaluationSummary) {
        setStudentNote(aiData.evaluationSummary + '\\n\\nBu eksikleri kapatmak için bu haftaki görevlerini ertelemeden tamamlaman başarının anahtarıdır. Sana inancım tam!');
      }
      alert('Yapay Zeka PDF Analizi Tamamlandı!');
    } catch(err:any) {
      alert('Hata: ' + err.message);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };
`;
code = code.replace(/const nextStep = [^\n]+\n\s+const prevStep = [^\n]+/, syncLogic);

// Replace handleSyncTopicList to accept examIdToUse
code = code.replace(/const handleSyncTopicList = async \(\) => \{/, 'const handleSyncTopicList = async (examIdToUse?: string) => {');
code = code.replace(/const singleExams = [^\n]+;\n\s+const examsToUse = [^\n]+;/, 'const examsToUse = examIdToUse ? selectedStudent.exams.filter((e:any)=>e.id === examIdToUse) : selectedStudent.exams;');

// Replace Header and Progress Bar
const headerRegex = /<header className="no-print"[\s\S]*?<\/div>\s*<\/div>\s*<div style={{ display: 'flex', gap: '1rem', marginBottom: '2\.5rem' }}>[\s\S]*?<\/div>/;
code = code.replace(headerRegex, `<header className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Hızlı Ders Programı Tasarımı
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Öğrenci profilini seçerek YZ destekli akıllı program hazırlayabilirsiniz.</p>
        </div>
        <div style={{ width: '300px' }}>
          <select 
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const std = students.find(s => s.id === e.target.value);
              setSelectedStudent(std);
            }}
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border)', fontSize: '1rem', background: 'var(--bg-main)', outline: 'none', fontWeight: 700, color: 'var(--text-primary)' }}>
            <option value="">Envanterden Öğrenci Seçin...</option>
            {students.map((s:any) => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
            ))}
          </select>
        </div>
      </header>`);

// Remove Step 1 and Step 2 UI completely
const stepsRegex = /\{step === 1 && \([\s\S]*?\{step === 2 && \([\s\S]*?\{step === 3 && \(/;
code = code.replace(stepsRegex, `{!selectedStudent ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>👩‍🎓</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Lütfen Bir Öğrenci Seçin</h2>
          <p>Ders programı hazırlamak için sağ üst menüden bir öğrenci profili seçmeniz gerekmektedir.</p>
        </div>
      ) : (`);

// Change onClick={handleSyncTopicList} to onClick={() => setShowSyncModal(true)}
code = code.replace(/onClick=\{handleSyncTopicList\}/, `onClick={() => setShowSyncModal(true)}`);

// We also need to remove the closing bracket of step 3 at the bottom or rename it
// Since we used `{!selectedStudent ? (...) : (` it replaces `{step===3 && (`, so the closing `)}` at the end of the file is still perfectly valid and closes our ternary.

// Inject Modal JSX at the end of main
const modalJSX = `
      {/* Sync Modal */}
      {showSyncModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '16px', padding: '2.5rem', position: 'relative' }}>
            <button onClick={() => setShowSyncModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>🧠</span> Akıllı Senkronizasyon
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>Öğrencinin güncel zayıflıklarını ve hedeflerini YZ ile analiz ederek programı otomatik dizin.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Option 1: PDF */}
              <div style={{ border: '2px solid var(--border)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>📄 Yeni PDF Sınav Yükle</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Son girilen denemeyi yükleyin, yapay zeka saniyeler içinde eksikleri bulsun.</p>
                <input type="file" accept="application/pdf" onChange={(e) => setExamFile(e.target.files?.[0] || null)} style={{ marginBottom: '1rem', width: '100%' }} />
                <button onClick={handlePdfUploadSync} disabled={!examFile} className="btn-primary" style={{ width: '100%', padding: '0.8rem', opacity: examFile ? 1 : 0.5 }}>PDF'i Tara ve Senkronize Et</button>
              </div>

              {/* Option 2: Arşiv */}
              <div style={{ border: '2px solid var(--border)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>🗂️ Arşivden Sınav Seç</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Öğrencinin daha önce sisteme işlenmiş sınavlarından birini analiz edin.</p>
                <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                  <option value="">Sınav Seçiniz...</option>
                  {selectedStudent?.exams?.map((e:any) => (
                    <option key={e.id} value={e.id}>{new Date(e.date).toLocaleDateString('tr-TR')} - {e.examType || 'Deneme'}</option>
                  ))}
                </select>
                <button onClick={() => { setShowSyncModal(false); handleSyncTopicList(selectedExamId); }} disabled={!selectedExamId} className="btn-secondary" style={{ width: '100%', padding: '0.8rem', opacity: selectedExamId ? 1 : 0.5 }}>Seçili Sınavla Senkronize Et</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>`;

code = code.replace(/<\/main>/, modalJSX);

// We need to also clean up any usages of prevStep / nextStep that might be left but they were all in Step 1 and Step 2 which are deleted.

fs.writeFileSync(path, code);
