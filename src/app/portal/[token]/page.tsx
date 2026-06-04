import prisma from '@/lib/prisma';
import PortalClient from './PortalClient';

export default async function PortalPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const student = await prisma.student.findUnique({
    where: { portalToken: params.token },
    include: {
      exams:         { orderBy: { date: 'desc' }, take: 5 },
      schedules:     { include: { tasks: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      badges:        { orderBy: { dateAwarded: 'desc' } },
      psychoRecords: { orderBy: { date: 'desc' }, take: 1 },
      sessions:      { orderBy: { date: 'desc' }, take: 1, select: { id: true, date: true, title: true } },
      appointments:  { where: { status: 'SCHEDULED', date: { gte: new Date() } }, orderBy: { date: 'asc' }, take: 1 },
      checkIns:      { orderBy: { date: 'desc' }, take: 30, select: { id: true, date: true, mood: true, solvedCount: true, hardTopic: true, note: true } },
    }
  });

  if (!student) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: 'white' }}>
        <h2>Geçersiz veya süresi dolmuş portal linki. Lütfen koçunuzla iletişime geçin.</h2>
      </div>
    );
  }

  const serialized = {
    ...student,
    checkIns: student.checkIns?.map((c: any) => ({ ...c, date: c.date.toISOString() })) || [],
  };
  return <PortalClient student={serialized} />;
}
