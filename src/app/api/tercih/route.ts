import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tercih listesini öğrenci notları alanına JSON olarak kaydet
export async function POST(req: Request) {
  try {
    const { studentId, list, estimatedScore } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId zorunlu' }, { status: 400 });

    const payload = JSON.stringify({ tercihList: list, estimatedScore, savedAt: new Date().toISOString() });

    await prisma.student.update({
      where: { id: studentId },
      data: { notes: payload },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: 'studentId zorunlu' }, { status: 400 });

    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { notes: true } });
    if (!student?.notes) return NextResponse.json({ list: [], estimatedScore: null });

    try {
      const parsed = JSON.parse(student.notes);
      return NextResponse.json({ list: parsed.tercihList || [], estimatedScore: parsed.estimatedScore });
    } catch {
      return NextResponse.json({ list: [], estimatedScore: null });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
