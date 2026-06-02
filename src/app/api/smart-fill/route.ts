import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const ALL_DAYS_SHORT = ['PTESİ', 'SALI', 'ÇARŞ', 'PERŞ', 'CUMA', 'CMTESİ', 'PAZAR'];

// ─── Her ders için günlük soru aralığı ───
// Ana dersler fazla, ara dersler orta
const SUBJECT_QUOTAS: Record<string, { min: number; ideal: number; max: number }> = {
  'TÜRKÇE':              { min: 20, ideal: 40, max: 80 },
  'MATEMATİK':           { min: 20, ideal: 40, max: 80 },
  'FEN BİLİMLERİ':       { min: 18, ideal: 35, max: 70 },
  'T.C. İNKILAP TARİHİ':{ min: 10, ideal: 20, max: 35 },
  'İNGİLİZCE':           { min: 10, ideal: 20, max: 35 },
  'DİN KÜLTÜRÜ':         { min: 10, ideal: 20, max: 35 },
  'PARAGRAF':            { min: 10, ideal: 20, max: 35 },
};

const DAILY_MIN   = 100;
const DAILY_MAX   = 265;
const DAILY_IDEAL = 155;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject:          { type: Type.STRING,  description: 'Ders adı — mevcut derslerden biriyle tam eşleştir' },
          days:             { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Kısa gün kodları: PTESİ SALI ÇARŞ PERŞ CUMA CMTESİ PAZAR' },
          type:             { type: Type.STRING,  description: '"question" veya "page"' },
          questionCount:    { type: Type.NUMBER,  description: 'Günlük soru sayısı' },
          userSpecified:    { type: Type.BOOLEAN, description: 'Kullanıcı bu sayıyı açıkça belirttiyse true' },
          topics:           { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Konu adları — konu havuzundan seç' },
          source:           { type: Type.STRING,  description: 'Kaynak/kitap adı (type=page ise)' },
          startPage:        { type: Type.NUMBER,  description: 'Başlangıç sayfası (type=page ise)' },
          endPage:          { type: Type.NUMBER,  description: 'Bitiş sayfası (type=page ise)' },
        },
        required: ['subject', 'days', 'type', 'questionCount'],
      },
    },
  },
  required: ['fills'],
};

export async function POST(req: Request) {
  try {
    const { text, topicsMap } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Metin boş.' }, { status: 400 });
    }
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ error: 'GEMINI_API_KEY tanımlı değil.' }, { status: 500 });
    }

    const topicList = Object.entries(topicsMap as Record<string, string[]>)
      .map(([s, ts]) => `${s}: [${ts.join(', ')}]`).join('\n');

    const prompt = `Sen LGS hazırlık sürecinde çalışan bir Türk eğitim koçusun. Öğrencinin haftalık ders programını aşağıdaki kurallara göre oluştur.

━━━ MEVCUT DERSLER ━━━
TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, T.C. İNKILAP TARİHİ, İNGİLİZCE, DİN KÜLTÜRÜ, PARAGRAF

━━━ GÜN KODLARI ━━━
PTESİ=Pazartesi | SALI | ÇARŞ=Çarşamba | PERŞ=Perşembe | CUMA | CMTESİ=Cumartesi | PAZAR

━━━ KONU HAVUZU ━━━
${topicList}

━━━ SORU SAYISI KURALLARI (KESİNLİKLE UYULMASI ZORUNLU) ━━━
1. Tüm derslerin GÜNLÜK TOPLAMI 250-500 soru arasında olmalı. Hedef: ~350 soru/gün.
2. Her ders için GÜNLÜK ASGARİ SINIRLAR:
   - TÜRKÇE       → min 60, ideal 80, max 120 soru/gün
   - MATEMATİK    → min 60, ideal 80, max 120 soru/gün
   - FEN BİLİMLERİ→ min 50, ideal 70, max 100 soru/gün
   - İNKILAP/DİN/İNGİLİZCE/PARAGRAF → min 20, ideal 30, max 50 soru/gün
3. Kullanıcı açıkça bir sayı belirttiyse (ör: "40 soru") → userSpecified=true, o sayıyı MINIMUM olarak kabul et, asgari sınır daha yüksekse asgari sınırı kullan.
4. Kullanıcı sayı belirtmediyse → ideal değeri kullan.
5. type="page" durumunda questionCount=0 yaz.

━━━ GENEL KURALLAR ━━━
- "her gün" / "hergün" → days = tüm 7 gün
- "hafta içi" → PTESİ SALI ÇARŞ PERŞ CUMA
- "hafta sonu" → CMTESİ PAZAR
- "X gün" → haftanın ilk X günü
- Konu adlarını konu havuzundan büyük harfle seç
- type="page": kaynak adı + sayfa aralığı varsa

━━━ ÖĞRENCİNİN TALİMATI ━━━
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema },
    });

    if (!response.text) throw new Error('AI yanıt boş döndü.');

    const parsed = JSON.parse(response.text);
    let fills: any[] = (parsed.fills || []);

    // ─── Sunucu tarafı zorlama ───────────────────────────────────────────
    // 1. Günleri normalize et, sayfa aralıklarını hesapla
    fills = fills.map((f: any) => {
      let days: string[] = (f.days || []).map((d: string) => d.toUpperCase().trim());
      if (days.length === 0) days = [...ALL_DAYS_SHORT];

      let pageRanges: string[] | undefined;
      if (f.type === 'page' && f.startPage && f.endPage && days.length > 0) {
        const total = f.endPage - f.startPage + 1;
        const perDay = Math.ceil(total / days.length);
        pageRanges = days.map((_, i) => {
          const start = f.startPage + i * perDay;
          const end   = Math.min(f.startPage + (i + 1) * perDay - 1, f.endPage);
          return `${f.source ? f.source + ' ' : ''}Syf ${start}-${end}`;
        });
      }

      // Asgari soru sınırını uygula
      if (f.type === 'question') {
        const quota  = SUBJECT_QUOTAS[f.subject] || { min: 30, ideal: 50, max: 100 };
        const aiQ    = Number(f.questionCount) || 0;
        const base   = f.userSpecified ? Math.max(aiQ, quota.min) : quota.ideal;
        f.questionCount = Math.min(Math.max(base, quota.min), quota.max);
      }

      return { ...f, days, pageRanges };
    });

    // 2. Günlük toplam kontrolü & ölçekleme
    const questionFills = fills.filter(f => f.type === 'question');
    const dailyTotal    = questionFills.reduce((s: number, f: any) => s + (f.questionCount || 0), 0);

    if (questionFills.length > 0 && dailyTotal < DAILY_MIN) {
      // Toplam düşük → eksik kalmayan dersleri ideal değere çek
      const deficit = DAILY_IDEAL - dailyTotal;
      const share   = Math.ceil(deficit / questionFills.length);
      fills = fills.map((f: any) => {
        if (f.type !== 'question') return f;
        const quota   = SUBJECT_QUOTAS[f.subject] || { min: 30, ideal: 60, max: 120 };
        const bumped  = Math.min((f.questionCount || 0) + share, quota.max);
        return { ...f, questionCount: bumped };
      });
    } else if (dailyTotal > DAILY_MAX) {
      // Toplam yüksek → orantılı küçült
      const ratio = DAILY_MAX / dailyTotal;
      fills = fills.map((f: any) => {
        if (f.type !== 'question') return f;
        const quota   = SUBJECT_QUOTAS[f.subject] || { min: 30, ideal: 60, max: 120 };
        return { ...f, questionCount: Math.max(quota.min, Math.round((f.questionCount || 0) * ratio)) };
      });
    }

    return NextResponse.json({ success: true, fills });
  } catch (err: any) {
    console.error('smart-fill hatası:', err);
    return NextResponse.json({ error: err.message || 'Bilinmeyen hata.' }, { status: 500 });
  }
}
