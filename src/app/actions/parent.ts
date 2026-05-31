'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function logParentCommunication(studentId: string, topic: string, message: string, isDraft: boolean = false) {
  try {
    const comm = await prisma.parentCommunication.create({
      data: {
        studentId,
        topic,
        message,
        isDraft
      }
    });
    revalidatePath('/parents');
    revalidatePath('/students/' + studentId);
    return { success: true, comm };
  } catch (error: any) {
    console.error('Veli iletişim kaydı hatası:', error);
    return { success: false, error: error.message };
  }
}

export async function markAsSent(id: string) {
  try {
    await prisma.parentCommunication.update({
      where: { id },
      data: { isDraft: false, date: new Date() }
    });
    revalidatePath('/parents');
    return { success: true };
  } catch(e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteParentCommunication(id: string) {
  try {
    await prisma.parentCommunication.delete({
      where: { id }
    });
    revalidatePath('/parents');
    return { success: true };
  } catch (error: any) {
    console.error('Veli iletişim silme hatası:', error);
    return { success: false, error: error.message };
  }
}
