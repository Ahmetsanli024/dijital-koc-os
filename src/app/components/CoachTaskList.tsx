'use client';
import { useState } from 'react';
import Link from 'next/link';

export type AutoTask = {
  id: string;
  type: 'urgent' | 'normal' | 'info';
  text: string;
  studentId?: string;
  studentName?: string;
  link?: string;
};

export default function CoachTaskList({ autoTasks }: { autoTasks: AutoTask[] }) {
  const [manualTasks, setManualTasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newTask, setNewTask]         = useState('');
  const [doneTasks, setDoneTasks]     = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed]     = useState(false);

  const addManual = () => {
    if (!newTask.trim()) return;
    setManualTasks(prev => [...prev, { id: Date.now().toString(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };

  const toggleDone = (id: string) => {
    setDoneTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const removeManual = (id: string) => setManualTasks(prev => prev.filter(t => t.id !== id));

  const pendingAuto   = autoTasks.filter(t => !doneTasks.has(t.id));
  const pendingManual = manualTasks.filter(t => !doneTasks.has(t.id));
  const totalPending  = pendingAuto.length + pendingManual.length;

  const typeStyle: Record<AutoTask['type'], { border: string; bg: string; dot: string }> = {
    urgent: { border: '#EF4444', bg: '#FEF2F2', dot: '#EF4444' },
    normal: { border: '#F59E0B', bg: '#FFFBEB', dot: '#F59E0B' },
    info:   { border: '#2563EB', bg: '#EFF6FF', dot: '#2563EB' },
  };

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Başlık */}
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: collapsed ? 'none' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>✅ Koç Görev Listesi</span>
          {totalPending > 0 && (
            <span style={{ background: '#EF4444', color: 'white', borderRadius: '10px', padding: '0.05rem 0.5rem', fontSize: '0.7rem', fontWeight: 800 }}>{totalPending}</span>
          )}
        </div>
        <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {collapsed ? '▼' : '▲'}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '340px', overflowY: 'auto' }}>
          {/* Otomatik görevler */}
          {pendingAuto.map(t => {
            const s = typeStyle[t.type];
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', background: s.bg, borderRadius: '8px', border: `1px solid ${s.border}22`, borderLeft: `3px solid ${s.border}` }}>
                <button onClick={() => toggleDone(t.id)} style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${s.dot}`, background: 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  {doneTasks.has(t.id) && <span style={{ color: s.dot, fontSize: '0.65rem' }}>✓</span>}
                </button>
                <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#1F2937', lineHeight: 1.35 }}>{t.text}</span>
                {t.link && (
                  <Link href={t.link} style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', flexShrink: 0 }}>Git →</Link>
                )}
              </div>
            );
          })}

          {/* Manuel görevler */}
          {manualTasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', background: doneTasks.has(t.id) ? '#F8FAFC' : 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button onClick={() => toggleDone(t.id)} style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--border)', background: doneTasks.has(t.id) ? '#10B981' : 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                {doneTasks.has(t.id) && <span style={{ color: 'white', fontSize: '0.6rem' }}>✓</span>}
              </button>
              <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 500, color: doneTasks.has(t.id) ? '#94A3B8' : '#1F2937', textDecoration: doneTasks.has(t.id) ? 'line-through' : 'none' }}>{t.text}</span>
              <button onClick={() => removeManual(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '0.75rem' }}>✕</button>
            </div>
          ))}

          {totalPending === 0 && manualTasks.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              🎉 Tüm görevler tamamlandı!
            </div>
          )}

          {/* Manuel görev ekle */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addManual()}
              placeholder="+ Manuel görev ekle..."
              style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '0.78rem', outline: 'none', background: 'var(--bg-main)' }} />
            <button onClick={addManual} style={{ padding: '0.45rem 0.75rem', borderRadius: '7px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}
