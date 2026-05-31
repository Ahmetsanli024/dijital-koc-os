'use client';
import React, { useState } from 'react';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const SUBJECTS = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İnkılap', 'İngilizce', 'Din Kültürü'];

export default function KanbanPlanner({ student, onClose }: { student: any, onClose: () => void }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ subject: 'Matematik', topic: '', questionCount: 50 });
  const [draggedTask, setDraggedTask] = useState<any>(null);

  const handleDragStart = (task: any) => setDraggedTask(task);
  
  const handleDrop = (day: string) => {
    if (!draggedTask) return;
    setTasks(prev => {
      // If it's a new task from the sidebar
      if (draggedTask.isNew) {
        return [...prev, { id: Math.random().toString(), day, ...draggedTask, isNew: false }];
      }
      // If moving existing task
      return prev.map(t => t.id === draggedTask.id ? { ...t, day } : t);
    });
    setDraggedTask(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', zIndex: 1000, padding: '2rem' }}>
      <div style={{ background: 'var(--bg-main)', width: '100%', height: '100%', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <header style={{ padding: '1.5rem 2rem', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sürükle & Bırak Akıllı Planlayıcı</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{student.firstName} için haftalık görev dağılımı yapın.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => alert('Plan kaydedildi! (Demo)')}>💾 Kaydet</button>
            <button className="btn-secondary" onClick={onClose}>✖ Kapat</button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Sol Panel: Görev Havuzu */}
          <div style={{ width: '300px', background: 'white', borderRight: '1px solid var(--border)', padding: '1.5rem', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Görev Oluştur</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <select value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', color: 'black', background: 'white' }}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Konu (Örn: Çarpanlar)" value={newTask.topic} onChange={e => setNewTask({...newTask, topic: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', color: 'black', background: 'white' }} />
              <input type="number" placeholder="Soru Sayısı" value={newTask.questionCount || ''} onChange={e => setNewTask({...newTask, questionCount: parseInt(e.target.value) || 0})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', color: 'black', background: 'white' }} />
              
              <div 
                draggable 
                onDragStart={() => handleDragStart({ ...newTask, isNew: true })}
                style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '8px', cursor: 'grab', textAlign: 'center', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}
              >
                🖐️ Tut ve Günlere Sürükle
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Yapay Zeka Kaynak Önerisi</h3>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>🤖 Koç Asistan Diyor ki:</p>
              "Öğrencinin Matematik netleri 15 civarında. Başlangıç için <strong>Hız Yayınları</strong>, geometri kısmında ise <strong>Okyanus Master</strong> ödevlendirmesi yapmanızı öneririm."
            </div>
          </div>

          {/* Sağ Panel: Kanban Board */}
          <div style={{ flex: 1, padding: '1.5rem', overflowX: 'auto', background: '#f8fafc', display: 'flex', gap: '1rem' }}>
            {DAYS.map(day => (
              <div 
                key={day}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(day)}
                style={{ flex: '0 0 250px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <div style={{ padding: '1rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', fontWeight: 800, textAlign: 'center' }}>
                  {day}
                </div>
                <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '300px' }}>
                  {tasks.filter(t => t.day === day).map(task => (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', cursor: 'grab', fontSize: '0.85rem' }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{task.subject}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{task.topic}</div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: 'white', color: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{task.questionCount || 0} Soru</span>
                        <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>✖</button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.day === day).length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>Buraya sürükle...</div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
