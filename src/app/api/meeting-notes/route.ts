import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentId, participants, topics, decisions, parentTasks, nextMeeting } = await req.json();
    const note = await prisma.meetingNote.create({
      data: {
        studentId, participants: participants || 'Koç + Veli',
        topics: JSON.stringify(topics || []),
        decisions: decisions || null,
        parentTasks: parentTasks || null,
        nextMeeting: nextMeeting ? new Date(nextMeeting) : null,
      },
    });
    return NextResponse.json({ note });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const notes = await prisma.meetingNote.findMany({
      where: studentId ? { studentId } : {},
      orderBy: { date: 'desc' },
      include: { student: { select: { firstName: true, lastName: true } } },
    });
    return NextResponse.json({ notes: notes.map(n => ({ ...n, date: n.date.toISOString(), nextMeeting: n.nextMeeting?.toISOString() ?? null })) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
