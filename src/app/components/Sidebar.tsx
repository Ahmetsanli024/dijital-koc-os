'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = { label: string; href: string; badge?: number };
type NavGroup = {
  id: string;
  icon: string;
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'ogrenci',
    icon: '👤',
    label: 'Koçluk Portföyü',
    defaultOpen: true,
    items: [
      { label: 'Öğrenci Listesi',         href: '/students'  },
      { label: 'Seans & Görüşme Kayıtları', href: '/sessions'  },
      { label: 'Veli İletişim Köprüsü',   href: '/parents'   },
    ],
  },
  {
    id: 'sinav',
    icon: '📊',
    label: 'Sınav Analizi',
    defaultOpen: true,
    items: [
      { label: 'Deneme Analizi (AI)', href: '/upload-exam' },
    ],
  },
  {
    id: 'program',
    icon: '📅',
    label: 'Bireysel Program',
    defaultOpen: true,
    items: [
      { label: 'Haftalık Program Hazırla', href: '/assignments' },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    label: 'Yapay Zeka Araçları',
    defaultOpen: false,
    items: [
      { label: 'LGS Okul Tahmin Motoru', href: '/lgs-simulator' },
    ],
  },
  {
    id: 'muhasebe',
    icon: '💰',
    label: 'Muhasebe',
    defaultOpen: false,
    items: [
      { label: 'Seans Ücret Takibi', href: '/muhasebe' },
    ],
  },
  {
    id: 'crm',
    icon: '📋',
    label: 'Aday & CRM',
    defaultOpen: false,
    items: [
      { label: 'Potansiyel Öğrenci Takibi', href: '/crm' },
    ],
  },
];

function NavGroupItem({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const isAnyActive = group.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'));
  const [open, setOpen] = useState(group.defaultOpen ?? isAnyActive);

  return (
    <div style={{ marginBottom: '0.25rem' }}>
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.55rem 0.75rem', borderRadius: '7px', border: 'none',
          background: open ? 'rgba(255,255,255,0.04)' : 'none',
          color: 'var(--sidebar-text)', cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = open ? 'rgba(255,255,255,0.04)' : 'none')}
      >
        <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{group.icon}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1, letterSpacing: '0.01em' }}>{group.label}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--sidebar-group-text)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
      </button>

      {/* Items */}
      {open && (
        <div style={{ marginLeft: '0.5rem', marginTop: '0.15rem', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '0.75rem' }}>
          {group.items.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem', borderRadius: '6px', marginBottom: '0.1rem',
                  fontSize: '0.82rem', fontWeight: active ? 700 : 500, textDecoration: 'none',
                  color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                  background: active ? 'var(--sidebar-active-bg)' : 'none',
                  borderLeft: active ? '2px solid var(--sidebar-active-border)' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'none'; }}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '0.05rem 0.4rem', fontSize: '0.65rem', fontWeight: 800 }}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ studentCount }: { studentCount: number }) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)', flexShrink: 0,
      background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      overflowY: 'auto', zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        background: 'var(--sidebar-header-bg)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: '1rem', flexShrink: 0,
          }}>AŞ</div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Koç Ajandası</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Ahmet ŞANLI</div>
          </div>
        </div>
        <div style={{
          marginTop: '0.85rem', padding: '0.4rem 0.75rem',
          background: 'rgba(37,99,235,0.15)', borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Aktif öğrenci</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60A5FA' }}>{studentCount}</span>
        </div>
      </div>

      {/* Dashboard link — tek başına */}
      <div style={{ padding: '0.75rem 0.75rem 0.25rem' }}>
        <DashboardLink />
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.6rem 0' }} />
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--sidebar-group-text)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.5rem', marginBottom: '0.4rem' }}>Modüller</div>
      </div>

      {/* Nav Groups */}
      <nav style={{ padding: '0 0.75rem', flex: 1, overflowY: 'auto' }}>
        {NAV_GROUPS.map(g => <NavGroupItem key={g.id} group={g} />)}
      </nav>

      {/* Alt bilgi */}
      <div style={{
        padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--sidebar-text)', fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 0.5rem', borderRadius: '6px' }}>
          <span>⚙️</span><span>Ayarlar</span>
        </Link>
        <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--sidebar-group-text)' }}>
          v2.1 • Premium Lisans
        </div>
      </div>
    </aside>
  );
}

function DashboardLink() {
  const pathname = usePathname();
  const active = pathname === '/';
  return (
    <Link href="/" style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.55rem 0.75rem', borderRadius: '7px', textDecoration: 'none',
      color: active ? 'white' : 'var(--sidebar-text)',
      background: active ? 'var(--sidebar-active-bg)' : 'none',
      fontSize: '0.85rem', fontWeight: active ? 700 : 600,
      borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
    }}>
      <span>🏠</span><span>Kontrol Paneli</span>
    </Link>
  );
}
