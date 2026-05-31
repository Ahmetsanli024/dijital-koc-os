import React from 'react';
import { getStudents, addStudent, deleteStudent } from '../actions/student';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Öğrenci Hafızası
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sisteme kayıtlı, aktif danışmanlık verdiğiniz tüm öğrencilerin profilleri.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        {/* Öğrenci Ekleme Formu */}
        <section className="card" style={{ alignSelf: 'start', borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>+ Yeni Öğrenci Ekle</h2>
          <form action={addStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Adı</label>
              <input type="text" name="firstName" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Soyadı</label>
              <input type="text" name="lastName" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Sınıfı</label>
              <input type="text" name="grade" placeholder="Örn: 8. Sınıf" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hedef (Puan/Yüzdelik)</label>
              <input type="text" name="target" placeholder="Örn: %5 Dilim" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Veli Adı</label>
              <input type="text" name="parentName" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Veli Telefonu</label>
              <input type="text" name="parentPhone" placeholder="Örn: 90555..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none' }}>Öğrenciyi Kaydet</button>
          </form>
        </section>

        {/* Öğrenci Listesi */}
        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                          <a href={`/students/${student.id}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
                            📁 Klasörü İncele
                          </a>
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
