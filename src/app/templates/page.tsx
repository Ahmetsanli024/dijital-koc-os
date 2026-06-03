import prisma from '@/lib/prisma';
import TemplatesClient from './TemplatesClient';

export default async function TemplatesPage() {
  const students = await prisma.student.findMany({
    select: {
      id: true, firstName: true, lastName: true, grade: true,
      parentName: true, parentPhone: true,
      exams: { orderBy: { date: 'desc' }, take: 1, select: { totalNet: true, name: true } },
    },
    orderBy: { firstName: 'asc' },
  });
  return <TemplatesClient students={students as any[]} />;
}
