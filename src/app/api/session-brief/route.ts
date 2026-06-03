import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: 'studentId gerekli' }, { status: 400 });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        exams:         { orderBy: { date: 'desc' }, take: 3 },
        sessions:      { orderBy: { date: 'desc' }, take: 2 },
        schedules:     { where: { status: 'ACTIVE' }, include: { tasks: true }, take: 1 },
        psychoRecords: { orderBy: { date: 'desc' }, take: 1 },
      },
    });

    if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });

    // ── Hesaplamalar ─────────────────────────────────────────────
    const lastExam   = student.exams[0];
    const prevExam   = student.exams[1];
    const netTrend   = lastExam && prevExam ? +(lastExam.totalNet - prevExam.totalNet).toFixed(1) : null;

    const activeSched    = student.schedules[0];
    const totalTasks     = activeSched?.tasks?.length || 0;
    const doneTasks      = activeSched?.tasks?.filter(t => t.isCompleted).length || 0;
    const programPct     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : null;
    const openTaskCount  = totalTasks - doneTasks;

    const lastSession    = student.sessions[0];
    const prevSession    = student.sessions[1];
    const lastPsycho     = student.psychoRecords[0];

    // ── AI Önerisi ──────────────────────────────────────────────
    let aiSuggestion = '';
    if (process.env.GEMINI_API_KEY && lastExam) {
      try {
        const prompt = `Türk eğitim koçusun. Kısa ve net bir seans başlangıç önerisi ver.
Öğrenci: ${student.firstName} ${student.lastName} / ${student.grade}
Son sınav neti: ${lastExam.totalNet} (${netTrend !== null ? (netTrend > 0 ? '+' : '') + netTrend + ' değişim' : 'ilk sınav'})
Program tamamlama: ${programPct !== null ? '%' + programPct : 'program yok'}
Motivasyon: ${lastPsycho?.motivationLevel ?? 'bilinmiyor'}/10
Son seans notu: ${lastSession?.content?.slice(0, 150) ?? 'yok'}

Maks 2 cümle, doğrudan koça tavsiye: "Bu seansta ..." diye başla.`;

        const resp = await ai.models.generateContent({
          model: 'gemini-flash-lite-latest',
          contents: prompt,
        });
        aiSuggestion = resp.text?.trim() || '';
      } catch { /* AI hatası sessizce geç */ }
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        target: student.target,
      },
      lastExam:    lastExam ? { name: lastExam.name, net: lastExam.totalNet, trend: netTrend } : null,
      program:     { pct: programPct, openTasks: openTaskCount, total: totalTasks },
      lastSession: lastSession ? {
        date:    lastSession.date,
        title:   lastSession.title,
        summary: lastSession.content?.slice(0, 180) ?? '',
      } : null,
      psycho:      lastPsycho ? {
        motivation: lastPsycho.motivationLevel,
        anxiety:    lastPsycho.anxietyLevel,
      } : null,
      aiSuggestion,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
