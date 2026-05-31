import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// ─── 1. TEKLİ DENEME SINAVI PROMPT'U ───
const SINGLE_EXAM_PROMPT = `Sana vereceğim metin, bir 8. sınıf öğrencisinin TEK bir LGS denemesinin ayrıntılı karnesidir. Yapısı sabittir, dört bölümlüdür:

1) DERS ANALİZİ: ders bazında SORU/DOĞRU/YANLIŞ/BOŞ/NET ve ORT.
   NET = Doğru - Yanlış/3. ORT = tüm katılımcıların o dersteki ortalama neti (öğrenci ORT üstündeyse gruptan iyi, altındaysa geride).
2) PUAN VE SIRALAMALAR: puan; GENEL/KURUM/ŞUBE/SINIF sıralamaları (altındaki katılımcı sayılarıyla okunur); LGS23/24/25 = aynı puanın o yılların gerçek sınavına göre tahmini yüzdelik dilimi (küçük=iyi).
3) SON 15 SINAVIN SONUÇLARI: denemeler arası net trendi.
4) KONU ANALİZİ: SORU SORU döküm. Sütunlar No, Konu, DC, ÖC, SO.
   DC=Doğru Cevap, ÖC=Öğrenci Cevabı, SO sonuç: "+" doğru, "-" yanlış, BOŞ hücre = soru boş bırakılmış. Yanlışlarda ÖC, hangi çeldiriciye gidildiğini gösterir.

Konu adları "…" ile kesik olabilir; İngilizce kelimelerdeki "ı"yı "i" yap. Şık harfleri yalnızca bu kitapçık için geçerlidir.

Bu TEK denemelik bir fotoğraftır; tek yanlışı kesin zayıflık sayma, toplu raporlarla çapraz kontrol et. Buna göre: (a) bu denemedeki somut hataları konu konu çıkar, (b) ORT'un altında kalınan dersleri işaretle, (c) varsa kavram yanılgısı ipuçlarını (ÖC analizi) belirt.

Görevlerin:
1. evaluationSummary alanında öğrencinin analizini yazarken KESİNLİKLE markdown formatı (kalın yazı için **, liste için *, vb.) kullanma. Tüm metni düz, akıcı tek bir paragraf halinde yaz. KESİNLİKLE mekanik yüzdelik değerler (%40, %60 vb.) kullanma. Rehberlik değerlendirme yazısını KESİNLİKLE kısa tut; MAKSİMUM 3 CÜMLE olacak şekilde her şeyi özetle. Doğrudan metnin içindeki öğrenci ismiyle hitap ederek samimi, motive edici ve yönlendirici bir eğitim koçu metni oluştur. Örnek üslup: "[Öğrenci Adı], analiz sonucunda şu derslerden şu konularda yanlışının fazla olduğu tespit edildi. Bu eksikleri gidermek için sana hazırladığım haftalık soru hedeflerine sadık kalarak bol bol tekrar yapmalı ve test çözmelisin." tarzında doğrudan öğrenciyle konuşuyormuş gibi, 3 cümleyi aşmayan tek bir paragraf yaz.
2. Önceliklendirilmiş bir haftalık çalışma programı için LGS derslerinin (TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ) her birinden haftalık bir "Soru Sayısı" hedefi (questionCount) belirle. ÖNEMLİ KURAL: Öğrenciye atanacak haftalık "Soru Sayısı" hedefleri için şu matematiksel asgari sınırları KESİNLİKLE uygula:
- MATEMATİK, TÜRKÇE ve FEN BİLİMLERİ derslerinin her biri için GÜNLÜK en az 40 soru (HAFTALIK en az 280'er soru).
- T.C. İNKILAP TARİHİ, İNGİLİZCE ve DİN KÜLTÜRÜ derslerinin her biri için GÜNLÜK en az 15 soru (HAFTALIK en az 105'er soru).
- Toplamda GÜNLÜK ortalama EN AZ 300 soru (HAFTALIK toplam en az 2100 soru) yakalanmalıdır.
- Zayıf olduğu ders ve konulara asgari sınırların çok daha üstünde (örneğin günlük 60-80) sorular vererek ağırlık oluştur, ancak İYİ olduğu (başarılı) ders ve konulara da asgari sınırın biraz üstünde (ekstra) tekrar soruları eklemeyi ihmal etme. Ayrıca odaklanılacak en zayıf konuyu (weakTopic) belirle. Eğer zayıf konu bulunmuyorsa "Günlük Rutin" veya "Genel Tekrar" yaz.`;

// ─── 2. BİRLEŞTİRİLMİŞ KARNE PROMPT'U ───
const MERGED_EXAM_PROMPT = `Sana vereceğim metin, "Sınavza Birleştirilmiş Karne" türünde bir belgedir: bir 8. sınıf öğrencisinin birden çok LGS denemesinin TOPLANARAK birleştirildiği konu başarı dökümüdür. Yapısı sabittir.

- Üstte hesaplanan denemeler (No, Sınav Adı, Tarih, Toplam Net) listelenir.
- Altta konu konu döküm gelir. Sütunlar: SS, D, Y, B, Baş.(%).
- SS değerleri tüm denemelerin TOPLAMIDIR (ortalama değil).

ÖNEMLİ: Bu belgede Baş.(%) = Doğru / Soru Sayısı'dır (NET değil!).
Bu belgede NET sütunu, Kayıp Puan, öncelik listesi, puan ve yüzdelik dilim YOKTUR.

Hiyerarşi: ders satırı sonunda ders kodu taşır (örn. "Türkçe( LGS-TRK )"); altında ana konular, onların altında girintili alt konular vardır. "-" / boş hücre 0 demektir.

Sayı hizası belirsizse Baş.(%) ile çöz: Baş=100 ise o tek sayı doğru, Baş=0 ise yanlıştır. İngilizce kelimelerdeki "ı"yı "i" yap (Frıendshıp=Friendship).

Ders satırındaki yüzdeyi yeniden hesaplama (sistem katsayılı hesap kullanır); konu/alt konu yüzdeleri Doğru/SS ile hesaplanabilir.

Zayıf konu = düşük Baş.(%) + yeterli SS (en az ~5-8 soru). Az soruluk satırlardaki %0/%100'e tek başına güvenme. KP olmadığından önceliklendirmeyi düşük başarı + yüksek soru ağırlığı (Türkçe/Mat/Fen 20'şer soru) ile yap.

Görevlerin:
1. evaluationSummary alanında öğrencinin analizini yazarken KESİNLİKLE markdown formatı (kalın yazı için **, liste için *, vb.) kullanma. Tüm metni düz, akıcı tek bir paragraf halinde yaz. KESİNLİKLE mekanik yüzdelik değerler (%40, %60 vb.) kullanma. Rehberlik değerlendirme yazısını KESİNLİKLE kısa tut; MAKSİMUM 3 CÜMLE olacak şekilde her şeyi özetle. Doğrudan metnin içindeki öğrenci ismiyle hitap ederek samimi, motive edici ve yönlendirici bir eğitim koçu metni oluştur. Örnek üslup: "[Öğrenci Adı], son katıldığın denemelerin verilerine baktığımda özellikle Türkçe ve Matematik konularında eksiklerin olduğu görülüyor. Bu eksikleri gidermek ve netlerini artırmak için programındaki konu çalışmalarını aksatmadan tamamlamalısın." tarzında doğrudan öğrenciyle konuşuyormuş gibi, 3 cümleyi aşmayan tek bir paragraf yaz.
2. Önceliklendirilmiş bir haftalık çalışma programı için LGS derslerinin (TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ) her birinden haftalık bir "Soru Sayısı" hedefi (questionCount) belirle. ÖNEMLİ KURAL: Öğrenciye atanacak haftalık "Soru Sayısı" hedefleri için şu matematiksel asgari sınırları KESİNLİKLE uygula:
- MATEMATİK, TÜRKÇE ve FEN BİLİMLERİ derslerinin her biri için GÜNLÜK en az 40 soru (HAFTALIK en az 280'er soru).
- T.C. İNKILAP TARİHİ, İNGİLİZCE ve DİN KÜLTÜRÜ derslerinin her biri için GÜNLÜK en az 15 soru (HAFTALIK en az 105'er soru).
- Toplamda GÜNLÜK ortalama EN AZ 300 soru (HAFTALIK toplam en az 2100 soru) yakalanmalıdır.
- Zayıf olduğu ders ve konulara asgari sınırların çok daha üstünde (örneğin günlük 60-80) sorular vererek ağırlık oluştur, ancak İYİ olduğu (başarılı) ders ve konulara da asgari sınırın biraz üstünde (ekstra) tekrar soruları eklemeyi ihmal etme. Ayrıca odaklanılacak en zayıf konuyu (weakTopic) belirle. Eğer zayıf konu bulunmuyorsa "Günlük Rutin" veya "Genel Tekrar" yaz.`;

// ─── 3. ÖNCELİKLİ KONU ANALİZİ PROMPT'U ───
const PRIORITY_EXAM_PROMPT = `Sana vereceğim metin, bir 8. sınıf öğrencisinin LGS deneme sınavlarının ortalamasına dayalı analiz raporudur (Öncelikli Konu Başarı Analizi). Yapısı sabittir:

- LGS 6 derstir, toplam 90 soru: Türkçe 20, İnkılap 10, Din 10, İngilizce 10, Matematik 20, Fen 20.
- Net bilgisi, Kayıp Puan, Puan ve Yüzdelik Dilim YOKTUR. Sadece derslerin konuları ve alt konuları yer alır, ayrıca D-Y-B (Doğru-Yanlış-Boş) ve başarı yüzdesi (%) ifade edilir.
- Başarı % ≈ Doğru / Soru Sayısı.

Konu Başarı Analizi hiyerarşiktir: ● ders, ◆ ana konu, girintili satır alt konudur. "-" işareti sıfır/yok demektir.

Zayıf konu = düşük başarı + yeterli soru sayısı (en az ~6-8). Az soruluk (SS 1-2) satırlara tek başına güvenme. Resmi öncelik listeleri zaten en kritik konuları verir; analize oradan başla.

İngilizce kelimelerdeki "ı" harfini "i" olarak düzelt (Frıendshıp=Friendship).

Görevlerin:
1. evaluationSummary alanında öğrencinin analizini yazarken KESİNLİKLE markdown formatı (kalın yazı için **, liste için *, vb.) kullanma. Tüm metni düz, akıcı tek bir paragraf halinde yaz. KESİNLİKLE mekanik yüzdelik değerler (%40, %60 vb.) kullanma. Rehberlik değerlendirme yazısını KESİNLİKLE kısa tut; MAKSİMUM 3 CÜMLE olacak şekilde her şeyi özetle. Doğrudan metnin içindeki öğrenci ismiyle hitap ederek samimi, motive edici ve yönlendirici bir eğitim koçu metni oluştur. Örnek üslup: "[Öğrenci Adı], son öncelikli konu listene göre şu derslerden şu konularda hataların yoğunlaştığı görülüyor. Bu açıkları kapatmak için sana verdiğim hedeflere odaklanmalı ve bol pratik yapmalısın." tarzında doğrudan öğrenciyle konuşuyormuş gibi, 3 cümleyi aşmayan tek bir paragraf yaz.
2. Önceliklendirilmiş bir haftalık çalışma programı için LGS derslerinin (TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ) her birinden haftalık bir "Soru Sayısı" hedefi (questionCount) belirle. ÖNEMLİ KURAL: Öğrenciye atanacak haftalık "Soru Sayısı" hedefleri için şu matematiksel asgari sınırları KESİNLİKLE uygula:
- MATEMATİK, TÜRKÇE ve FEN BİLİMLERİ derslerinin her biri için GÜNLÜK en az 40 soru (HAFTALIK en az 280'er soru).
- T.C. İNKILAP TARİHİ, İNGİLİZCE ve DİN KÜLTÜRÜ derslerinin her biri için GÜNLÜK en az 15 soru (HAFTALIK en az 105'er soru).
- Toplamda GÜNLÜK ortalama EN AZ 300 soru (HAFTALIK toplam en az 2100 soru) yakalanmalıdır.
- Zayıf olduğu ders ve konulara asgari sınırların çok daha üstünde (örneğin günlük 60-80) sorular vererek ağırlık oluştur, ancak İYİ olduğu (başarılı) ders ve konulara da asgari sınırın biraz üstünde (ekstra) tekrar soruları eklemeyi ihmal etme. Ayrıca odaklanılacak en zayıf konuyu (weakTopic) belirle. Eğer zayıf konu bulunmuyorsa "Günlük Rutin" veya "Genel Tekrar" yaz.`;


// ─── 4. KONU TAKİBİ SENKRONİZASYON PROMPT'U ───
const SYNC_PROMPT = `Sana vereceğim metin, bir 8. sınıf öğrencisinin bugüne kadar girdiği tüm sınavlardan elde edilen kümülatif 'Konu Takip Analizi' verisidir (JSON formatında). Her dersin konuları ile o konulardaki toplam Doğru, Yanlış ve Boş sayılarını içerir.

Görevlerin:
1. evaluationSummary alanında öğrencinin analizini yazarken KESİNLİKLE markdown formatı kullanma. Tüm metni düz, akıcı tek bir paragraf halinde yaz. Rehberlik değerlendirme yazısını KESİNLİKLE kısa tut; MAKSİMUM 3 CÜMLE olacak şekilde özetle. Doğrudan motive edici ve yönlendirici bir eğitim koçu metni oluştur. (Örn: "Sevgili öğrenci, tüm sınavlarını incelediğimde şu alanlarda zayıf olduğunu gördüm. Bu haftaki programında bunlara ağırlık vermelisin.")
2. Önceliklendirilmiş bir haftalık çalışma programı için LGS derslerinin (TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ) her birinden haftalık bir "Soru Sayısı" hedefi (questionCount) belirle. ÖNEMLİ KURAL: Öğrenciye atanacak haftalık "Soru Sayısı" hedefleri için şu matematiksel asgari sınırları KESİNLİKLE uygula:
- MATEMATİK, TÜRKÇE ve FEN BİLİMLERİ derslerinin her biri için GÜNLÜK en az 40 soru (HAFTALIK en az 280'er soru).
- T.C. İNKILAP TARİHİ, İNGİLİZCE ve DİN KÜLTÜRÜ derslerinin her biri için GÜNLÜK en az 15 soru (HAFTALIK en az 105'er soru).
- Toplamda GÜNLÜK ortalama EN AZ 300 soru (HAFTALIK toplam en az 2100 soru) yakalanmalıdır.
- Zayıf olduğu ders ve konulara asgari sınırların çok daha üstünde (örneğin günlük 60-80) sorular vererek ağırlık oluştur, ancak İYİ olduğu (başarılı) ders ve konulara da asgari sınırın biraz üstünde (ekstra) tekrar soruları eklemeyi ihmal etme.
3. Her ders için en zayıf konuyu (weakTopic) belirle.
4. 'topics' listesine her ders için EN ÇOK HATA YAPILAN (veya başarı yüzdesi en düşük) 1-3 zayıf konuyu isWeak: true olarak ekle. Ayrıca tekrar etmesi için BAŞARILI olduğu 1-2 temel konuyu da isWeak: false olarak ekle.`;

// ─── Prompt seçici ───
function getPrompt(examType: string): string {
  switch (examType) {
    case 'MERGED': return MERGED_EXAM_PROMPT;
    case 'PRIORITY': return PRIORITY_EXAM_PROMPT;
    default: return SINGLE_EXAM_PROMPT;
  }
}

export async function POST(req: Request) {
  try {
    const { rawText, examType, aggregatedData, studentName, publisher } = await req.json();

    if (!rawText && !aggregatedData) {
      return NextResponse.json({ error: 'Veri bulunamadı.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ 
        error: 'Yapay zeka analizi için .env dosyanıza geçerli bir GEMINI_API_KEY eklemeniz gerekiyor. Google AI Studio üzerinden ücretsiz API anahtarı alabilirsiniz.',
        needsKey: true
      }, { status: 500 });
    }

    let selectedPrompt = aggregatedData ? SYNC_PROMPT : (getPrompt(examType || 'SINGLE') + "\n\nEk Görev: 3. LGS derslerinin (TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ) her biri için belgede yer alan TÜM konuları (veya en azından en kritik 4-5 konuyu) başarı yüzdeleriyle (%0-100) çıkar. Eksik olanları 'isWeak: true' olarak işaretle. Ayrıca her bir ders için zayıf konu (weakTopic) alanını belirle.");
    
    if (publisher) {
      selectedPrompt += `\n\nYAYIN EVİ BİLGİSİ: Bu sınav "${publisher}" yayınıdır. Lütfen evaluationSummary yazarken bu yayının (zorluk derecesini bilerek/tahmin ederek) adını da zikret ve analizine kat. Örneğin öğrenci zor bir yayında (Nitelik, Özdebir, Sinan Kuzucu vb.) düştüyse "Bu yayın zorlayıcıydı, yeni nesil soru pratiklerine ağırlık vermelisin" gibi yorum yap. Veya Okyanus, Hız gibi yayınlarda analizine bunu dahil et.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [
        { role: 'user', parts: [{ text: aggregatedData ? JSON.stringify(aggregatedData) : rawText }] }
      ],
      config: {
        systemInstruction: selectedPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            evaluationSummary: { type: 'string', description: 'Rehber öğretmen üslubuyla öğrencinin sınav analizi' },
            subjects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Ders adı: TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ' },
                  questionCount: { type: 'number', description: 'Haftalık atanacak soru sayısı' },
                  weakTopic: { type: 'string', description: 'Bu dersteki en zayıf veya en çok yanlış yapılan konu adı. Eğer zayıf konu bulunmuyorsa "Genel Tekrar" veya "Günlük Rutin" yazılmalıdır.' },
                  topics: {
                    type: 'array',
                    description: 'Derse ait tespit edilen konular ve başarı yüzdeleri',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Konu adı' },
                        percentage: { type: 'number', description: 'Başarı yüzdesi (0-100 arası)' },
                        isWeak: { type: 'boolean', description: 'Bu konu zayıf/eksik mi?' }
                      },
                      required: ['name', 'percentage', 'isWeak']
                    }
                  }
                },
                required: ['name', 'questionCount', 'weakTopic', 'topics']
              }
            }
          },
          required: ['evaluationSummary', 'subjects']
        }
      }
    });

    const aiData = JSON.parse(response.text || '{}');

    return NextResponse.json({ success: true, aiData });
  } catch (error: any) {
    console.error('AI Error:', error);
    
    const errorStr = String(error.message || error.statusText || '');
    let friendlyMessage = 'Yapay zeka hatası: ' + (error.message || 'Bilinmeyen hata');
    
    if (errorStr.includes('API_KEY_SERVICE_BLOCKED') || errorStr.includes('service blocked') || error.status === 403) {
      friendlyMessage = 'Yapay zeka anahtarı yetkilendirme hatası aldı (API_KEY_SERVICE_BLOCKED). .env dosyanızdaki GEMINI_API_KEY anahtarının "Generative Language API" (Gemini) erişim izni bulunmuyor veya kısıtlanmış. Lütfen Google Cloud Console veya Google AI Studio\'dan kısıtlanmamış bir API anahtarı kullanın.';
    } else if (
      errorStr.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') || 
      errorStr.includes('invalid authentication credentials') || 
      error.status === 401
    ) {
      friendlyMessage = 'Yapay zeka anahtarı doğrulama hatası aldı (401). Lütfen .env dosyanızdaki GEMINI_API_KEY değerini kontrol edin. Eğer anahtarınız AQ. ile başlıyorsa, bu yeni anahtar biçimiyle ilgili bir sorun olabilir. Google AI Studio\'dan (https://aistudio.google.com/) yeni, kısıtlanmamış bir API anahtarı (mümkünse AIzaSy ile başlayan) oluşturup .env dosyanızı güncellemeniz önerilir.';
    } else if (
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('429') ||
      errorStr.includes('quota') ||
      error.status === 429
    ) {
      friendlyMessage = 'Yapay zeka istek kotası veya limit sınırı aşıldı (429 / RESOURCE_EXHAUSTED). Ücretsiz Gemini API anahtarları dakikada en fazla 15 istek sınırı içerir. Lütfen 1 dakika kadar bekledikten sonra tekrar deneyiniz. Sorun devam ederse Google AI Studio üzerinden kota durumunuzu veya API anahtarınızı kontrol edin.';
    } else if (
      errorStr.includes('503') || 
      errorStr.includes('UNAVAILABLE') || 
      errorStr.includes('high demand')
    ) {
      friendlyMessage = 'Google Yapay Zeka sunucuları şu anda çok yoğun (503). Lütfen 10-15 saniye bekleyip tekrar deneyin.';
    }
    
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}
