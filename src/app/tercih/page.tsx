import prisma from '@/lib/prisma';
import TercihClient from './TercihClient';

export default async function TercihPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' },
    select: {
      id: true, firstName: true, lastName: true,
      grade: true, target: true, targetSchool: true,
      targetCity: true, targetNets: true, targetDepartment: true,
      exams: {
        orderBy: { date: 'desc' }, take: 5,
        select: { id: true, name: true, totalNet: true, date: true },
      },
    },
  });

  return <TercihClient students={students as any[]} />;
}
