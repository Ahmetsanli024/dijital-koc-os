import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentId, mood, solvedCount, hardTopic, note } = await req.json();
    if (!studentId || !mood) return NextResponse.json({ error: 'studentId ve mood gerekli' }, { status: 400 });

    // Bugün zaten check-in yapıldı mı?
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const existing = await prisma.dailyCheckIn.findFirst({
      where: { studentId, date: { gte: startOfDay } },
    });
    if (existing) {
      // Güncelle
      const updated = await prisma.dailyCheckIn.update({
        where: { id: existing.id },
        data: { mood, solvedCount: solvedCount || 0, hardTopic: hardTopic || null, note: note || null },
      });
      return NextResponse.json({ checkIn: updated, updated: true });
    }

    const checkIn = await prisma.dailyCheckIn.create({
      data: { studentId, mood, solvedCount: solvedCount || 0, hardTopic: hardTopic || null, note: note || null },
    });
    return NextResponse.json({ checkIn, updated: false });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '7');

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: studentId ? { studentId } : {},
      orderBy: { date: 'desc' },
      take: limit,
      include: { student: { select: { firstName: true, lastName: true } } },
    });
    return NextResponse.json({ checkIns: checkIns.map(c => ({ ...c, date: c.date.toISOString() })) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
