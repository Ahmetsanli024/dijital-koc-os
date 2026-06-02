'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    coachName: 'Ahmet ŞANLI',
    coachTitle: 'Eğitim Koçu',
    phone: '',
    email: '',
    lgsExamDate: '2026-06-13',
    sessionFee: '0',
    sessionDuration: '45',
  });

  const handleSave = async () => {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
      <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--text-primary)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>{children}</div>
    </div>
  );

  const Field = ({ label, name, type = 'text', placeholder = '' }: { label: string; name: keyof typeof form; type?: string; placeholder?: string }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none', background: 'var(--bg-main)' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '800px' }}>
      {saved && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: '#10B981', color: 'white', fontWeight: 700 }}>Ayarlar kaydedildi ✅</div>}

      <PageHeader title="Ayarlar" subtitle="Sistem ve koç bilgilerini düzenleyin" breadcrumb={['Ana Sayfa', 'Ayarlar']} />

      <Section title="👤 Koç Bilgileri">
        <Field label="Ad Soyad" name="coachName" />
        <Field label="Unvan" name="coachTitle" placeholder="Eğitim Koçu" />
        <Field label="Telefon" name="phone" type="tel" placeholder="0555 123 45 67" />
        <Field label="E-posta" name="email" type="email" placeholder="koç@mail.com" />
      </Section>

      <Section title="📅 Sınav & Seans">
        <Field label="LGS Sınav Tarihi" name="lgsExamDate" type="date" />
        <Field label="Seans Süresi (dakika)" name="sessionDuration" type="number" />
        <Field label="Seans Ücreti (₺)" name="sessionFee" type="number" placeholder="0" />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button onClick={handleSave} style={{ padding: '0.65rem 2rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
          💾 Kaydet
        </button>
      </div>
    </div>
  );
}
