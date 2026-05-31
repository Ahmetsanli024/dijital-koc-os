import { NextResponse } from 'next/server';
const pdfModule = require('pdf-parse');
const pdf = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const studentId = formData.get('studentId') as string | null;
    const examTypeParam = formData.get('examType') as string | null;
    const publisher = formData.get('publisher') as string | null;

    if (!file || !studentId) {
      return NextResponse.json({ error: 'Dosya ve öğrenci bilgisi gereklidir.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // PDF'i oku
    let pdfData;
    try {
      pdfData = await pdf(buffer);
    } catch (pdfError: any) {
      console.error('PDF okuma hatası:', pdfError);
      return NextResponse.json({ error: 'PDF dosyası okunamadı. Dosya bozuk olabilir.' }, { status: 400 });
    }
    
    const text = pdfData.text || '';

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'PDF içeriği boş veya okunamıyor.' }, { status: 400 });
    }

    console.log('--- PDF TEXT (ilk 500 karakter) ---');
    console.log(text.substring(0, 500));
    console.log('---');

    // Sınav Adı Bul
    let examName = file.name.replace('.pdf', '');
    const examNameMatch = text.match(/(?:Sınav\s*Ad[ıi])\s*[:\s]*([^\n]+)/i);
    if (examNameMatch && examNameMatch[1]) {
      const cleaned = examNameMatch[1].trim();
      if (cleaned.length > 2 && cleaned.length < 100) {
        examName = cleaned;
      }
    }

    // Sayıları çek
    let totalNet = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalBlank = 0;

    // TOPLAM satırından çek
    const toplamLineMatch = text.match(/TOPLAM[^\n]*/i);
    if (toplamLineMatch) {
      const numbers = toplamLineMatch[0].match(/(\d+(?:[.,]\d+)?)/g);
      if (numbers && numbers.length >= 4) {
        const lastIndex = numbers.length - 1;
        totalNet = parseFloat(numbers[lastIndex].replace(',', '.')) || 0;
        totalBlank = parseInt(numbers[lastIndex - 1]) || 0;
        totalIncorrect = parseInt(numbers[lastIndex - 2]) || 0;
        totalCorrect = parseInt(numbers[lastIndex - 3]) || 0;
      } else if (numbers && numbers.length > 0) {
        totalNet = parseFloat(numbers[numbers.length - 1].replace(',', '.')) || 0;
      }
    }

    // Veritabanına güvenli kaydet
    const safeNet = Number.isFinite(totalNet) ? totalNet : 0;
    const safeCorrect = Number.isFinite(totalCorrect) ? totalCorrect : 0;
    const safeIncorrect = Number.isFinite(totalIncorrect) ? totalIncorrect : 0;
    const safeBlank = Number.isFinite(totalBlank) ? totalBlank : 0;
    const safeExamType = examTypeParam === 'MERGED' ? 'MERGED' : 'SINGLE';

    const exam = await prisma.exam.create({
      data: {
        studentId,
        name: examName || 'İsimsiz Sınav',
        date: new Date(),
        totalNet: safeNet,
        totalCorrect: safeCorrect,
        totalIncorrect: safeIncorrect,
        totalBlank: safeBlank,
        rank: '-',
        rawText: text,
        examType: safeExamType,
        publisher: publisher || null
      }
    });

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    console.error('Upload-exam HATA:', error);
    return NextResponse.json({ error: 'Sunucu hatası: ' + (error.message || 'Bilinmeyen hata') }, { status: 500 });
  }
}
