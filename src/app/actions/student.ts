'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getStudents() {
  return await prisma.student.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function addStudent(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const grade = formData.get('grade') as string
  const target = formData.get('target') as string
  const parentName = formData.get('parentName') as string
  const parentPhone = formData.get('parentPhone') as string
  const school = formData.get('school') as string || ''
  const field = formData.get('field') as string || ''
  const targetSchool = formData.get('targetSchool') as string || ''
  const targetDepartment = formData.get('targetDepartment') as string || ''
  const targetCity = formData.get('targetCity') as string || ''
  const targetNets = formData.get('targetNets') as string || ''
  const sinavzaLink = formData.get('sinavzaLink') as string || ''
  const totalTargetSessions = parseInt(formData.get('totalTargetSessions') as string) || 36

  await prisma.student.create({
    data: {
      firstName,
      lastName,
      grade,
      target,
      parentName,
      parentPhone,
      school,
      field,
      targetSchool,
      targetDepartment,
      targetCity,
      targetNets,
      sinavzaLink,
      totalTargetSessions
    }
  })

  revalidatePath('/students')
  revalidatePath('/')
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({
    where: { id }
  })
  
  revalidatePath('/students')
  revalidatePath('/')
}

// Direkt obje ile güncelleme (öğrenme stili vb. için)
export async function updateStudentField(id: string, data: Record<string, any>) {
  try {
    await prisma.student.update({ where: { id }, data });
    revalidatePath('/students/' + id);
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateStudent(id: string, formData: FormData | Record<string, any>) {
  // Eğer plain object geldiyse (learningStyle gibi) direkt güncelle
  if (!(formData instanceof FormData)) {
    return updateStudentField(id, formData);
  }
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const grade = formData.get('grade') as string
  const target = formData.get('target') as string
  const parentName = formData.get('parentName') as string
  const parentPhone = formData.get('parentPhone') as string
  const school = formData.get('school') as string || ''
  const field = formData.get('field') as string || ''
  const targetSchool = formData.get('targetSchool') as string || ''
  const targetDepartment = formData.get('targetDepartment') as string || ''
  const targetCity = formData.get('targetCity') as string || ''
  const targetNets = formData.get('targetNets') as string || ''
  const sinavzaLink = formData.get('sinavzaLink') as string || ''
  const totalTargetSessions = parseInt(formData.get('totalTargetSessions') as string) || 36

  await prisma.student.update({
    where: { id },
    data: {
      firstName,
      lastName,
      grade,
      target,
      parentName,
      parentPhone,
      school,
      field,
      targetSchool,
      targetDepartment,
      targetCity,
      targetNets,
      sinavzaLink,
      totalTargetSessions
    }
  })

  revalidatePath(`/students/${id}`)
  revalidatePath('/students')
  revalidatePath('/')
}

export async function addSession(studentId: string, formData: FormData) {
  const content = formData.get('content') as string
  const title = formData.get('title') as string || 'Genel Değerlendirme'
  const sessionNumber = parseInt(formData.get('sessionNumber') as string) || undefined
  const plannedQuestions = parseInt(formData.get('plannedQuestions') as string) || null
  const solvedQuestions = parseInt(formData.get('solvedQuestions') as string) || null
  const maturityScore = parseInt(formData.get('maturityScore') as string) || null
  const weeklyAnxiety = parseInt(formData.get('weeklyAnxiety') as string) || null
  const weeklyMotivation = parseInt(formData.get('weeklyMotivation') as string) || null
  const weeklyFocus = parseInt(formData.get('weeklyFocus') as string) || null
  const parentFeedback = formData.get('parentFeedback') as string || null
  const timeManagement = formData.get('timeManagement') as string || null

  await prisma.sessionNote.create({
    data: {
      studentId,
      title,
      content,
      sessionNumber,
      plannedQuestions,
      solvedQuestions,
      maturityScore,
      weeklyAnxiety,
      weeklyMotivation,
      weeklyFocus,
      parentFeedback,
      timeManagement,
      date: new Date()
    }
  })

  revalidatePath(`/students/${studentId}`)
  revalidatePath('/')
}

export async function deleteSession(id: string, studentId: string) {
  await prisma.sessionNote.delete({
    where: { id }
  })
  
  revalidatePath(`/students/${studentId}`)
  revalidatePath('/')
}

// Book Library Actions
export async function addStudentBook(studentId: string, title: string, publisher: string, difficulty: string, totalPages: number) {
  await prisma.book.create({
    data: {
      studentId,
      title,
      publisher,
      difficulty,
      totalPages,
      completedPages: 0
    }
  })
  revalidatePath(`/students/${studentId}`)
}

export async function deleteBook(id: string, studentId: string) {
  await prisma.book.delete({
    where: { id }
  })
  revalidatePath(`/students/${studentId}`)
}

export async function updateBookProgress(id: string, studentId: string, completedPages: number) {
  await prisma.book.update({
    where: { id },
    data: { completedPages }
  })
  revalidatePath(`/students/${studentId}`)
}

// Task (Homework) Actions
export async function updateTaskStatus(taskId: string, studentId: string, status: string, solvedQuestions: number, pagesRangeToAdd: number = 0) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      solvedQuestions,
      isCompleted: status === 'COMPLETED'
    },
    include: {
      book: true
    }
  })

  // Update linked book pages progress if completed
  if (status === 'COMPLETED' && task.bookId) {
    let pages = pagesRangeToAdd;
    if (pages === 0 && task.pagesRange) {
      // Try to parse page range like "12-25" or "12 - 25"
      const match = task.pagesRange.match(/(\d+)\s*-\s*(\d+)/)
      if (match) {
        const start = parseInt(match[1])
        const end = parseInt(match[2])
        pages = Math.abs(end - start) + 1
      }
    }

    if (pages > 0 && task.book) {
      const newCompleted = Math.min(task.book.completedPages + pages, task.book.totalPages)
      await prisma.book.update({
        where: { id: task.bookId },
        data: { completedPages: newCompleted }
      })
    }
  }

  revalidatePath(`/students/${studentId}`)
  revalidatePath('/')
}

export async function rolloverTask(taskId: string, studentId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      schedule: true
    }
  })

  if (!task) return;

  // Mark current task as PARTIAL
  await prisma.task.update({
    where: { id: taskId },
    data: { status: 'PARTIAL' }
  })

  // Find next week's schedule
  let nextSchedule = await prisma.schedule.findFirst({
    where: {
      studentId,
      startDate: {
        gt: task.schedule.startDate
      }
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  // If no next schedule exists, create one starting 7 days after the current schedule
  if (!nextSchedule) {
    const nextStart = new Date(task.schedule.startDate);
    nextStart.setDate(nextStart.getDate() + 7);
    const nextEnd = new Date(task.schedule.endDate);
    nextEnd.setDate(nextEnd.getDate() + 7);

    nextSchedule = await prisma.schedule.create({
      data: {
        studentId,
        startDate: nextStart,
        endDate: nextEnd,
        status: 'ACTIVE'
      }
    });
  }

  // Create duplicate task in the next schedule
  await prisma.task.create({
    data: {
      scheduleId: nextSchedule.id,
      subject: task.subject,
      day: task.day,
      topic: `${task.topic} (Devam)`,
      questionCount: Math.max(task.questionCount - task.solvedQuestions, 10),
      status: 'PENDING',
      bookId: task.bookId,
      pagesRange: task.pagesRange
    }
  })

  revalidatePath(`/students/${studentId}`)
  revalidatePath('/')
}

