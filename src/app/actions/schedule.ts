'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSchedule(studentId: string, tasksData: any[]) {
  try {
    // End any active schedule first
    await prisma.schedule.updateMany({
      where: { studentId, status: 'ACTIVE' },
      data: { status: 'COMPLETED', endDate: new Date() }
    });

    // Create new schedule
    const schedule = await prisma.schedule.create({
      data: {
        studentId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        status: 'ACTIVE',
        tasks: {
          create: tasksData.map(t => ({
            subject: t.subject,
            day: t.day,
            topic: t.topic,
            questionCount: t.questionCount || 0,
            isCompleted: false
          }))
        }
      }
    });

    revalidatePath('/assignments');
    revalidatePath('/students/' + studentId);
    return { success: true, schedule };
  } catch (error: any) {
    console.error('Schedule creation error:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted }
    });
    
    // Also fetch the student ID so we can revalidate
    const schedule = await prisma.schedule.findUnique({
      where: { id: task.scheduleId },
      select: { studentId: true }
    });
    
    if (schedule) {
      revalidatePath('/students/' + schedule.studentId);
    }
    
    return { success: true, task };
  } catch (error: any) {
    console.error('Task update error:', error);
    return { success: false, error: error.message };
  }
}

export async function completeSchedule(scheduleId: string) {
  try {
    const sched = await prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: 'COMPLETED' }
    });
    revalidatePath('/students/' + sched.studentId);
    return { success: true };
  } catch(e: any) {
    return { success: false, error: e.message };
  }
}
