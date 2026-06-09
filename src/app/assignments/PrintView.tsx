"use client";

import React, { forwardRef } from 'react';

type PrintViewProps = {
  scheduleData: Record<string, Record<string, { q: string, t: string }>>;
  studentName: string;
  notes: string;
};

const PrintView = forwardRef<HTMLDivElement, PrintViewProps>(({ scheduleData, studentName, notes }, ref) => {
  const SUBJECTS = ['TÜRKÇE', 'MATEMATİK', 'FEN BİLİMLERİ', 'T.C. İNKILAP TARİHİ', 'İNGİLİZCE', 'DİN KÜLTÜRÜ', 'PARAGRAF'];
  const DAYS = ['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'];

  // Check if a subject has any tasks assigned in the week
  const activeSubjects = SUBJECTS.filter(sub => {
    const days = scheduleData[sub] || {};
    return Object.values(days).some(d => d.q || d.t);
  });

  if (activeSubjects.length === 0) activeSubjects.push('TÜRKÇE');

  return (
    <div ref={ref} style={{ padding: '40px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ border: '4px solid black', padding: '20px', minHeight: '1000px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid black', paddingBottom: '15px', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0' }}>HAFTALIK ÇALIŞMA PROGRAMI</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', padding: '0 20px' }}>
            <span>ÖĞRENCİ: {studentName || '...........................................'}</span>
            <span>TARİH: {new Date().toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        {/* Schedule Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', marginBottom: '30px' }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid black', padding: '12px', background: '#f0f0f0', width: '14%' }}>DERS / GÜN</th>
              {DAYS.map(day => (
                <th key={day} style={{ border: '2px solid black', padding: '12px', background: '#f0f0f0', fontSize: '14px', width: '12%' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeSubjects.map(sub => (
              <tr key={sub}>
                <td style={{ border: '2px solid black', padding: '10px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', background: '#fafafa' }}>{sub}</td>
                {DAYS.map(day => {
                  const cell = scheduleData[sub]?.[day];
                  return (
                    <td key={day} style={{ border: '2px solid black', padding: '8px', textAlign: 'center', verticalAlign: 'middle', height: '60px' }}>
                      {cell?.q ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{cell.q} Soru</div>
                          {cell.t && <div style={{ fontSize: '11px', color: '#333' }}>{cell.t}</div>}
                        </div>
                      ) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total & Checkbox Section */}
        <div style={{ border: '2px solid black', padding: '15px', marginBottom: '30px', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
            <span>HAFTALIK TOPLAM HEDEF:</span>
            <span>
              {activeSubjects.reduce((total, sub) => {
                let subTotal = 0;
                Object.values(scheduleData[sub] || {}).forEach(d => {
                  if (d.q) subTotal += parseInt(d.q) || 0;
                });
                return total + subTotal;
              }, 0)} SORU
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span><input type="checkbox" /> Program eksiksiz tamamlandı.</span>
            <span>Veli İmza: ........................</span>
          </div>
        </div>

        {/* Notes Section */}
        <div style={{ border: '2px solid black', padding: '20px', flex: 1 }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid black', paddingBottom: '8px', fontSize: '18px' }}>Koçun Notu & Değerlendirmesi:</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>{notes}</p>
        </div>

      </div>
    </div>
  );
});

PrintView.displayName = 'PrintView';

export default PrintView;
