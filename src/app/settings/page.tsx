import prisma from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  // DB'den mevcut ayarları çek
  const settings = await prisma.coachSettings.findUnique({ where: { id: 'default' } });

  return (
    <SettingsClient
      initial={{
        coachName:       settings?.coachName       || 'Ahmet ŞANLI',
        coachTitle:      settings?.coachTitle       || 'Eğitim Koçu',
        phone:           settings?.phone            || '',
        email:           settings?.email            || '',
        lgsExamDate:     settings?.lgsExamDate      || '2026-06-13',
        sessionFee:      String(settings?.sessionFee     ?? 0),
        sessionDuration: String(settings?.sessionDuration ?? 45),
      }}
    />
  );
}
