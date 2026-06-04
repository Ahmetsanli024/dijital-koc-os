import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const stories = await prisma.successStory.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ stories: stories.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })) });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const story = await prisma.successStory.create({ data: { studentName: data.studentName, grade: data.grade || null, startNet: data.startNet ? Number(data.startNet) : null, endNet: data.endNet ? Number(data.endNet) : null, lgsScore: data.lgsScore ? Number(data.lgsScore) : null, school: data.school, quote: data.quote || null, period: data.period || null } });
    return NextResponse.json({ story });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.successStory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
