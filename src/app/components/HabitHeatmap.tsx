'use client';

interface Schedule { startDate: string; tasks: { day: string; isCompleted: boolean; questionCount: number; solvedQuestions: number }[] }

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const DAY_MAP: Record<string, number> = { 'PAZAR':0,'PAZARTESİ':1,'SALI':2,'ÇARŞAMBA':3,'PERŞEMBE':4,'CUMA':5,'CUMARTESİ':6 };

export default function HabitHeatmap({ schedules }: { schedules: Schedule[] }) {
  // Son 12 hafta oluştur
  const today  = new Date();
  const weeks: { startDate: Date; days: { date: Date; completion: number | null }[] }[] = [];

  for (let w = 11; w >= 0; w--) {
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 - w * 7); // bu haftanın pazartesisi
    const days = Array.from({ length: 7 }, (_, d) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + d);
      return { date, completion: null as number | null };
    });
    weeks.push({ startDate: monday, days });
  }

  // Programlardan tamamlama verisini döşe
  schedules.forEach(sch => {
    const schStart = new Date(sch.startDate);
    sch.tasks.forEach(task => {
      const dayIdx = DAY_MAP[task.day.toUpperCase()] ?? -1;
      if (dayIdx < 0) return;
      const taskDate = new Date(schStart);
      taskDate.setDate(schStart.getDate() + ((dayIdx - schStart.getDay() + 7) % 7));

      // Tarihe göre doğru hücreyi bul
      weeks.forEach(wk => {
        wk.days.forEach(cell => {
          if (cell.date.toDateString() === taskDate.toDateString()) {
            const pct = task.questionCount > 0 ? Math.round((task.solvedQuestions / task.questionCount) * 100) : (task.isCompleted ? 100 : 0);
            cell.completion = cell.completion === null ? pct : Math.round((cell.completion + pct) / 2);
          }
        });
      });
    });
  });

  const getColor = (val: number | null, isFuture: boolean) => {
    if (isFuture) return '#F1F5F9';
    if (val === null) return '#E2E8F0';
    if (val >= 80) return '#166534';
    if (val >= 60) return '#16A34A';
    if (val >= 40) return '#4ADE80';
    if (val >= 1)  return '#BBF7D0';
    return '#FEE2E2'; // 0 = red (vardı ama yapmadı)
  };

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', overflow: 'hidden' }}>
      <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.75rem' }}>📊 Çalışma Alışkanlığı Haritası</div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateRows: 'auto repeat(7, 14px)', gridTemplateColumns: `28px repeat(${weeks.length}, 14px)`, gap: '3px', minWidth: 'max-content' }}>
          {/* Boş köşe */}
          <div />
          {/* Hafta numaraları */}
          {weeks.map((wk, wi) => (
            <div key={wi} style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '14px' }}>
              {wi % 3 === 0 ? wk.startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }).replace(' ', '\n') : ''}
            </div>
          ))}
          {/* Gün satırları */}
          {DAYS_TR.map((dayLabel, di) => (
            <>
              <div key={`label-${di}`} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: '14px', display: 'flex', alignItems: 'center', paddingRight: '4px' }}>{dayLabel}</div>
              {weeks.map((wk, wi) => {
                const cell      = wk.days[di];
                const isFuture  = cell.date > today;
                const color     = getColor(cell.completion, isFuture);
                const title     = isFuture ? 'Gelecek' : cell.completion === null ? 'Veri yok' : `%${cell.completion} tamamlandı`;
                return (
                  <div key={`${wi}-${di}`} title={`${cell.date.toLocaleDateString('tr-TR')} — ${title}`}
                    style={{ width: '14px', height: '14px', borderRadius: '3px', background: color, cursor: 'default' }} />
                );
              })}
            </>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.65rem', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
        <span>Az</span>
        {['#FEE2E2','#BBF7D0','#4ADE80','#16A34A','#166534'].map(c => (
          <div key={c} style={{ width: '12px', height: '12px', borderRadius: '2px', background: c }} />
        ))}
        <span>Çok</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#E2E8F0', borderRadius: '2px', verticalAlign: 'middle', marginRight: '3px' }} />Program yok</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#FEE2E2', borderRadius: '2px', verticalAlign: 'middle', marginRight: '3px' }} />Yapılmadı</span>
        </div>
      </div>
    </div>
  );
}
