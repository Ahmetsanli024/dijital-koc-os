import { PrismaClient } from '@prisma/client'
import ClientPage from './ClientPage'

const prisma = new PrismaClient()

export default async function StudentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  let student = await prisma.student.findUnique({
    where: { id: params.id },
    include: { 
      exams: { orderBy: { date: 'desc' } }, 
      sessions: { orderBy: { date: 'desc' } },
      schedules: { include: { tasks: true } },
      psychoRecords: { orderBy: { date: 'desc' } },
      badges: { orderBy: { dateAwarded: 'desc' } },
      appointments: { orderBy: { date: 'asc' } },
      books: { 
        orderBy: { createdAt: 'desc' },
        include: { tasks: true }
      }
    }
  })
  
  if (!student) {
    student = await prisma.student.findFirst({
      include: { 
        exams: { orderBy: { date: 'desc' } }, 
        sessions: { orderBy: { date: 'desc' } },
        schedules: { include: { tasks: true } },
        psychoRecords: { orderBy: { date: 'desc' } },
        badges: { orderBy: { dateAwarded: 'desc' } },
        appointments: { orderBy: { date: 'asc' } },
        books: { 
          orderBy: { createdAt: 'desc' },
          include: { tasks: true }
        }
      }
    })
  }

  if (!student) {
    return <div>No student found. Please seed the DB.</div>
  }

  // Serialize dates for client
  const serializedStudent = {
    ...student,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
    exams: student.exams.map(e => ({
      ...e,
      date: e.date.toISOString(),
      createdAt: e.createdAt.toISOString(),
    })),
    sessions: student.sessions?.map(s => ({
      ...s,
      date: s.date.toISOString()
    })) || []
  }

  return <ClientPage initialStudent={serializedStudent} />
}
