'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addExam(
  studentId: string, 
  name: string, 
  totalNet: number, 
  totalCorrect?: number, 
  totalIncorrect?: number, 
  totalBlank?: number, 
  rank?: string, 
  rawText?: string, 
  examType: string = "SINGLE",
  subjectDetails?: string
) {
  // Güvenlik: Tüm sayısal değerleri kontrol et, NaN'i sıfıra çevir
  const safeNet = Number.isFinite(totalNet) ? totalNet : 0;
  const safeCorrect = (totalCorrect !== undefined && totalCorrect !== null && Number.isFinite(totalCorrect)) ? totalCorrect : 0;
  const safeIncorrect = (totalIncorrect !== undefined && totalIncorrect !== null && Number.isFinite(totalIncorrect)) ? totalIncorrect : 0;
  const safeBlank = (totalBlank !== undefined && totalBlank !== null && Number.isFinite(totalBlank)) ? totalBlank : 0;
  const safeName = (name && name.trim() !== '') ? name.trim() : 'İsimsiz Sınav';
  const safeExamType = (examType === 'MERGED' || examType === 'SINGLE') ? examType : 'SINGLE';

  try {
    const exam = await prisma.exam.create({
      data: {
        studentId,
        name: safeName,
        totalNet: safeNet,
        totalCorrect: safeCorrect,
        totalIncorrect: safeIncorrect,
        totalBlank: safeBlank,
        rank: rank || '-',
        rawText: rawText || null,
        subjectDetails: subjectDetails || null,
        examType: safeExamType,
        date: new Date()
      }
    });

    revalidatePath(`/students/${studentId}`);
    revalidatePath('/upload-exam');
    return { success: true, examId: exam.id };
  } catch (error: any) {
    console.error('addExam HATA:', error);
    return { success: false, error: error.message };
  }
}

export async function saveExamAiAnalysis(examId: string, aiSummary: string, aiTopics: string) {
  try {
    await prisma.exam.update({
      where: { id: examId },
      data: {
        aiSummary,
        aiTopics
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error('saveExamAiAnalysis HATA:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteExam(examId: string, studentId: string) {
  try {
    await prisma.exam.delete({
      where: { id: examId }
    });
    revalidatePath(`/students/${studentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('deleteExam HATA:', error);
    return { success: false, error: error.message };
  }
}
