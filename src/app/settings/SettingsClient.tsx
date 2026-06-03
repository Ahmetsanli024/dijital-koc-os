'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';

type Form = {
  coachName: string; coachTitle: string; phone: string; email: string;
  lgsExamDate: string; sessionFee: string; sessionDuration: string;
};

export default function SettingsClient({ initial }: { initial: Form }) {
  const [form, setForm] = useState<Form>(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState('');

  const showToast = (m: string, ok = true) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) showToast('✅ Ayarlar kaydedildi.');
      else showToast('❌ Kayıt hatası.');
    } catch {
      showToast('❌ Sunucu hatası.');
    }
    setSaving(false);
  };

  const iS: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px',
    border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none',
    background: 'var(--bg-main)', fontFamily: 'inherit',
  };

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{icon}</span>{title}
      </div>
      <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, name, type = 'text', placeholder = '', hint = '' }: { label: string; name: keyof Form; type?: string; placeholder?: string; hint?: string }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>{label}</label>
      <input type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} placeholder={placeholder} style={iS} />
      {hint && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{hint}</div>}
    </div>
  );

  // LGS geri sayım hesabı
  const lgsLeft = Math.ceil((new Date(form.lgsExamDate).getTime() - Date.now()) / 86_400_000);

  return (
    <div style={{ maxWidth: '820px', width: '100%' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.65rem 1.25rem', borderRadius: '8px', background: toast.startsWith('✅') ? '#10B981' : '#EF4444', color: 'white', fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      <PageHeader title="Ayarlar" subtitle="Koçluk sistemi konfigürasyonu — değişiklikler tüm sayfalara yansır"
        breadcrumb={['Ana Sayfa', 'Ayarlar']}
        actions={[{ label: saving ? '⏳ Kaydediliyor...' : '💾 Kaydet', variant: 'primary', onClick: handleSave }]} />

      <Section title="Koç Kimlik Bilgileri" icon="👤">
        <Field label="Ad Soyad *" name="coachName" placeholder="Ahmet ŞANLI" hint="Belgelerde ve raporlarda görünür" />
        <Field label="Unvan *" name="coachTitle" placeholder="Eğitim Koçu" hint="İmza bölümünde kullanılır" />
        <Field label="Telefon" name="phone" type="tel" placeholder="0555 123 45 67" />
        <Field label="E-posta" name="email" type="email" placeholder="ahmet@kocluk.com" />
      </Section>

      <Section title="Sınav & Seans Ayarları" icon="📅">
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>LGS Sınav Tarihi</label>
          <input type="date" value={form.lgsExamDate} onChange={e => setForm(f => ({ ...f, lgsExamDate: e.target.value }))} style={iS} />
          {!isNaN(lgsLeft) && lgsLeft > 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.3rem' }}>📅 {lgsLeft} gün kaldı</div>
          )}
        </div>
        <Field label="Seans Süresi (dakika)" name="sessionDuration" type="number" placeholder="45" hint="Varsayılan seans süresi" />
        <Field label="Seans Ücreti (₺)" name="sessionFee" type="number" placeholder="0" hint="Muhasebe modülünde kullanılır" />
      </Section>

      {/* Önizleme */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          👁️ İmza Önizlemesi
        </div>
        <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '1rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{form.coachName || 'Ad Soyad'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>{form.coachTitle || 'Unvan'}</div>
          {form.phone && <div style={{ color: 'var(--text-muted)' }}>📞 {form.phone}</div>}
          {form.email && <div style={{ color: 'var(--text-muted)' }}>✉️ {form.email}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '0.7rem 2.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? '⏳ Kaydediliyor...' : '💾 Ayarları Kaydet'}
        </button>
      </div>
    </div>
  );
}
