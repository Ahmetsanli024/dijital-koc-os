import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentId, title, targetValue, currentValue, unit, deadline } = await req.json();
    const goal = await prisma.studentGoal.create({
      data: { studentId, title, targetValue: Number(targetValue), currentValue: Number(currentValue || 0), unit: unit || 'net', deadline: deadline ? new Date(deadline) : null },
    });
    return NextResponse.json({ goal });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const { id, currentValue, achieved } = await req.json();
    const goal = await prisma.studentGoal.update({
      where: { id },
      data: { ...(currentValue !== undefined && { currentValue: Number(currentValue) }), ...(achieved !== undefined && { achieved }) },
    });
    return NextResponse.json({ goal });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.studentGoal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
