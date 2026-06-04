import prisma from '@/lib/prisma';
import SozlesmeClient from './SozlesmeClient';

export default async function SozlesmePage() {
  const [students, settings] = await Promise.all([
    prisma.student.findMany({ select: { id: true, firstName: true, lastName: true, grade: true, parentName: true, parentPhone: true, target: true, targetSchool: true }, orderBy: { firstName: 'asc' } }),
    prisma.coachSettings.findUnique({ where: { id: 'default' } }),
  ]);
  return <SozlesmeClient students={students} settings={settings} />;
}
