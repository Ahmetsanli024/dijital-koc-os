'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ── Seans Notu Kaydet ─────────────────────────────────────────
export async function createSessionNote(data: {
  studentId: string;
  title: string;
  content: string;
  weeklyAnxiety?: number;
  weeklyMotivation?: number;
  weeklyFocus?: number;
  maturityScore?: number;
  plannedQuestions?: number;
  solvedQuestions?: number;
  parentFeedback?: string;
  timeManagement?: string;
}) {
  try {
    if (!data.studentId || !data.title || !data.content) {
      return { success: false, error: 'Öğrenci, başlık ve içerik zorunludur.' };
    }

    const count = await prisma.sessionNote.count({ where: { studentId: data.studentId } });

    const note = await prisma.sessionNote.create({
      data: {
        studentId:        data.studentId,
        title:            data.title,
        content:          data.content,
        sessionNumber:    count + 1,
        weeklyAnxiety:    data.weeklyAnxiety    ?? null,
        weeklyMotivation: data.weeklyMotivation ?? null,
        weeklyFocus:      data.weeklyFocus      ?? null,
        maturityScore:    data.maturityScore    ?? null,
        plannedQuestions: data.plannedQuestions ?? null,
        solvedQuestions:  data.solvedQuestions  ?? null,
        parentFeedback:   data.parentFeedback   ?? null,
        timeManagement:   data.timeManagement   ?? null,
      },
    });

    revalidatePath('/sessions');
    revalidatePath('/students/' + data.studentId);
    revalidatePath('/');
    return { success: true, note };
  } catch (e: any) {
    console.error('createSessionNote hata:', e);
    return { success: false, error: e.message };
  }
}

// ── Seans Notu Sil ────────────────────────────────────────────
export async function deleteSessionNote(id: string) {
  try {
    const note = await prisma.sessionNote.delete({ where: { id } });
    revalidatePath('/sessions');
    revalidatePath('/students/' + note.studentId);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Randevu Ekle ─────────────────────────────────────────────
export async function createAppointment(data: {
  studentId: string;
  title: string;
  date: string;
  durationMin?: number;
}) {
  try {
    if (!data.studentId || !data.date) {
      return { success: false, error: 'Öğrenci ve tarih zorunludur.' };
    }
    const appt = await prisma.appointment.create({
      data: {
        studentId:   data.studentId,
        title:       data.title || 'Koçluk Seansı',
        date:        new Date(data.date),
        durationMin: data.durationMin ?? 45,
        status:      'SCHEDULED',
      },
    });
    revalidatePath('/');
    revalidatePath('/sessions');
    return { success: true, appt };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Randevu Tamamla ──────────────────────────────────────────
export async function completeAppointment(id: string) {
  try {
    await prisma.appointment.update({ where: { id }, data: { status: 'COMPLETED' } });
    revalidatePath('/');
    revalidatePath('/sessions');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Randevu İptal ────────────────────────────────────────────
export async function cancelAppointment(id: string) {
  try {
    await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
    revalidatePath('/');
    revalidatePath('/sessions');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Randevu Sil ──────────────────────────────────────────────
export async function deleteAppointment(id: string) {
  try {
    await prisma.appointment.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/sessions');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
