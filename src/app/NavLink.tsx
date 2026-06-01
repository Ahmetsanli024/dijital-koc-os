'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, icon, text }: { href: string, icon: string, text: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`nav-link ${isActive ? 'active' : ''}`} 
      style={{ 
        padding: '0.75rem 1.2rem', 
        borderRadius: 'var(--radius-md)', 
        color: isActive ? 'var(--secondary)' : 'var(--text-secondary)', 
        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--secondary)' : '3px solid transparent',
        textDecoration: 'none', 
        fontWeight: isActive ? 700 : 600, 
        fontSize: '0.95rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        transition: 'var(--transition)'
      }}
    >
      <span style={{ fontSize: '1.2rem', opacity: isActive ? 1 : 0.8 }}>{icon}</span> 
      <span>{text}</span>
    </Link>
  );
}
