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

    if (!file || !studentId) {
      return NextResponse.json({ error: 'Dosya ve öğrenci bilgisi gereklidir.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ error: 'Geçerli bir GEMINI_API_KEY bulunamadı.' }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const prompt = `Ekteki görsel bir LGS deneme sınavı sonuç belgesi, karnesi veya optik formudur. 
Görevlerin:
1. Sınavın adını bul (Bulamazsan "Tarama Sınavı" yaz).
2. Doğru, Yanlış, Boş ve Net sayılarını (özellikle TOPLAM kısmını) bul.
3. Çıktıyı SADECE JSON formatında ver. JSON formatı şu şekilde olmalı:
{
  "name": "Sınav Adı",
  "totalCorrect": 75,
  "totalIncorrect": 10,
  "totalBlank": 5,
  "totalNet": 71.66
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
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
      console.log('JSON parse hatası:', response.text);
      return NextResponse.json({ error: 'AI görseli okuyamadı.' }, { status: 500 });
    }

    const exam = await prisma.exam.create({
      data: {
        studentId,
        name: data.name || 'Fotoğraftan Okunan Sınav',
        date: new Date(),
        totalNet: data.totalNet || 0,
        totalCorrect: data.totalCorrect || 0,
        totalIncorrect: data.totalIncorrect || 0,
        totalBlank: data.totalBlank || 0,
        rank: '-',
        rawText: 'Fotoğraftan optik okuma ile eklendi.',
        examType: 'SINGLE'
      }
    });

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    console.error('Vision API Hatası:', error);
    return NextResponse.json({ error: 'Görsel işlenirken hata oluştu.' }, { status: 500 });
  }
}
