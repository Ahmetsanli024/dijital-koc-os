import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function GET() {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 86_400_000);

    const students = await prisma.student.findMany({
      include: {
        exams:         { orderBy: { date: 'desc' }, take: 3 },
        sessions:      { orderBy: { date: 'desc' }, take: 1 },
        psychoRecords: { orderBy: { date: 'desc' }, take: 1 },
        schedules:     { where: { status: 'ACTIVE' }, include: { tasks: true } },
      },
    });

    // ── Veri analizi ──────────────────────────────────────────
    const insights: string[] = [];

    students.forEach(s => {
      const name = `${s.firstName} ${s.lastName}`;
      const exams = s.exams;
      const lastSession = s.sessions[0];
      const psycho = s.psychoRecords[0];
      const schedule = s.schedules[0];

      // Net düşüşü
      if (exams.length >= 2 && exams[0].totalNet < exams[1].totalNet - 5) {
        insights.push(`${name}: Net düşüşü (${exams[1].totalNet.toFixed(1)} → ${exams[0].totalNet.toFixed(1)})`);
      }

      // Pasif öğrenci
      if (!lastSession || (today.getTime() - new Date(lastSession.date).getTime()) / 86_400_000 > 10) {
        insights.push(`${name}: ${lastSession ? '10+ gün' : 'hiç'} seans yapılmadı`);
      }

      // Düşük motivasyon
      if (psycho && psycho.motivationLevel < 4) {
        insights.push(`${name}: Motivasyon düşük (${psycho.motivationLevel}/10)`);
      }

      // Düşük program tamamlama
      if (schedule) {
        const tasks = schedule.tasks;
        const done = tasks.filter(t => t.isCompleted).length;
        const pct = tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0;
        if (pct < 40 && tasks.length > 0) {
          insights.push(`${name}: Program tamamlama çok düşük (%${pct})`);
        }
      }
    });

    if (!process.env.GEMINI_API_KEY || insights.length === 0) {
      return NextResponse.json({ insights: insights.slice(0, 5), aiSummary: null });
    }

    // ── AI Özeti ──────────────────────────────────────────────
    const prompt = `Eğitim koçusun. Bu hafta tespit edilen önemli durumlar:
${insights.join('\n')}

Bu bilgilere göre koça kısa, pratik, motive edici bir haftalık değerlendirme yaz.
- Maksimum 3 cümle
- Acil olanları öne çıkar
- "Bu hafta..." diye başla
- Türkçe, doğrudan koça seslenen bir ton`;

    const resp = await ai.models.generateContent({ model: 'gemini-flash-lite-latest', contents: prompt });
    const aiSummary = resp.text?.trim() || null;

    return NextResponse.json({ insights: insights.slice(0, 6), aiSummary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
