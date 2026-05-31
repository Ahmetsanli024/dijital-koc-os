'use client';
import React, { useState, useEffect } from 'react';
import { logParentCommunication, markAsSent } from '../actions/parent';

export default function ParentClient({ students }: { students: any[] }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [topic, setTopic] = useState('Genel Değerlendirme');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // All drafts
  const drafts = students.flatMap(s => (s.parentComms || []).map((c:any) => ({...c, student: s}))).filter(c => c.isDraft);

  // Generate AI default message
  useEffect(() => {
    if (selectedStudent) {
      if (topic === 'Deneme Analizi' || topic === 'Genel Değerlendirme') {
        const exams = selectedStudent.exams || [];
        if (exams.length > 0) {
          const latestExam = exams[0];
          let weakTopicsText = '[İlgili Dersler ve Konular]';
          if (latestExam.aiTopics) {
            try {
              const subjects = JSON.parse(latestExam.aiTopics);
              const weakList: string[] = [];
              subjects.forEach((sub: any) => {
                if (sub.topics && Array.isArray(sub.topics)) {
                  const weaks = sub.topics.filter((t: any) => t.isWeak || t.percentage < 50).map((t: any) => t.name);
                  if (weaks.length > 0) {
                    weakList.push(`${sub.name} dersinden ${weaks.join(', ')}`);
                  }
                } else if (sub.weakTopic) {
                  weakList.push(`${sub.name} dersinden ${sub.weakTopic}`);
                }
              });
              if (weakList.length > 0) {
                weakTopicsText = weakList.join('; ');
              }
            } catch(e) {}
          }
          
          let bodyText = `Öğrencimiz ${selectedStudent.firstName} ile bu haftaki görüşmemizde genel akademik durumu, ders ve konu gelişim düzeyi üzerine değerlendirmeler yapılmıştır.\n\nSon analizlerimize göre öğrencimizin özellikle ${weakTopicsText} konularında eksiklikleri bulunduğu tespit edilmiştir. Bu açıkları kapatmak ve konu gelişimini desteklemek amacıyla gerekli rehberlik yönlendirmeleri yapılmış ve önümüzdeki hafta için kendisine özel ders çalışma planı hazırlanmıştır.`;

          setMessage(`Sayın Velimiz ${selectedStudent.parentName || ''},\n\n${bodyText}\n\nDesteğiniz için teşekkür ederim. İyi günler dilerim.\n\nAhmet ŞANLI\nEğitim Danışmanı ve Rehber Öğretmen`);
        } else {
          setMessage(`Sayın Velimiz ${selectedStudent.parentName || ''},\n\nÖğrencimiz ${selectedStudent.firstName} ile ilgili genel değerlendirmelerimiz aşağıdadır:\n\n[Değerlendirme Notu...]\n\nDesteğiniz için teşekkür ederim. İyi günler dilerim.\n\nAhmet ŞANLI\nEğitim Danışmanı ve Rehber Öğretmen`);
        }
      } else {
        setMessage(`Sayın Velimiz ${selectedStudent.parentName || ''},\n\nÖğrencimiz ${selectedStudent.firstName} ile ilgili ${topic} konulu bilgilendirme aşağıdadır:\n\n[Bilgilendirme Notu...]\n\nDesteğiniz için teşekkür ederim. İyi günler dilerim.\n\nAhmet ŞANLI\nEğitim Danışmanı ve Rehber Öğretmen`);
      }
    } else {
      setMessage('');
    }
  }, [selectedStudentId, topic, students]);

  const handleSendAndSave = async (isDraft: boolean) => {
    if (!selectedStudent) return;
    setIsSaving(true);
    
    // Save to DB
    const res = await logParentCommunication(selectedStudent.id, topic, message, isDraft);
    setIsSaving(false);
    
    if (res.success) {
      if (!isDraft) {
        // Open WhatsApp
        const phone = selectedStudent.parentPhone ? selectedStudent.parentPhone.replace(/[^0-9]/g, '') : '';
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      } else {
        alert('Taslak olarak kaydedildi. Bekleyen Taslaklar listesinden gönderebilirsiniz.');
        setSelectedStudentId('');
      }
    } else {
      alert('Kayıt sırasında bir hata oluştu: ' + res.error);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      // Window.speechRecognition would be stopped by the browser when we don't restart it or manually stop it.
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcınız sesli asistanı desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setMessage(prev => prev + ' ' + finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // If still isListening, restart it (continuous listening), else stop
      if (isListening) {
        setIsListening(false); // For safety, let user click again.
      }
    };

    recognition.start();
  };

  const handleSendDraft = async (draftId: string, phoneStr: string, text: string) => {
    const res = await markAsSent(draftId);
    if (res.success) {
        const phone = phoneStr ? phoneStr.replace(/[^0-9]/g, '') : '';
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    } else {
        alert('Hata: ' + res.error);
    }
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      
      {/* Sol Panel: Liste ve Form */}
      <div style={{ flex: 1 }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Veli İletişim CRM Envanteri
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Öğrencilerin veli iletişim geçmişini takip edin ve yeni mesajlar gönderin.</p>
        </header>

        <section className="card" style={{ marginBottom: '2rem', padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Öğrenci ve Veli Listesi</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem', fontWeight: 600 }}>Öğrenci</th>
                <th style={{ padding: '0.75rem', fontWeight: 600 }}>Son İletişim</th>
                <th style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const lastComm = student.parentComms && student.parentComms.length > 0 ? student.parentComms.find((c:any)=>!c.isDraft) : null;
                const isSelected = selectedStudentId === student.id;
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'transparent', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                        {student.firstName} {student.lastName}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{student.parentName || '-'} ({student.parentPhone || 'Tel Yok'})</div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {lastComm ? new Date(lastComm.date).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedStudentId(student.id)}
                        className={isSelected ? "btn-primary" : "btn-secondary"} 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        {isSelected ? 'Seçildi' : 'Seç'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Kayıtlı öğrenci bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {selectedStudent && (
          <section className="card" style={{ padding: '2rem', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Yeni Görüşme Kaydı</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Öğrenci: <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong></p>
              </div>
              
              <select 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white', fontWeight: 600 }}>
                <option value="Genel Değerlendirme">Genel Değerlendirme</option>
                <option value="Deneme Analizi">Deneme Analizi</option>
                <option value="Ödev Kontrolü">Ödev Kontrolü</option>
                <option value="Motivasyon Görüşmesi">Motivasyon Görüşmesi</option>
                <option value="Devamsızlık/Gecikme">Devamsızlık/Gecikme</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', height: '250px', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontSize: '0.95rem', lineHeight: '1.6', resize: 'vertical', outline: 'none', fontFamily: 'var(--font-sans)' }}
              />
              <button 
                onClick={toggleListen}
                title="Sesle Yazdır (Mikrofon)"
                style={{ 
                  position: 'absolute', bottom: '1.5rem', right: '1.5rem',
                  width: '45px', height: '45px', borderRadius: '50%',
                  background: isListening ? 'var(--danger)' : 'var(--bg-card)',
                  color: isListening ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${isListening ? 'var(--danger)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', cursor: 'pointer',
                  boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'var(--shadow-sm)',
                  transition: 'var(--transition)'
                }}>
                {isListening ? '🛑' : '🎙️'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem' }}>
              <button 
                onClick={() => handleSendAndSave(true)}
                disabled={isSaving || !selectedStudent.parentPhone}
                className="btn-secondary" 
                style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📝</span> Taslak Olarak Kaydet
              </button>
              <button 
                onClick={() => handleSendAndSave(false)}
                disabled={isSaving || !selectedStudent.parentPhone}
                className="btn-primary" 
                style={{ background: '#25D366', color: 'white', border: 'none', padding: '0.85rem 1.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💬</span> WhatsApp'ta Gönder
              </button>
            </div>
            {!selectedStudent.parentPhone && (
              <p style={{ textAlign: 'right', color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>Bu öğrencinin kayıtlı bir veli telefonu bulunmuyor.</p>
            )}
          </section>
        )}
      </div>

      {/* Sağ Panel: Taslaklar */}
      <div style={{ width: '350px' }}>
        <section className="card" style={{ background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📝</span> Bekleyen Taslaklar ({drafts.length})
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Hafta sonu hazırladığınız mesajları buradan tek tıkla sırayla gönderebilirsiniz.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {drafts.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                Bekleyen taslak mesajınız yok.
              </div>
            )}
            {drafts.map((draft:any) => (
              <div key={draft.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{draft.student.firstName} {draft.student.lastName}</span>
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-main)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--primary)', fontWeight: 600 }}>{draft.topic}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {draft.message}
                </p>
                <button 
                  onClick={() => handleSendDraft(draft.id, draft.student.parentPhone, draft.message)}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', background: '#25D366', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  Gönder ve Taslaktan Çıkar 🚀
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

    </main>
  );
}
