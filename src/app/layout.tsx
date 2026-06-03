import type { Metadata } from 'next';
import './globals.css';
import prisma from '@/lib/prisma';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import { ToastProvider } from './components/Toast';

export const metadata: Metadata = {
  title: 'Koç Ajandası',
  description: 'Yapay Zeka Destekli Koçluk Yönetim Sistemi',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [students, alerts, settings] = await Promise.all([
    prisma.student.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    }),
    prisma.psychologicalRecord.count({
      where: { OR: [{ anxietyLevel: { gt: 7 } }, { motivationLevel: { lt: 4 } }] },
    }),
    prisma.coachSettings.findUnique({ where: { id: 'default' } }),
  ]);

  const coachName  = settings?.coachName  || 'Koç';
  const coachTitle = settings?.coachTitle || 'Eğitim Koçu';
  // İsimden kısaltma: "Ahmet ŞANLI" → "AŞ"
  const initials = coachName.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <html lang="tr">
      <body style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <ToastProvider>
          <Sidebar studentCount={students.length} coachName={coachName} coachTitle={coachTitle} initials={initials} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <TopHeader students={students} notifCount={alerts} coachName={coachName} initials={initials} />
            <main style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
