import React from 'react';
import { addStudent, deleteStudent } from '../actions/student';
import prisma from '@/lib/prisma';
import MudurRaporuButton from './MudurRaporuButton';
import Link from 'next/link';

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' },
    include: {
      sessions: { orderBy: { date: 'desc' } },
      exams: { orderBy: { date: 'desc' } },
      schedules: { include: { tasks: true } }
    }
  });

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Dijital Öğrenci Envanteri
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sisteme kayıtlı, aktif danışmanlık verdiğiniz tüm öğrencilerin profilleri.</p>
        </div>
        <div>
          <MudurRaporuButton students={students} />
        </div>
      </header>

      {/* Fütüristik Öğrenci Ekleme Modülü (Siber-Estetik & Glassmorphism) */}
      <section style={{ 
        marginBottom: '3rem', 
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 58, 138, 0.8))',
        border: '1px solid rgba(96, 165, 250, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dekoratif Siber Işıklar ve Grid */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)' }}>⚡</div>
            Dijital Kayıt Terminali
          </h2>
          <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', color: '#34D399', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Sistem Aktif
          </div>
        </div>
        
        <form action={addStudent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>👤 Öğrenci Adı</label>
            <input type="text" name="firstName" required style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontWeight: 600, transition: 'all 0.3s' }} placeholder="Örn: Ahmet" />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📝 Öğrenci Soyadı</label>
            <input type="text" name="lastName" required style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontWeight: 600, transition: 'all 0.3s' }} placeholder="Örn: Yılmaz" />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🏫 Sınıfı</label>
            <input type="text" name="grade" required style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontWeight: 600, transition: 'all 0.3s' }} placeholder="Örn: 8. Sınıf" />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🎯 Hedef (Dilim/Puan)</label>
            <input type="text" name="target" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontWeight: 600, transition: 'all 0.3s' }} placeholder="Örn: %5 Dilim" />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>👨‍👩‍👧 Veli Adı</label>
            <input type="text" name="parentName" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontWeight: 600, transition: 'all 0.3s' }} placeholder="Örn: Ayşe Hanım" />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📞 Veli İletişim</label>
            <input type="text" name="parentPhone" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', fontWeight: 600, transition: 'all 0.3s' }} placeholder="0555..." />
          </div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" style={{ 
              padding: '1rem 3rem', 
              background: 'linear-gradient(135deg, #38BDF8, #2563EB)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '1.1rem', 
              fontWeight: 800, 
              display: 'flex', 
              gap: '0.75rem', 
              alignItems: 'center',
              boxShadow: '0 10px 20px -5px rgba(56, 189, 248, 0.5)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s'
            }}>
              <span>🚀</span> Kaydı Başlat ve Şifrele
            </button>
          </div>
        </form>

        <style>{`
          .input-group input:focus {
            outline: none;
            border-color: #38BDF8 !important;
            box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
            background: rgba(15, 23, 42, 0.8) !important;
          }
        `}</style>
      </section>

      <div>        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', background: 'var(--bg-main)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sistemdeki Öğrenciler ({students.length})</h2>
          </div>
          
          <div className="table-container">
            {students.length === 0 ? (
              <div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>👥</div>
                <p>Henüz öğrenci eklenmemiş.<br/>Sol taraftaki formu kullanarak ilk öğrencinizi veritabanına kaydedin.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Öğrenci Profil</th>
                    <th>Sınıf / Hedef</th>
                    <th>Veli İletişim</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{student.firstName} {student.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{student.grade}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hedef: {student.target || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{student.parentName || '-'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.parentPhone || '-'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link href={`/students/${student.id}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
                            📁 Klasörü İncele
                          </Link>
                          <form action={async () => {
                            'use server'
                            await deleteStudent(student.id)
                          }}>
                            <button type="submit" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                              Sil
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
