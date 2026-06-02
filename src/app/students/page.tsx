import React from 'react';
import { addStudent, deleteStudent } from '../actions/student';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import MudurRaporuButton from './MudurRaporuButton';

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' },
    include: {
      sessions:  { orderBy: { date: 'desc' }, take: 1 },
      exams:     { orderBy: { date: 'desc' }, take: 1 },
      schedules: { where: { status: 'ACTIVE' }, include: { tasks: true } },
    },
  });

  return (
    <div style={{ maxWidth: '1200px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Ana Sayfa / Koçluk Portföyü</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Koçluk Portföyü</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {students.length} aktif öğrenci — Bireysel gelişim programı uygulanan tüm öğrenciler
          </p>
        </div>
        <MudurRaporuButton students={students} />
      </div>

      {/* Yeni Öğrenci Kayıt Formu */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900 }}>+</span>
          Portföye Yeni Öğrenci Ekle
        </h2>
        <form action={addStudent}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            {[
              { name: 'firstName',   label: 'Ad',            placeholder: 'Ahmet',          required: true },
              { name: 'lastName',    label: 'Soyad',         placeholder: 'Yılmaz',         required: true },
              { name: 'grade',       label: 'Sınıf / Düzey', placeholder: '8. Sınıf / LGS', required: true },
              { name: 'target',      label: 'Akademik Hedef', placeholder: 'Top %5 Dilim',   required: false },
              { name: 'parentName',  label: 'Veli Adı',      placeholder: 'Ayşe Hanım',     required: false },
              { name: 'parentPhone', label: 'Veli Telefonu', placeholder: '0555 000 00 00', required: false },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  {f.label}{f.required ? ' *' : ''}
                </label>
                <input type="text" name={f.name} required={f.required} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" style={{ padding: '0.6rem 1.75rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              Öğrenciyi Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* Öğrenci Listesi */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {students.length} öğrenci kayıtlı
          </span>
        </div>

        {students.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
            <p style={{ fontWeight: 600 }}>Henüz öğrenci kaydı yok.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>Yukarıdaki formu kullanarak ilk öğrencini ekle.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Öğrenci', 'Sınıf & Hedef', 'Son Seans', 'Son Deneme Neti', 'Program', 'Veli', 'İşlem'].map(h => (
                    <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const lastSession = s.sessions[0];
                  const lastExam    = s.exams[0];
                  const activeSched = s.schedules[0];
                  const totalTasks  = activeSched?.tasks.length || 0;
                  const doneTasks   = activeSched?.tasks.filter(t => t.isCompleted).length || 0;
                  const pct         = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : null;
                  const pctColor    = pct === null ? '#94A3B8' : pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
                  const daysSince   = lastSession ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / 86_400_000) : null;

                  return (
                    <tr key={s.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                            {s.firstName[0]}{s.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.firstName} {s.lastName}</div>
                            {s.targetSchool && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🎯 {s.targetSchool}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.grade}</div>
                        {s.target && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.target}</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {daysSince !== null ? (
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                              {new Date(lastSession!.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: daysSince > 10 ? '#EF4444' : 'var(--text-muted)' }}>
                              {daysSince} gün önce
                            </div>
                          </div>
                        ) : <span style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 600 }}>Henüz seans yok</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {lastExam ? (
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{lastExam.totalNet.toFixed(2)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastExam.name}</div>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {pct !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '55px', height: '5px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pctColor, borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: pctColor }}>%{pct}</span>
                          </div>
                        ) : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Program yok</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.82rem' }}>{s.parentName || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.parentPhone || ''}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link href={`/students/${s.id}`} style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>
                            Profil
                          </Link>
                          <form action={async () => { 'use server'; await deleteStudent(s.id); }}>
                            <button type="submit" style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', background: '#FEF2F2', color: '#DC2626', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                              Sil
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
