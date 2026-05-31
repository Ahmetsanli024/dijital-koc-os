'use client';
import React, { useState } from 'react';

export default function SessionClient({ students }: { students: any[] }) {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          Görüşme Notları (Seans Kayıtları)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Öğrencilerle yapılan birebir rehberlik ve motivasyon görüşmelerinin kayıtları.</p>
      </header>

      <section className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🤝</span> Yeni Görüşme Kaydı
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Öğrenci Seçin</label>
            <select style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
              <option value="">Lütfen Seçiniz...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Görüşmenin Konusu / Amacı</label>
            <input type="text" placeholder="Örn: Sınav kaygısı ve odaklanma problemi..." style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Görüşmede Yapılanlar ve Alınan Kararlar</label>
            <textarea rows={5} placeholder="Öğrencinin motivasyon eksikliği üzerine konuşuldu. Günde 30 soru paragraf rutin olarak programa eklendi..." style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', resize: 'vertical' }}></textarea>
          </div>

          <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', marginTop: '0.2rem', accentColor: 'var(--primary)' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Son Ders Programı ve Sınav Analizi Bu Görüşmeye Eklensin mi?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Öğrencinin envanterindeki en güncel akademik durum dosyaları bu seans notuna iliştirilir.</p>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => { setIsSaving(false); alert('Görüşme notu öğrencinin envanterine (dijital klasörüne) başarıyla eklendi!'); }, 1000);
            }}
            disabled={isSaving}
            style={{ padding: '1rem', marginTop: '1rem', background: isSaving ? 'var(--text-muted)' : 'var(--primary)' }}>
            {isSaving ? 'Kaydediliyor...' : 'Görüşmeyi Kaydet ve Öğrenci Klasörüne Aktar'}
          </button>
        </div>
      </section>
    </main>
  );
}
