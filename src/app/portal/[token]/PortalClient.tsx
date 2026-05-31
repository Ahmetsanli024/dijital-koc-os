'use client';
import React, { useState } from 'react';

export default function PortalClient({ student }: { student: any }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const currentSchedule = student.schedules?.[0];
  const completedTasks = currentSchedule?.tasks?.filter((t:any) => t.isCompleted).length || 0;
  const totalTasks = currentSchedule?.tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const lastExam = student.exams?.[0];
  const exams = student.exams || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F19', color: 'white', fontFamily: 'var(--font-sans)', backgroundImage: 'radial-gradient(circle at 50% 0%, #1E293B 0%, #0B0F19 60%)' }}>
      
      {/* Top Navbar */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>
            {student.firstName[0]}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{student.firstName} {student.lastName}</div>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Ahmet Şanlı Koçluk • LGS 2026</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: activeTab === 'dashboard' ? '#60A5FA' : '#9CA3AF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>Ana Panel</button>
          <button onClick={() => setActiveTab('tasks')} style={{ background: activeTab === 'tasks' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: activeTab === 'tasks' ? '#60A5FA' : '#9CA3AF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>Görevlerim</button>
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            {/* Welcome Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Merhaba, {student.firstName}! 🚀</h1>
                <p style={{ color: '#9CA3AF', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6 }}>
                  Süper Koçluk sistemine hoş geldin. Hedefin olan <strong>{student.target || 'Zirve'}</strong> için bu hafta odaklanman gereken çok şey var. Başarı tesadüf değildir!
                </p>
              </div>
              <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              
              {/* Progress & Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🎯</span> Haftalık Görev İlerlemesi</h3>
                  {currentSchedule ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#9CA3AF' }}>{completedTasks} / {totalTasks} Görev Tamamlandı</span>
                        <span style={{ fontWeight: 'bold', color: '#10B981' }}>%{progress}</span>
                      </div>
                      <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #10B981)', borderRadius: '6px', transition: 'width 1s ease-in-out' }}></div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#9CA3AF' }}>Bu hafta için atanmış bir görev planın bulunmuyor.</p>
                  )}
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🏆</span> Kazanılan Rozetler</h3>
                  {(!student.badges || student.badges.length === 0) ? (
                    <p style={{ color: '#9CA3AF' }}>Görevlerini tamamladıkça burada rozetler birikecek!</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {student.badges.map((b:any) => (
                        <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', width: '100px', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{b.icon}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', color: '#E2E8F0' }}>{b.title}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* LGS Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📊</span> LGS Deneme Analizi</h3>
                  {lastExam ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #3B82F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#60A5FA' }}>{lastExam.totalNet}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Net</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>Son Sınav: {lastExam.name}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '1rem' }}>{new Date(lastExam.date).toLocaleDateString('tr-TR')}</div>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#10B981', fontSize: '0.8rem', fontWeight: 'bold' }}>{lastExam.totalCorrect} Doğru</div>
                          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#EF4444', fontSize: '0.8rem', fontWeight: 'bold' }}>{lastExam.totalIncorrect} Yanlış</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#9CA3AF' }}>Henüz sisteme deneme sınavı yüklenmemiş.</p>
                  )}
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🤖</span> Koçun Notu</h3>
                  <p style={{ color: '#E2E8F0', fontStyle: 'italic', lineHeight: 1.6, borderLeft: '3px solid #3B82F6', paddingLeft: '1rem' }}>
                    {student.notes || "Bu hafta hedeflerine ulaşmak için sadece planda kal. Unutma, en önemli adım bir sonraki adımdır."}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Bu Haftanın Görevleri</h2>
             {currentSchedule ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {currentSchedule.tasks.map((task:any) => (
                   <div key={task.id} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: task.isCompleted ? 0.5 : 1 }}>
                     <div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                         <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{task.day}</span>
                         <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{task.subject}</span>
                       </div>
                       <div style={{ color: '#9CA3AF' }}>{task.topic} — <strong style={{ color: '#E2E8F0' }}>{task.questionCount || 0} Soru</strong></div>
                     </div>
                     <div>
                       {task.isCompleted ? (
                         <div style={{ color: '#10B981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>✅</span> Tamamlandı</div>
                       ) : (
                         <div style={{ color: '#F59E0B', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>⏳</span> Bekliyor</div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏖️</div>
                 <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Görev Bulunmuyor</h3>
                 <p style={{ color: '#9CA3AF' }}>Ahmet Hoca henüz sana bu hafta için bir çalışma programı tanımlamadı.</p>
               </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
}
