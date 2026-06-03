import prisma from '@/lib/prisma';
import TakvimClient from './TakvimClient';

export default async function TakvimPage() {
  const [students, appointments] = await Promise.all([
    prisma.student.findMany({
      select: { id: true, firstName: true, lastName: true, grade: true },
      orderBy: { firstName: 'asc' },
    }),
    prisma.appointment.findMany({
      orderBy: { date: 'asc' },
      include: { student: { select: { id: true, firstName: true, lastName: true, grade: true } } },
    }),
  ]);

  return (
    <TakvimClient
      students={students}
      appointments={appointments.map(a => ({ ...a, date: a.date.toISOString() }))}
    />
  );
}
