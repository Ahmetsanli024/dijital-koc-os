import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pdfUrl, studentId, examName } = body

    if (!pdfUrl) {
      return NextResponse.json({ error: "PDF URL gerekli" }, { status: 400 })
    }

    if (!openai) {
      return NextResponse.json({
        error: "OPENAI_API_KEY ortam değişkeni tanımlı değil. Lütfen .env.local dosyasına API anahtarınızı ekleyin."
      }, { status: 500 })
    }

    // Fetch PDF as base64
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: "PDF dosyası alınamadı" }, { status: 500 })
    }
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString("base64")
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`

    // Send to OpenAI GPT-4o Vision
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sen bir eğitim koçluğu asistanısın. Sana gönderilen deneme sınavı sonuç PDF'ini analiz edeceksin.
Aşağıdaki JSON formatında yanıt ver:
{
  "examName": "Deneme adı",
  "examDate": "Tarih (DD/MM/YYYY)",
  "subjects": [
    {
      "name": "Ders adı (ör. Türkçe, Matematik, Fen Bilimleri, T.C. İnkılap Tarihi, Din Kültürü, İngilizce)",
      "correct": sayı,
      "wrong": sayı,
      "empty": sayı,
      "total": toplam soru,
      "net": (correct - wrong * 0.25) hesaplanmış,
      "topic_name": "En çok yanlış yapılan konu",
      "weak_topics": ["Yanlış/boş bırakılan konular"]
    }
  ],
  "totalNet": toplam net,
  "weakTopicsCount": toplam zayıf konu sayısı,
  "recommendation": "Ders programına öncelikli eklenmesi gereken konu önerisi"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "file",
              file: { filename: examName || "deneme.pdf", file_data: dataUrl }
            },
            {
              type: "text",
              text: `Bu PDF bir deneme sınavı sonuç belgesidir. Her ders için doğru, yanlış, boş sayılarını ve konu bazlı eksikleri tespit et. Student ID: ${studentId}`
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    })

    const result = completion.choices[0]?.message?.content
    let parsed: unknown
    try {
      parsed = JSON.parse(result || "{}")
    } catch {
      parsed = { raw: result }
    }

    return NextResponse.json({ success: true, analysis: parsed })
  } catch (err: unknown) {
    console.error("AI exam analysis error:", err)
    const message = err instanceof Error ? err.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}