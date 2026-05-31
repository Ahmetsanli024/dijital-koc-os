import type { Metadata } from "next";
import "./globals.css";
import prisma from "@/lib/prisma";
import HeaderSearch from "./HeaderSearch";

export const metadata: Metadata = {
  title: "Eğitim Koçluğu Yönetimi",
  description: "Yapay Zeka Destekli Bireysel Koçluk Sistemi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const students = await prisma.student.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: 'asc' }
  });

  return (
    <html lang="tr">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{ 
          width: '280px', 
          borderRight: '1px solid var(--border)', 
          background: 'var(--bg-card)', 
          padding: '2rem 1.5rem', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 0.5rem' }}>
            <div style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--secondary), var(--primary))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 900, 
              fontSize: '1.2rem', 
              boxShadow: 'var(--shadow-md)'
            }}>
              AŞ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Süper Koç</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '-0.1rem' }}>
                Ahmet ŞANLI
              </h2>
            </div>
          </div>
          
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', paddingLeft: '1rem' }}>Sistem Modülleri</p>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink href="/" icon="📊" text="Komuta Merkezi" />
            <NavLink href="/students" icon="🧑‍🎓" text="Öğrenci Envanteri" />
            <NavLink href="/upload-exam" icon="📸" text="Sınav Okuma (AI)" />
            <NavLink href="/assignments" icon="📝" text="Görev & Ödev" />
            <NavLink href="/sessions" icon="🤝" text="Seans Notları" />
            <NavLink href="/parents" icon="💬" text="Veli İletişimi" />
            <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', paddingLeft: '1rem' }}>İş Yönetimi</p>
            <NavLink href="/finances" icon="💰" text="Finans & Takvim" />
          </nav>
          
          <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Premium Lisans Aktif</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Versiyon 2.0.0</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Header Bar */}
          <header style={{ 
            background: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '1rem 3rem', 
            borderBottom: '1px solid var(--border)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            position: 'sticky',
            top: 0,
            zIndex: 50
          }} className="top-header">
            <HeaderSearch students={students} />
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', position: 'relative', color: 'var(--text-secondary)' }}>
                🔔
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-card)' }}></span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AŞ</div>
              </div>
            </div>
          </header>

          <div style={{ padding: '2.5rem 3rem', flex: 1 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

import Link from 'next/link';

// A simple helper component for navigation links
function NavLink({ href, icon, text }: { href: string, icon: string, text: string }) {
  return (
    <Link href={href} className="nav-link" style={{ 
      padding: '0.75rem 1rem', 
      borderRadius: 'var(--radius-md)', 
      color: 'var(--text-secondary)', 
      textDecoration: 'none', 
      fontWeight: 600, 
      fontSize: '0.95rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem',
      transition: 'var(--transition)'
    }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span> {text}
    </Link>
  );
}
