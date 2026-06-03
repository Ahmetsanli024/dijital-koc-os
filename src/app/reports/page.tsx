import prisma from '@/lib/prisma';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' },
    include: {
      exams:         { orderBy: { date: 'desc' } },
      sessions:      { orderBy: { date: 'desc' } },
      psychoRecords: { orderBy: { date: 'desc' }, take: 8 },
      schedules:     { include: { tasks: true }, orderBy: { startDate: 'desc' }, take: 4 },
    },
  });

  return (
    <ReportsClient
      students={students.map(s => ({
        ...s,
        exams:         s.exams.map(e  => ({ ...e, date: e.date.toISOString() })),
        sessions:      s.sessions.map(se => ({ ...se, date: se.date.toISOString() })),
        psychoRecords: s.psychoRecords.map(p => ({ ...p, date: p.date.toISOString() })),
        schedules:     s.schedules.map(sc => ({
          ...sc,
          startDate: sc.startDate.toISOString(),
          endDate:   sc.endDate.toISOString(),
          createdAt: sc.createdAt.toISOString(),
        })),
      }))}
    />
  );
}
