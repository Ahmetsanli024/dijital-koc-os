import React from 'react';
import prisma from '@/lib/prisma';
import SessionClient from './SessionClient';

export default async function SessionsPage() {
  const [students, sessions] = await Promise.all([
    prisma.student.findMany({ orderBy: { firstName: 'asc' } }),
    prisma.sessionNote.findMany({
      orderBy: { date: 'desc' },
      include: { student: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  return (
    <SessionClient
      students={students}
      sessions={sessions.map(s => ({ ...s, date: s.date.toISOString() }))}
    />
  );
}
