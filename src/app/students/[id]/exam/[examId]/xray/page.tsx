import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import XRayClient from './XRayClient';

const prisma = new PrismaClient();

export default async function ExamXRayPage({ params }: { params: { id: string, examId: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id }
  });

  const exam = await prisma.exam.findUnique({
    where: { id: params.examId }
  });

  if (!student || !exam) {
    notFound();
  }

  return <XRayClient student={student} exam={exam} />;
}
