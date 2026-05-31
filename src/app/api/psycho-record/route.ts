import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const body = await req.json();

    if (action === 'generateToken') {
      const { studentId } = body;
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await prisma.student.update({
        where: { id: studentId },
        data: { portalToken: token }
      });
      return NextResponse.json({ success: true, token });
    }

    const { studentId, anxietyLevel, motivationLevel, focusLevel, coachNote } = body;
    
    if (!studentId) {
      return NextResponse.json({ error: 'Öğrenci kimliği eksik.' }, { status: 400 });
    }

    const record = await prisma.psychologicalRecord.create({
      data: {
        studentId,
        anxietyLevel,
        motivationLevel,
        focusLevel,
        coachNote
      }
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Psycho API Hatası:', error);
    return NextResponse.json({ error: 'İşlem başarısız oldu.' }, { status: 500 });
  }
}
