import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentName, grade, weakTopics, totalTasks, latestPsychoNote } = body;

    const prompt = `
      Sen uzman bir Psikolojik Danışman ve Kariyer/Eğitim Koçusun. Kurumsal ve prestijli bir eğitim kurumunda çalışıyorsun.
      Senden ${studentName} (${grade}) adlı öğrenci için haftalık çalışma programının sonuna eklenecek, tek sayfalık motivasyon ve yönlendirme mektubu yazmanı istiyorum.
      
      Öğrencinin Durumu:
      - Bu hafta ${totalTasks} görev atandı.
      - Tespit edilen kronik zayıf/dikkat edilmesi gereken konular: ${weakTopics?.join(', ') || 'Belirgin bir zayıf konu henüz tespit edilmedi.'}
      - Senin son PDR (Psikolojik Danışmanlık) notun: "${latestPsychoNote || 'Süreç istikrarlı ilerliyor.'}"

      Mektup Kuralları:
      1. Sadece "git çalış, şunu yap" gibi basit emir kipleri kullanma. Neden o konulara çalışması gerektiğini, o zayıf konuları aşarsa genel hedefine nasıl ulaşacağını pedagojik ve bilimsel bir üslupla (öğrenme psikolojisi perspektifinden) anlat.
      2. Çok kurumsal, şatafatlı ama bir o kadar da içten ve "Ben senin her adımını izliyorum ve yanındayım" hissini veren bir dil kullan.
      3. HTML formatında döneceksin. <div style="font-family: serif; line-height: 1.8;"> gibi elit stiller kullan. Paragraflar arasında <br/> kullan.
      4. Hitap kısmına "Sevgili ${studentName}," ile başla, sonuna "Sevgilerimle, Eğitim ve Kariyer Koçun" yaz.
      5. HTML haricinde (markdown vs) hiçbir ekstra metin ekleme. Sadece HTML kodu döndür.
    `;

    // Only attempt real AI call if API key is not dummy (for dev environments)
    if (apiKey === 'dummy_key') {
      return NextResponse.json({
        html: `
        <div style="padding: 2rem; border: 1px solid #ccc; border-radius: 8px; font-family: 'Georgia', serif; line-height: 1.8; color: #1e293b;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 0.5rem;">Haftalık Pedagojik Değerlendirme</h2>
          <p>Sevgili ${studentName},</p>
          <p>Bu haftaki çalışma programını incelediğimde karşına çıkacak olan <strong>${totalTasks}</strong> görevlik maraton, senin kariyer hedeflerine ulaşmandaki en kritik virajlardan biri. Özellikle <em>${weakTopics?.join(', ')}</em> gibi analitik konularda gösterdiğin gelişim ihtiyacı, basit bir hata değil; aksine potansiyelini maksimize edebileceğin birer öğrenme fırsatıdır.</p>
          <p>Psikolojik dayanıklılığının farkındayım (${latestPsychoNote}). Öğrenme psikolojisinde "yapılandırmacı yaklaşım" dediğimiz prensip gereği, bu hafta bu zayıf noktalarının üzerine cesaretle gitmelisin. Hata yapmaktan korkma, her hata senin gerçek sınavdaki mükemmelliğine atılmış bir adımdır.</p>
          <p>Sürecinin her adımını büyük bir dikkat ve gururla izliyorum. Başaracağına olan inancım tam.</p>
          <br/><br/>
          <p style="text-align: right; font-style: italic;">Sevgilerimle,<br/><strong>Psikolojik Danışman ve Kariyer Koçun</strong></p>
        </div>
        `
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let htmlText = response.text();
    
    // Clean up markdown code blocks if AI returns them
    htmlText = htmlText.replace(/```html/g, '').replace(/```/g, '').trim();

    return NextResponse.json({ html: htmlText });

  } catch (error: any) {
    console.error('Motivation Letter Gen Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
