import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, studentName, parentName, customContext } = body

    if (!topic) {
      return NextResponse.json({ error: "Konu (topic) gerekli" }, { status: 400 })
    }

    if (!openai) {
      const templates: Record<string, string> = {
        deneme: `Değerli Velimiz, ${studentName || "öğrenciniz"} adlı öğrencinin son girmiş olduğu deneme sınavı sonuçları sistemimize yüklenmiştir. Öğrencimizin konu eksiklerini tespit edip bireysel ders programına ekledik. Genel durum değerlendirmesi için müsait olduğunuzda görüşmek isterim. İyi günler dilerim.`,
        program: `Değerli Velimiz, ${studentName || "öğrenciniz"} için hazırladığımız bu haftaki akıllı ders çalışma programını tamamladık. Öğrencimizin günlük soru hedeflerine ve konu tekrarlarına evde de hassasiyet göstermesini rica ederiz. Birlikte başaracağız. Saygılarımla.`,
        absent: `Değerli Velimiz, ${studentName || "öğrenciniz"} bugün planladığımız koçluk seansına katılım sağlayamamıştır. Bilginiz dahilinde olup olmadığını teyit etmek için dönüş yapmanızı rica ederim. İyi çalışmalar.`,
        motivation: `Değerli Velimiz, ${studentName || "öğrenciniz"} ile bugün gerçekleştirdiğimiz seans son derece verimli geçti. Öğrencimizin motivasyonunu yüksek tutmak adına evde de destekleyici bir tutum sergilemeniz, çabasını takdir etmeniz çok kıymetlidir. İyi günler.`,
        appointment: `Değerli Velimiz, önümüzdeki hafta yapacağımız öğrenci durum değerlendirme toplantısı için randevu planlamak istiyorum. Sizin için en uygun gün ve saatleri bana iletebilirseniz takvimimize kaydedelim. İyi çalışmalar.`
      }
      return NextResponse.json({
        success: true,
        message: templates[topic] || `Değerli Velimiz, ${studentName || "öğrenciniz"} hakkında ${topic} konusunda görüşmek istiyorum. Müsait olduğunuzda haberleşelim. İyi çalışmalar.`
      })
    }

    const topicDescriptions: Record<string, string> = {
      deneme: "Deneme sınavı sonucu paylaşımı",
      program: "Ders programı bilgilendirmesi",
      absent: "Seansa katılmama (devamsızlık) durumu",
      motivation: "Motivasyon desteği",
      appointment: "Veli görüşmesi randevusu talebi"
    }

    const extraContext = customContext ? "\n- Ek bağlam: " + customContext : ""
    const systemContent = "Sen profesyonel bir eğitim koçlusun. Veliye WhatsApp üzerinden gönderilecek samimi ama resmi bir mesaj yaz.\nKurallar:\n- En fazla 3 cümle\n- Türkçe yaz\n- \"Değerli Velimiz\" ile başla\n- Konu: " + (topicDescriptions[topic] || topic) + "\n- Öğrenci adı: " + (studentName || "öğrenci") + extraContext

    const userMessage = "Konu '" + topic + "' için WhatsApp mesajı yaz"
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userMessage }
      ],
      max_tokens: 250,
    })

    const message = completion.choices[0]?.message?.content || "Mesaj oluşturulamadı."
    return NextResponse.json({ success: true, message })
  } catch (err: unknown) {
    console.error("Message suggestion error:", err)
    const message = err instanceof Error ? err.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}