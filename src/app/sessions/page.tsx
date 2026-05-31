import React from 'react';
import prisma from '@/lib/prisma';
import SessionClient from './SessionClient';

export default async function SessionsPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' }
  });

  return <SessionClient students={students} />;
}
