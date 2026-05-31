import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.sessionNote.deleteMany();
  await prisma.task.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.student.deleteMany();
  
  // Create student Aras
  const aras = await prisma.student.create({
    data: {
      firstName: 'Aras',
      lastName: 'Gökdeniz',
      grade: '8. Sınıf LGS',
      target: '%5 Dilim',
      parentName: 'Ayşe Hanım',
      parentPhone: '555-000-0000',
    }
  });

  // Create student Elif
  const elif = await prisma.student.create({
    data: {
      firstName: 'Elif',
      lastName: 'Yılmaz',
      grade: '8. Sınıf LGS',
      target: 'Galatasaray Lisesi',
    }
  });

  // Create exams for Aras
  await prisma.exam.create({
    data: {
      studentId: aras.id,
      name: 'Özdebir LGS-6',
      date: new Date('2026-05-28'),
      totalNet: 71.67,
      rank: '31. Kurum / 677. Genel'
    }
  });

  await prisma.exam.create({
    data: {
      studentId: aras.id,
      name: 'Zeka Küpü Pisagor LGS-4',
      date: new Date('2026-05-26'),
      totalNet: 70.34,
      rank: '31. Kurum / 677. Genel'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
