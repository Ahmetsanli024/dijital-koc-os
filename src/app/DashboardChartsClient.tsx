'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LeaderboardItem {
  id: string;
  name: string;
  solved: number;
  target: number;
}

interface ExamTrendItem {
  name: string;
  Ortalama: number;
}

export default function DashboardChartsClient({ 
  leaderboard, 
  groupExamTrend 
}: { 
  leaderboard: LeaderboardItem[]; 
  groupExamTrend: ExamTrendItem[]; 
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
      
      {/* 🚀 Liderlik Tablosu (Leaderboard) */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏆</span> Haftalık Soru Çözüm Liderliği
        </h2>
        
        {leaderboard.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Kayıtlı aktif çalışma programı bulunmuyor.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {leaderboard.map((item, index) => {
              const pct = item.target > 0 ? Math.min(Math.round((item.solved / item.target) * 100), 100) : 0;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-main)', gap: '1rem' }}>
                  <div style={{ fontWeight: 900, color: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : 'var(--text-muted)', fontSize: '1.2rem', minWidth: '24px' }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <Link href={`/students/${item.id}`} style={{ fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {item.name}
                      </Link>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                        {item.solved} / {item.target} Soru (%{pct})
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: index === 0 ? '#F59E0B' : 'var(--success)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📈 Ortalama Grup Başarı Grafiği */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📈</span> Grubun Sınavza Net Ortalaması Trendi
        </h2>
        
        {groupExamTrend.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Kayıtlı deneme sınavı verisi bulunmuyor.</p>
        ) : (
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={groupExamTrend} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis domain={[0, 90]} stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Ortalama" name="Grup Net Ortalaması" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}
