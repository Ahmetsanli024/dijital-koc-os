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
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Keyboard shortcut listener to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName;
      const isTyping = activeEl === 'INPUT' || activeEl === 'TEXTAREA' || document.activeElement?.getAttribute('contenteditable') === 'true';
      
      if (
        (e.key === 'k' && (e.ctrlKey || e.metaKey)) ||
        (e.key === '/' && !isTyping)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex].id);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0].id);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (id: string) => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    router.push(`/students/${id}`);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '400px', zIndex: 100 }}>
      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}>🔍</span>
      <input 
        ref={inputRef}
        type="text" 
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.trim().length > 0) setShowDropdown(true);
        }}
        placeholder="Öğrenci arayın..." 
        style={{ 
          width: '100%', 
          padding: '0.65rem 3rem 0.65rem 2.5rem', 
          borderRadius: 'var(--radius-full)', 
          border: '1px solid var(--border)', 
          background: 'var(--bg-card)', 
          outline: 'none', 
          fontSize: '0.9rem', 
          color: 'var(--text-primary)',
          transition: 'var(--transition)',
          boxShadow: 'var(--shadow-sm)'
        }} 
      />
      <span style={{
        position: 'absolute',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-main)',
        border: '1px solid var(--border)',
        padding: '0.1rem 0.4rem',
        borderRadius: '4px',
        pointerEvents: 'none',
        fontWeight: 700,
        boxShadow: 'var(--shadow-sm)'
      }}>
        /
      </span>

      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '120%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '0.5rem 0',
          borderTop: '2px solid var(--primary)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {suggestions.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              style={{
                width: '100%',
                padding: '0.6rem 1.2rem',
                background: idx === activeIndex ? 'var(--bg-card-hover)' : 'none',
                border: 'none',
                textAlign: 'left',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'block',
                transition: 'background 0.15s'
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              🧑‍🎓 {s.firstName} {s.lastName}
            </button>
          ))}
        </div>
      )}
      {showDropdown && query.trim().length > 0 && suggestions.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '120%',
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
