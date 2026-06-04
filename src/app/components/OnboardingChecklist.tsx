'use client';
import { useState } from 'react';

interface ChecklistProps {
  student: {
    firstName: string; lastName: string; grade: string;
    target: string | null; targetSchool: string | null;
    parentName: string | null; parentPhone: string | null;
    portalToken: string | null;
    exams: any[]; schedules: any[]; sessions: any[]; appointments: any[];
  };
}

const STEPS = [
  { id: 'info',       label: 'Kişisel bilgiler tam girildi',        desc: 'Ad, soyad, sınıf, veli bilgileri' },
  { id: 'target',     label: 'Akademik hedef belirlendi',            desc: 'Hedef okul / bölüm / puan tanımlandı' },
  { id: 'firstExam',  label: 'İlk değerlendirme sınavı yüklendi',   desc: 'Başlangıç seviyesi belirlendi' },
  { id: 'program',    label: 'Bireysel gelişim programı oluşturuldu', desc: 'İlk haftalık plan hazırlandı' },
  { id: 'session',    label: 'İlk koçluk seansı yapıldı',            desc: 'Tanışma ve değerlendirme seansı' },
  { id: 'portal',     label: 'Öğrenci portal linki gönderildi',      desc: 'Öğrenci sisteme erişim sağladı' },
  { id: 'appt',       label: 'Düzenli seans planı kuruldu',          desc: 'Haftalk randevu takvimi oluşturuldu' },
  { id: 'contract',   label: 'Koçluk sözleşmesi imzalandı',          desc: 'Taraflar mutabık kaldı' },
];

function autoCheck(step: string, s: ChecklistProps['student']): boolean {
  switch (step) {
    case 'info':      return !!(s.firstName && s.lastName && s.grade && s.parentPhone);
    case 'target':    return !!(s.target || s.targetSchool);
    case 'firstExam': return s.exams.length > 0;
    case 'program':   return s.schedules.length > 0;
    case 'session':   return s.sessions.length > 0;
    case 'portal':    return !!s.portalToken;
    case 'appt':      return s.appointments.length >= 2;
    default:          return false;
  }
}

export default function OnboardingChecklist({ student }: ChecklistProps) {
  const [manualChecked, setManualChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const isChecked = (step: typeof STEPS[0]) => {
    return autoCheck(step.id, student) || manualChecked.has(step.id);
  };

  const toggle = (id: string, autoVal: boolean) => {
    if (autoVal) return; // otomatik tamamlananlar değiştirilemez
    setManualChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const doneCount = STEPS.filter(s => isChecked(s)).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);
  const isComplete = doneCount === STEPS.length;

  if (isComplete && !open) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setOpen(true)}>
        <span style={{ fontSize: '1rem' }}>✅</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065F46' }}>Onboarding tamamlandı</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#16A34A' }}>Detay ▾</span>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>📋 Onboarding Kontrol Listesi</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pct === 100 ? '#059669' : '#F59E0B' }}>{doneCount}/{STEPS.length} · %{pct}</span>
          </div>
          <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10B981' : '#F59E0B', borderRadius: '3px', transition: 'width 0.4s' }} />
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 0.85rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid var(--border)' }}>
          {STEPS.map((step, i) => {
            const auto    = autoCheck(step.id, student);
            const checked = isChecked(step);
            return (
              <div key={step.id}
                onClick={() => toggle(step.id, auto)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.6rem', borderRadius: '7px', cursor: auto ? 'default' : 'pointer', background: checked ? '#F0FDF4' : 'transparent', transition: 'background 0.15s' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${checked ? '#10B981' : '#CBD5E1'}`, background: checked ? '#10B981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                  {checked && <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 900 }}>✓</span>}
                  {!checked && <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: checked ? 700 : 600, color: checked ? '#065F46' : '#374151', textDecoration: checked ? 'none' : 'none' }}>
                    {step.label}
                    {auto && checked && <span style={{ marginLeft: '0.4rem', fontSize: '0.62rem', color: '#10B981', fontWeight: 700 }}>• Otomatik</span>}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{step.desc}</div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '0.25rem', fontSize: '0.68rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
            💡 Yeşil adımlar mevcut veriden otomatik tamamlandı. Geri kalanları elle işaretleyebilirsiniz.
          </div>
        </div>
      )}
    </div>
  );
}
