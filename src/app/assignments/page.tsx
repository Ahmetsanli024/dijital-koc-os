import React from 'react';
import prisma from '@/lib/prisma';
import WizardClient from './WizardClient';

export default async function AssignmentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' },
    include: { 
      exams: { orderBy: { date: 'desc' } },
      schedules: {
        where: { status: 'ACTIVE' },
        include: { tasks: true }
      }
    }
  });

  return <WizardClient students={students} />;
}
