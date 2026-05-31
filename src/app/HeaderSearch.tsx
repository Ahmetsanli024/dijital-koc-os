'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface StudentSuggestion {
  id: string;
  firstName: string;
  lastName: string;
}

export default function HeaderSearch({ students }: { students: StudentSuggestion[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StudentSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 0) {
      const filtered = students.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (id: string) => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    router.push(`/students/${id}`);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '400px', zIndex: 100 }}>
      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
      <input 
        type="text" 
        value={query}
        onChange={handleChange}
        placeholder="Öğrenci ismini yazıp hızlıca profiline geçin..." 
        style={{ 
          width: '100%', 
          padding: '0.65rem 1rem 0.65rem 2.5rem', 
          borderRadius: 'var(--radius-full)', 
          border: '1px solid var(--border)', 
          background: 'var(--bg-main)', 
          outline: 'none', 
          fontSize: '0.9rem', 
          color: 'var(--text-primary)',
          transition: 'var(--transition)'
        }} 
      />

      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '0.5rem 0'
        }}>
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              style={{
                width: '100%',
                padding: '0.6rem 1.2rem',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              🧑‍🎓 {s.firstName} {s.lastName}
            </button>
          ))}
        </div>
      )}
      {showDropdown && query.trim().length > 0 && suggestions.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem'
        }}>
          Öğrenci bulunamadı.
        </div>
      )}
    </div>
  );
}
