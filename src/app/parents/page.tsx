import React from 'react';
import prisma from '@/lib/prisma';
import ParentClient from './ParentClient';

export default async function ParentsPage() {
  const students = await prisma.student.findMany({
    include: {
      parentComms: {
        orderBy: { date: 'desc' },
      },
      exams: {
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { firstName: 'asc' }
  });

  return <ParentClient students={students} />;
}
