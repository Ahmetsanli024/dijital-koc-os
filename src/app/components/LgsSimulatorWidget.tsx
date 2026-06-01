'use client';

import { useState } from 'react';
import { HIGH_SCHOOLS, CITIES, calculateLgsPercentile, calculateWinProbability } from '@/lib/lgsCalculator';

export default function LgsSimulatorWidget() {
  const [score, setScore] = useState<number | ''>(450);
  const [city, setCity] = useState<string>('İstanbul');

  const filteredSchools = HIGH_SCHOOLS.filter(h => h.city === city)
    .map(h => ({
      ...h,
      probability: typeof score === 'number' ? calculateWinProbability(score, h.baseScore) : 0
    }))
    .sort((a, b) => b.probability - a.probability);

  const getProbabilityColor = (prob: number) => {
    if (prob >= 85) return '#10B981'; // Green
    if (prob >= 50) return '#F59E0B'; // Yellow
    if (prob > 0) return '#EF4444'; // Red
    return '#475569'; // Slate (No chance)
  };

  const getProbabilityText = (prob: number) => {
    if (prob >= 85) return 'Yüksek İhtimal';
    if (prob >= 50) return 'Sınırda / Rekabetçi';
    if (prob > 0) return 'Düşük İhtimal';
    return 'İmkansıza Yakın';
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.7)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '2rem',
      color: 'white',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      marginTop: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--primary)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
          🏫
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>2025 LGS Strateji & İhtimal Motoru</h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>Tahmini puana ve ile göre lise kazanma algoritmaları</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A7F3D0', fontWeight: 700 }}>Puan Giriniz (200 - 500)</label>
          <input 
            type="number" 
            min="200" 
            max="500" 
            value={score} 
            onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.5)', background: 'rgba(15, 23, 42, 0.8)', color: 'white', fontSize: '1.2rem', fontWeight: 800 }}
          />
          {typeof score === 'number' && score >= 200 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6EE7B7' }}>
              Tahmini Yüzdelik Dilim: <strong>%{calculateLgsPercentile(score)}</strong>
            </div>
          )}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A7F3D0', fontWeight: 700 }}>Hedef İl Seçiniz</label>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.5)', background: 'rgba(15, 23, 42, 0.8)', color: 'white', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          {city} İli Lise Kazanma İhtimalleri
        </h3>
        
        {filteredSchools.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredSchools.map((school, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{school.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                      Taban Puan: {school.baseScore} | Dilim: %{school.basePercentile.toFixed(2)} | Kontenjan: {school.quota}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: getProbabilityColor(school.probability) }}>
                      %{school.probability}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {getProbabilityText(school.probability)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${school.probability}%`, 
                    background: getProbabilityColor(school.probability),
                    boxShadow: `0 0 10px ${getProbabilityColor(school.probability)}`,
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}></div>
                </div>
                
                {/* Background Glow */}
                <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '150px', height: '150px', background: getProbabilityColor(school.probability), filter: 'blur(80px)', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            Bu ilde henüz veri tabanına işlenmiş bir lise bulunmamaktadır.
          </div>
        )}
      </div>
    </div>
  );
}
