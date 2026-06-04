import prisma from '@/lib/prisma';
import VitrinClient from './VitrinClient';

export default async function VitrinPage() {
  const stories = await prisma.successStory.findMany({ orderBy: { createdAt: 'desc' } });
  return <VitrinClient stories={stories.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))} />;
}
