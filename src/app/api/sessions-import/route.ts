import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentId, title, content, date } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId gerekli' }, { status: 400 });

    const count = await prisma.sessionNote.count({ where: { studentId } });
    const note  = await prisma.sessionNote.create({
      data: {
        studentId,
        title:         title || 'Excel Aktarımı',
        content:       content || '',
        sessionNumber: count + 1,
        date:          date ? new Date(date) : new Date(),
      },
    });
    return NextResponse.json({ note });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
