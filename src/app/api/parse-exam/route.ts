import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const pdfModule = require('pdf-parse');
const pdf = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Null byte ve bozuk karakterleri temizle
function cleanPdfText(text: string): string {
  return text
    .replace(/\u0000/g, 'tı')  // Sınavza PDF'lerindeki yaygın null byte düzeltmesi (tı harfi)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Diğer kontrol karakterlerini sil
    .trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya seçilmedi.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ error: 'GEMINI_API_KEY tanımlı değil. .env.local dosyanızı kontrol edin.' }, { status: 500 });
    }

    // PDF'i oku
    let pdfData;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      pdfData = await pdf(buffer);
    } catch (pdfError: any) {
      console.error('PDF okuma hatası:', pdfError);
      return NextResponse.json({ error: 'PDF dosyası okunamadı. Dosya bozuk veya korumalı olabilir.' }, { status: 400 });
    }
    
    // Null byte'ları temizle
    const rawText = cleanPdfText(pdfData.text || '');

    if (rawText.length < 20) {
      return NextResponse.json({ error: 'PDF içeriği boş veya çok kısa. Lütfen doğru dosyayı seçtiğinizden emin olun.' }, { status: 400 });
    }

    const prompt = `Aşağıda bir LGS deneme sınavı (veya benzeri) analiz raporunun OCR ile okunmuş ham metni bulunmaktadır.
Senden bu metni detaylıca analiz etmeni ve sonuçları JSON formatında vermeni istiyorum.
Çıkarman gereken bilgiler:
0. Öğrencinin Adı Soyadı (studentName): Belgede "Öğrenci:", "Ad Soyad:", "Adı Soyadı:" veya başlık kısmında geçen öğrenci adını bul. Bulamazsan boş string döndür.
1. Sınavın Adı (Eğer metinde "Sınav Adı: X" veya "X Denemesi" gibi bir ibare varsa. Yoksa dosya adından yola çıkarak mantıklı bir isim uydur, örneğin "Son Sınav").
2. Sınav genelindeki toplam Doğru (totalCorrect), Yanlış (totalIncorrect), Boş (totalBlank) ve Net (totalNet) sayıları. Bu sayılar genellikle sayfanın en altında veya "TOPLAM" satırında yer alır.
3. TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ derslerinin her biri için ayrı ayrı Doğru, Yanlış, Boş ve Net sayıları.
4. Hata Yapılan Konular (weakTopics): Bu derste öğrencinin yanlış yaptığı veya boş bıraktığı konu isimlerini liste halinde ver.
5. Konu Analizi (topics): O dersin 'KONU ANALİZİ' bölümündeki TÜM konuları bul. Aynı konudan birden fazla soru varsa Doğru, Yanlış ve Boş sayılarını topla. Her konu için adı, doğru, yanlış ve boş sayısını ver.

Dosya Adı: ${file.name}

İşte Ham Metin:
${rawText}`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        studentName: { type: Type.STRING, description: 'Öğrencinin adı soyadı (bulunamazsa boş string)' },
        examName: { type: Type.STRING, description: 'Sınavın adı' },
        totalNet: { type: Type.NUMBER, description: 'Toplam Net' },
        totalCorrect: { type: Type.NUMBER, description: 'Toplam Doğru' },
        totalIncorrect: { type: Type.NUMBER, description: 'Toplam Yanlış' },
        totalBlank: { type: Type.NUMBER, description: 'Toplam Boş' },
        subjects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Ders Adı (Örn: TÜRKÇE)' },
              correct: { type: Type.NUMBER },
              incorrect: { type: Type.NUMBER },
              blank: { type: Type.NUMBER },
              net: { type: Type.NUMBER },
              weakTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Yanlış yapılan veya boş bırakılan konu isimleri'
              },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    correct: { type: Type.NUMBER },
                    incorrect: { type: Type.NUMBER },
                    blank: { type: Type.NUMBER }
                  },
                  required: ["name", "correct", "incorrect", "blank"]
                },
                description: 'Bu derse ait tüm konular ve istatistikleri'
              }
            },
            required: ["name", "correct", "incorrect", "blank", "net", "weakTopics", "topics"]
          }
        }
      },
      required: ["examName", "totalNet", "totalCorrect", "totalIncorrect", "totalBlank", "subjects"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
      throw new Error('Yapay zeka yanıt boş döndürdü.');
    }

    const aiData = JSON.parse(response.text);

    return NextResponse.json({
      success: true,
      parsedData: {
        name: aiData.examName || file.name.replace('.pdf', ''),
        studentName: aiData.studentName || '',
        totalNet: aiData.totalNet || 0,
        totalCorrect: aiData.totalCorrect || 0,
        totalIncorrect: aiData.totalIncorrect || 0,
        totalBlank: aiData.totalBlank || 0,
        subjectDetails: JSON.stringify(aiData.subjects || []),
        rawText
      }
    });
  } catch (error: any) {
    console.error('Parse-exam HATA:', error);
    
    let userMessage = 'Bilinmeyen hata oluştu.';
    const errString = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
    
    if (errString.includes('503') || errString.includes('UNAVAILABLE') || errString.includes('high demand')) {
      userMessage = 'Google Yapay Zeka sunucuları şu anda çok yoğun. Lütfen 10-15 saniye bekleyip tekrar deneyin.';
    } else if (errString.includes('429') || errString.includes('Quota exceeded')) {
      userMessage = 'Ücretsiz yapay zeka kotanız anlık olarak doldu. Lütfen 1-2 dakika bekledikten sonra tekrar deneyin.';
    } else if (errString.includes('404') || errString.includes('not found')) {
      userMessage = 'Kullanılan yapay zeka modeli bulunamadı (API versiyon uyumsuzluğu).';
    } else {
      userMessage = errString;
    }
    
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
