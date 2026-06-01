import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt, pdfBase64, filename } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Komut boş olamaz.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Fetch all students to help AI match names
    const allStudents = await prisma.student.findMany({
      select: { id: true, firstName: true, lastName: true }
    });
    
    const studentsContext = allStudents.map(s => `${s.id}: ${s.firstName} ${s.lastName}`).join('\n');

    const systemPrompt = `
Sen bir eğitim koçluğu uygulamasının zeki asistanısın. Kullanıcı sana doğal dille komutlar verecek.
Kullanıcı yeni bir öğrenci kaydetmek istiyor olabilir veya yüklediği bir belgeyi belirli bir öğrencinin "Sınavı" olarak kaydetmek istiyor olabilir.
Sistemde kayıtlı mevcut öğrenciler şunlardır:
${studentsContext}

Görevin kullanıcının niyetini (intent) anlamak ve aşağıdaki formatta saf JSON döndürmek:
Eğer niyet YENİ ÖĞRENCİ KAYDETMEK ise:
{
  "intent": "create_student",
  "data": {
    "firstName": "Ad",
    "lastName": "Soyad",
    "grade": "Sınıf (Örn: 8. Sınıf)",
    "parentPhone": "Veli Telefonu (varsa)"
  }
}

Eğer niyet SINAV/PDF YÜKLEMEK ise (Mevcut öğrencilerden en mantıklı eşleşenin ID'sini bulmalısın):
{
  "intent": "upload_exam",
  "data": {
    "studentId": "Eşleşen öğrencinin ID'si",
    "studentName": "Eşleşen öğrencinin adı soyadı",
    "note": "Kullanıcının nota düştüğü sınav adı veya detayı"
  }
}

Eğer kullanıcı sadece bir öğrencinin son sınavını soruyorsa veya bulmanı istiyorsa:
{
  "intent": "search_exam",
  "data": {
    "studentId": "Eşleşen öğrencinin ID'si",
    "studentName": "Eşleşen öğrencinin adı soyadı"
  }
}

Lütfen sadece ve sadece geçerli bir JSON objesi döndür, hiçbir markdown veya ekstra açıklama ekleme.
`;

    const result = await model.generateContent([
      systemPrompt,
      `Kullanıcı Komutu: ${prompt}` + (pdfBase64 ? `\n\n[SİSTEM BİLGİSİ: Kullanıcı bu komutla birlikte bir PDF dosyası ("${filename}") ekledi]` : '')
    ]);

    const responseText = result.response.text();
    let aiDecision;
    try {
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiDecision = JSON.parse(cleanedText);
    } catch (e) {
      console.error("AI JSON Parse Hatası:", responseText);
      return NextResponse.json({ error: 'Komut anlaşılamadı. Lütfen daha net ifade edin.' }, { status: 400 });
    }

    if (aiDecision.intent === 'create_student') {
      const newStudent = await prisma.student.create({
        data: {
          firstName: aiDecision.data.firstName || 'İsimsiz',
          lastName: aiDecision.data.lastName || 'Öğrenci',
          grade: aiDecision.data.grade || 'Belirtilmedi',
          parentPhone: aiDecision.data.parentPhone || ''
        }
      });
      return NextResponse.json({ success: true, intent: 'create_student', student: newStudent, message: `${newStudent.firstName} ${newStudent.lastName} başarıyla kaydedildi!` });
    } 
    
    else if (aiDecision.intent === 'upload_exam') {
      if (!aiDecision.data.studentId) {
        return NextResponse.json({ error: 'Komuttan öğrenci eşleştirilemedi. Lütfen sistemde kayıtlı bir öğrenci adı girin.' }, { status: 404 });
      }
      if (!pdfBase64) {
        return NextResponse.json({ error: 'Sınav kaydetmek için bir PDF dosyası eklemeniz gerekiyor.' }, { status: 400 });
      }
      
      // We will let the frontend know which student this belongs to, 
      // the frontend will then route to the X-Ray generation flow or upload API.
      return NextResponse.json({ 
        success: true, 
        intent: 'upload_exam', 
        studentId: aiDecision.data.studentId,
        studentName: aiDecision.data.studentName,
        examNote: aiDecision.data.note,
        message: `${aiDecision.data.studentName} için sınav röntgeni başlatılıyor...` 
      });
    }

    else if (aiDecision.intent === 'search_exam') {
      if (!aiDecision.data.studentId) return NextResponse.json({ error: 'Öğrenci bulunamadı.' }, { status: 404 });
      
      const lastExam = await prisma.exam.findFirst({
        where: { studentId: aiDecision.data.studentId },
        orderBy: { createdAt: 'desc' }
      });

      if (!lastExam) return NextResponse.json({ error: `${aiDecision.data.studentName} isimli öğrencinin sisteme kayıtlı bir sınavı yok.` }, { status: 404 });

      return NextResponse.json({
        success: true,
        intent: 'search_exam',
        studentId: aiDecision.data.studentId,
        examId: lastExam.id,
        message: `${aiDecision.data.studentName} isimli öğrencinin son sınavı bulundu. Röntgen sayfasına yönlendiriliyorsunuz...`
      });
    }

    return NextResponse.json({ error: 'Bilinmeyen bir niyet algılandı.' }, { status: 400 });

  } catch (error) {
    console.error('AI Command Error:', error);
    return NextResponse.json({ error: 'Sistem bir hata ile karşılaştı.' }, { status: 500 });
  }
}
