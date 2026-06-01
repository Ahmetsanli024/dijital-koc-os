import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { student, exam } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let examDetailsStr = exam.subjectDetails;
    if (!examDetailsStr && exam.totalNet) {
        examDetailsStr = `Toplam Net: ${exam.totalNet}, Doğru: ${exam.totalCorrect}, Yanlış: ${exam.totalIncorrect}`;
    }

    const systemPrompt = `
Sen "AI Sınav Röntgeni" isimli fütüristik, medikal temalı bir eğitim analiz motorusun.
Görevin, bir öğrencinin girdiği sınav verilerini tıbbi bir röntgen/tahlil okuyormuş gibi incelemek ve "Hastalık/Zayıflık Teşhisi" ile "Reçete" oluşturmaktır.

Öğrenci: ${student.firstName} ${student.lastName} (Sınıf: ${student.grade}, Hedef: ${student.target || 'Belirsiz'})
Sınav Adı: ${exam.name}
Sınav Detayları: ${examDetailsStr}

Format Gereksinimi:
Aşağıdaki anahtarlara sahip saf bir JSON formatında cevap ver:
{
  "diagnosis": ["Teşhis 1", "Teşhis 2", "Teşhis 3"],
  "summary": "Kısa tıbbi/koçluk dilinde durum özeti",
  "prescription": ["Reçete adımı 1", "Reçete adımı 2", "Reçete adımı 3"]
}

Kurallar:
1. Diagnosis (Teşhis) bölümünde öğrencinin en çok hata yaptığı / zayıf olduğu konuları veya alanları tıbbi bir ciddiyetle (fakat eğitim bağlamında) listele.
2. Summary (Özet) kısmında gidişatı yorumla.
3. Prescription (Reçete) kısmında net, uygulanabilir ödevler ver (Örn: "Paragraf soru bankasından günde 20 doz (soru) alınacak").
4. Markdown veya ek metin kullanma, sadece parse edilebilir JSON döndür.
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    try {
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const xrayData = JSON.parse(cleanedText);
      return NextResponse.json({ success: true, result: xrayData });
    } catch (e) {
      console.error("X-Ray JSON Parse Error:", responseText);
      return NextResponse.json({ 
        success: true, 
        result: {
          diagnosis: ["Veri yetersizliğinden dolayı spesifik teşhis konulamadı.", "Genel performans düşüklüğü izlendi."],
          summary: "AI motoru detaylı analiz için daha fazla soru bazlı veriye ihtiyaç duyuyor.",
          prescription: ["Öğrencinin geçmiş konulardan genel tekrar yapması önerilir.", "Yeni bir deneme sınavı ile veriler tazelenmeli."]
        }
      });
    }

  } catch (error) {
    console.error('X-Ray API Error:', error);
    return NextResponse.json({ error: 'Röntgen çekilirken hata oluştu.' }, { status: 500 });
  }
}
