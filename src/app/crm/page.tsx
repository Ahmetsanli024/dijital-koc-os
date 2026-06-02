import prisma from '@/lib/prisma';
import CrmClient from './CrmClient';

export default async function CrmPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  return <CrmClient leads={leads.map(l => ({ ...l, createdAt: l.createdAt.toISOString(), followUpDate: l.followUpDate?.toISOString() ?? null }))} />;
}
