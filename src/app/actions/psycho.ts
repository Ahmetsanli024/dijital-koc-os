'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addPsychoRecord(data: { studentId: string, anxietyLevel: number, motivationLevel: number, focusLevel: number, coachNote: string }) {
  try {
    const record = await prisma.psychologicalRecord.create({
      data: {
        studentId: data.studentId,
        anxietyLevel: data.anxietyLevel,
        motivationLevel: data.motivationLevel,
        focusLevel: data.focusLevel,
        coachNote: data.coachNote,
      }
    });
    revalidatePath(`/students/${data.studentId}`);
    return { success: true, record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generatePortalToken(studentId: string) {
  try {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await prisma.student.update({
      where: { id: studentId },
      data: { portalToken: token }
    });
    revalidatePath(`/students/${studentId}`);
    return { success: true, token };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
