'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; message: string; type: ToastType }

interface ToastCtx { toast: (msg: string, type?: ToastType) => void }
const Ctx = createContext<ToastCtx>({ toast: () => {} });

const ICONS: Record<ToastType, string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
};
const COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#065F46' },
  error:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E3A8A' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '0.6rem', pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.75rem 1rem 0.75rem 0.85rem',
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontSize: '0.88rem', fontWeight: 700, color: c.text,
                maxWidth: '360px', pointerEvents: 'auto',
                animation: 'slideInRight 0.25s ease',
              }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ICONS[t.type]}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.5, fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
