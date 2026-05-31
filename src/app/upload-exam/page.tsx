import prisma from '@/lib/prisma'
import UploadExamClient from './UploadExamClient'

export default async function UploadExamPage() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: 'asc' }
  })

  return <UploadExamClient students={students} />
}
