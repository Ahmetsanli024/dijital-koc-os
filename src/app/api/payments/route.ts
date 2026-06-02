import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentId, amount, type, status, note, date } = await req.json();
    const payment = await prisma.payment.create({
      data: { studentId, amount: Number(amount), type, status, note: note || null, date: date ? new Date(date) : new Date() },
    });
    return NextResponse.json({ payment });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const payment = await prisma.payment.update({ where: { id }, data: { status } });
    return NextResponse.json({ payment });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
