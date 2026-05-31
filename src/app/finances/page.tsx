import prisma from '@/lib/prisma';
import FinanceClient from './FinanceClient';

export default async function FinancesPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' },
    include: {
      finances: { orderBy: { date: 'desc' } },
      appointments: { orderBy: { date: 'asc' } },
      sessions: { orderBy: { date: 'desc' } },
      exams: { orderBy: { date: 'desc' } },
      schedules: { include: { tasks: true } }
    }
  });

  return <FinanceClient students={students} />;
}
