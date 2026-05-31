import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const studentId = formData.get('studentId') as string | null;
    const tone = formData.get('tone') as string || 'Başarılı'; // Başarılı, Aksayan, Kaygılı

    if (!file || !studentId) {
      return NextResponse.json({ error: 'Dosya ve öğrenci bilgisi gereklidir.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ error: 'Geçerli bir GEMINI_API_KEY bulunamadı.' }, { status: 500 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı.' }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const prompt = `Ekteki görsel, bir öğrencinin haftalık çalışma planı (çizelgesi) veya ödev tablosunun fotoğrafıdır.
Öğrenci bu tablo üzerine el yazısıyla çözdüğü soru sayılarını yazmış ve bazı kutucukları işaretlemiş olabilir.

Görevlerin:
1. Görseldeki tüm dersleri, hedeflenen soru sayılarını ve öğrencinin gerçekte çözdüğü soru sayılarını analiz et.
2. Toplam hedeflenen soru sayısı ile toplam çözülen soru sayısını toplayarak hesapla.
3. Hangi derslerde ödevlerin eksiksiz bittiğini (COMPLETED), hangilerinin eksik kaldığını (PARTIAL) veya hiç dokunulmadığını (FAILED) belirle.
4. Başarı oranını (% bazında, toplam çözülen / toplam hedeflenen şeklinde) hesapla.
5. Veliye gönderilmek üzere son derece profesyonel, samimi, Türkçe bir WhatsApp mesajı oluştur.
   - ÖNEMLİ: Mesajda kesinlikle herhangi bir internet bağlantısı (link) yer ALMASIN!
   - Mesajın sonu "Ahmet Şanlı" imzasıyla bitsin.
   - Mesajın genel üslubunu veli segmentasyonu tonuna (${tone}) göre ayarla:
     * "Başarılı" ise: Öğrencinin harika çalışmasını takdir et, tebrik ve motivasyon odaklı olsun.
     * "Aksayan" ise: Yapılmayan/eksik kalan görevleri nazikçe ama ciddiyetle vurgula, tatlı sert takip tonu kullan.
     * "Kaygılı" ise: Kaygıyı yatıştırıcı, duygusal destek veren, moral aşılayıcı bir üslup kullan.
6. Çıktıyı SADECE aşağıdaki JSON formatında ver:
{
  "totalPlanned": 800,
  "totalSolved": 650,
  "successRate": 81,
  "summary": "Ödev özeti...",
  "whatsappMessage": "Veli bilgilendirme mesajı...",
  "tasks": [
    { "subject": "MATEMATİK", "planned": 150, "solved": 150, "status": "COMPLETED" },
    { "subject": "FEN BİLİMLERİ", "planned": 120, "solved": 80, "status": "PARTIAL" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: buffer.toString("base64")
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    let data;
    try {
      data = JSON.parse(response.text || '{}');
    } catch(e) {
      console.error('Vision Parsing Hatası:', response.text);
      return NextResponse.json({ error: 'AI görseli okuyup JSON üretemedi.' }, { status: 500 });
    }

    // Automatically save this analysis as a draft parent communication or log
    await prisma.parentCommunication.create({
      data: {
        studentId,
        topic: 'Haftalık Ödev Taraması',
        message: data.whatsappMessage || 'Haftalık program fotoğraf tarama raporu oluşturuldu.',
        isDraft: true
      }
    });

    return NextResponse.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error('Parse Homework API Hatası:', error);
    return NextResponse.json({ error: 'Ödev görseli işlenirken bir hata oluştu.' }, { status: 500 });
  }
}
