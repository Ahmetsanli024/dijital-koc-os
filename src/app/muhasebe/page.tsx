import prisma from '@/lib/prisma';
import MuhasebeClient from './MuhasebeClient';

export default async function MuhasebePage() {
  const [payments, students] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { date: 'desc' },
      include: { student: { select: { firstName: true, lastName: true } } },
    }),
    prisma.student.findMany({ select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: 'asc' } }),
  ]);

  const totalPaid    = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'OVERDUE').reduce((s, p) => s + p.amount, 0);

  return (
    <MuhasebeClient
      payments={payments.map(p => ({ ...p, date: p.date.toISOString() }))}
      students={students}
      stats={{ totalPaid, totalPending, totalOverdue }}
    />
  );
}
