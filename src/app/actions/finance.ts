'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addFinanceRecord(data: { studentId: string, title: string, amount: number, type: string, status: string }) {
  try {
    const record = await prisma.financeRecord.create({
      data: {
        studentId: data.studentId,
        title: data.title,
        amount: data.amount,
        type: data.type,
        status: data.status,
      }
    });
    revalidatePath('/finances');
    return { success: true, record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addAppointment(data: { studentId: string, title: string, date: Date, durationMin: number }) {
  try {
    const appointment = await prisma.appointment.create({
      data: {
        studentId: data.studentId,
        title: data.title,
        date: data.date,
        durationMin: data.durationMin,
      }
    });
    revalidatePath('/finances');
    return { success: true, appointment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFinanceRecord(id: string) {
  try {
    await prisma.financeRecord.delete({ where: { id } });
    revalidatePath('/finances');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/finances');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
