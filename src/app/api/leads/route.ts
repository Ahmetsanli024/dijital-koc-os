import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, phone, grade, source, notes, followUpDate } = await req.json();
    const lead = await prisma.lead.create({
      data: { name, phone: phone || null, grade: grade || null, source: source || null, notes: notes || null, followUpDate: followUpDate ? new Date(followUpDate) : null },
    });
    return NextResponse.json({ lead });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, notes, followUpDate } = await req.json();
    const lead = await prisma.lead.update({ where: { id }, data: { ...(status && { status }), ...(notes !== undefined && { notes }), ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }) } });
    return NextResponse.json({ lead });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
