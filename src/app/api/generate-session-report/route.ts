import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { studentName, sessionData, targetAudience } = await req.json();

    let prompt = '';
    
    if (targetAudience === 'parent') {
      prompt = `
        Sen profesyonel bir Eğitim Koçu ve Psikolojik Danışmansın.
        Öğrencimiz ${studentName} ile yapılan son koçluk seansının verilerini inceleyerek VELİSİNE WhatsApp üzerinden gönderilecek bir durum bilgilendirme mesajı hazırla.
        
        Seans Verileri:
        - Seans Başlığı: ${sessionData.title}
        - Motivasyon: ${sessionData.weeklyMotivation}/10
        - Odaklanma: ${sessionData.weeklyFocus}/10
        - Kaygı: ${sessionData.weeklyAnxiety}/10
        - Danışman Notu: "${sessionData.content}"
        
        Kurallar:
        1. Veliyi paniğe sevk etmeden, durumu profesyonel, yapıcı ve teşvik edici bir dille anlat.
        2. Mesajın sonuna her zaman veliyle işbirliği içinde olduğumuzu hissettiren şık bir kapanış cümlesi ekle.
        3. Emojileri dozunda ve profesyonel kullan (Örn: 📊, 🎯, 🤝).
        4. Sadece mesaj metnini döndür.
      `;
    } else {
      // principal
      prompt = `
        Sen kurumsal bir Eğitim Koçu ve Rehber Öğretmensin.
        Kurum müdürüne/yönetime sunulmak üzere, ${studentName} isimli öğrencinin seans özetini içeren profesyonel bir yönetici özeti ("Müdür Raporu") hazırla.
        
        Seans Verileri:
        - PDR Uzmanı Notu: "${sessionData.content}"
        
        Kurallar:
        1. Öğrenciyle görüşmede genel olarak hangi konuların ele alındığını ve Veliye hangi bilgilerin aktarıldığını 2-3 cümleyle, çok detaya (özel hayata veya spesifik sayılara) girmeden özetle.
        2. Formatlama olarak KESİNLİKLE markdown kalınlaştırma (**) işaretlerini kullanma. Düz, sade ve okunaklı bir metin olsun.
        3. Rapor dili resmi, akademik ve kurum içi iletişime uygun olmalıdır.
        4. Sadece rapor metnini döndür.
      `;
    }

    if (apiKey === 'dummy_key') {
      const mockText = targetAudience === 'parent' 
        ? `Sayın Velimiz merhabalar 🤝\n${studentName} ile bu haftaki koçluk görüşmemizi son derece verimli bir şekilde tamamladık. Öğrencimizin motivasyon düzeyi (${sessionData.weeklyMotivation}/10) oldukça iyi bir noktada. Odaklanma becerileri üzerine koyduğumuz hedeflere ulaştığını gözlemledim.\n\nSüreci yakından takip etmeye devam edeceğim. Evdeki destekleyici tutumunuz için teşekkür ederim. 🎯`
        : `T.C. KURUM İÇİ PDR BİLGİLENDİRME RAPORU\n\nÖğrenci: ${studentName}\nDeğerlendirme: Öğrencimizin bu haftaki akademik eylem planı hedefleri doğrultusunda odaklanma (${sessionData.weeklyFocus}/10) ve kaygı regülasyonu (${sessionData.weeklyAnxiety}/10) stabil seviyede ölçümlenmiştir. Çözülen soru hedeflerinde zaman yönetimi metrikleri gözden geçirilmiş olup, müdahale gerektiren majör bir kriz bulgusu saptanmamıştır.\n\nBilgilerinize arz ederim.`;
      
      return NextResponse.json({ text: mockText });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    
    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
