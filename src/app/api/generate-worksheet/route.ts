import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { studentName, grade, weakTopics } = await req.json();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ error: 'Geçerli bir GEMINI_API_KEY bulunamadı.' }, { status: 500 });
    }

    const prompt = `Sen deneyimli bir Rehber Öğretmen ve Soru Yazarısın.
Öğrencinin Adı: ${studentName}
Sınıfı: ${grade}
Eksik/Zayıf Olduğu Konular: ${weakTopics}

Lütfen bu öğrenci için, yukarıdaki zayıf olduğu konulara özel, LGS formatına uygun toplam 10 soruluk bir "Mini Check-up Sınavı" (Çalışma Kağıdı) hazırla.
Çıktıyı SADECE ve SADECE HTML formatında ver (Markdown kullanma).
Görsellik için satır içi CSS (inline css) kullanabilirsin, güzel bir A4 çıktısı alınacak gibi tasarla.
Her sorunun A, B, C, D şeklinde 4 şıkkı olsun.
En alt kısımda bir "Cevap Anahtarı" tablosu bulundur.
Sorular yeni nesil mantık muhakeme becerilerini ölçmeye yönelik olsun.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.7 }
    });

    let htmlText = response.text || '';
    htmlText = htmlText.replace(/```html/g, '').replace(/```/g, ''); // Temizlik
    
    return NextResponse.json({ success: true, html: htmlText });
  } catch (error: any) {
    console.error('Worksheet API Hatası:', error);
    return NextResponse.json({ error: 'Yapay zeka sorusu üretilirken hata oluştu.' }, { status: 500 });
  }
}
