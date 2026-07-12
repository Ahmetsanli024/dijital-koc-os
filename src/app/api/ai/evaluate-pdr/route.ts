import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pdrNoteIds, studentName, notes } = body

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ error: "PDR notları gerekli" }, { status: 400 })
    }

    if (!openai) {
      // Fallback mock response
      return NextResponse.json({
        success: true,
        evaluation: "OpenAI API anahtarı tanımlı değil. Mock değerlendirme: Öğrencide gözlemlenen davranışlar normal sınırlar içinde seyrediyor.",
        recommendation: "Düzenli seans notları alınmaya devam edilmeli ve veli ile koordinasyon sağlanmalı.",
        severity: "normal"
      })
    }

    const notesText = notes.map((n: {
      date?: string
      mood?: string
      attitude?: string
      observation?: string
      social_status?: { friends?: string; family?: string; school?: string }
    }, idx: number) => `Seans ${idx + 1} (${n.date || ""}): Ruh Hali=${n.mood}, Tutum=${n.attitude}, Gözlem=${n.observation}, Sosyal Durum: Arkadaş=${n.social_status?.friends}, Aile=${n.social_status?.family}, Okul=${n.social_status?.school}`).join("\n\n")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sen bir eğitim psikoloğusun. Aşağıda ${studentName || "öğrenci"} isimli öğrenciye ait son PDR/koçluk seans notları var.
Bu notları analiz et ve JSON formatında değerlendir:
{
  "evaluation": "Öğrencinin psikolojik durumu, motivasyon, ruh hali trendi ve risk faktörleri hakkında kısa değerlendirme",
  "recommendation": "PDR uzmanı olarak 3 somut öneri",
  "severity": "normal | attention | urgent"
}`
        },
        {
          role: "user",
          content: notesText
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    })

    const result = completion.choices[0]?.message?.content ?? ""
    let parsed: { evaluation?: string; recommendation?: string; severity?: string }
    try {
      parsed = JSON.parse(result || "{}")
    } catch {
      parsed = { evaluation: result || "Değerlendirme oluşturulamadı.", recommendation: "", severity: "normal" }
    }

    return NextResponse.json({ success: true, ...parsed })
  } catch (err: unknown) {
    console.error("PDR evaluation error:", err)
    const message = err instanceof Error ? err.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}