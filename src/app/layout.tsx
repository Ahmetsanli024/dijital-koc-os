import type { Metadata } from 'next';
import './globals.css';
import prisma from '@/lib/prisma';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

export const metadata: Metadata = {
  title: 'Koç Ajandası — Ahmet ŞANLI',
  description: 'Yapay Zeka Destekli Koçluk Yönetim Sistemi',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [students, alerts] = await Promise.all([
    prisma.student.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    }),
    prisma.psychologicalRecord.count({
      where: { OR: [{ anxietyLevel: { gt: 7 } }, { motivationLevel: { lt: 4 } }] },
    }),
  ]);

  return (
    <html lang="tr">
      <body style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>

        {/* ── Sidebar ── */}
        <Sidebar studentCount={students.length} />

        {/* ── İçerik Alanı ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* ── Üst Header ── */}
          <TopHeader students={students} notifCount={alerts} />

          {/* ── Sayfa İçeriği ── */}
          <main style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
