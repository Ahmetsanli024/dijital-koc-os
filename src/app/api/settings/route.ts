import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const settings = await prisma.coachSettings.upsert({
      where: { id: 'default' },
      update: { coachName: data.coachName, coachTitle: data.coachTitle, phone: data.phone || null, email: data.email || null, lgsExamDate: data.lgsExamDate, sessionFee: Number(data.sessionFee) || 0, sessionDuration: Number(data.sessionDuration) || 45 },
      create: { id: 'default', coachName: data.coachName, coachTitle: data.coachTitle, phone: data.phone || null, email: data.email || null, lgsExamDate: data.lgsExamDate, sessionFee: Number(data.sessionFee) || 0, sessionDuration: Number(data.sessionDuration) || 45 },
    });
    return NextResponse.json({ settings });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET() {
  try {
    const settings = await prisma.coachSettings.findUnique({ where: { id: 'default' } });
    return NextResponse.json({ settings });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
