'use client';
import React, { useState, useEffect } from 'react';
import { toggleTaskCompletion, createSchedule } from '../actions/schedule';

const DAYS = ['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'];
const SUBJECTS = ['TÜRKÇE', 'MATEMATİK', 'FEN BİLİMLERİ', 'T.C. İNKILAP TARİHİ', 'İNGİLİZCE', 'DİN KÜLTÜRÜ'];

const TOPICS_MAP: Record<string, string[]> = {
  'TÜRKÇE': ['SÖZCÜKTE ANLAM', 'CÜMLEDE ANLAM', 'PARAGRAFTA ANLAM', 'FİİLİMSİLER', 'YAZIM KURALLARI', 'NOKTALAMA İŞARETLERİ', 'CÜMLENİN ÖGELERİ', 'CÜMLE TÜRLERİ', 'FİİLDE ÇATI', 'ANLATIM BOZUKLUKLARI', 'METİN TÜRLERİ VE SÖZ SANATLARI', 'SÖZEL MANTIK', 'BRANŞ DENEME'],
  'MATEMATİK': ['ÇARPANLAR VE KATLAR', 'ÜSLÜ İFADELER', 'KAREKÖKLÜ İFADELER', 'VERİ ANALİZİ', 'BASİT OLAYLARIN OLMA OLASILIĞI', 'CEBİRSEL İFADELER VE ÖZDEŞLİKLER', 'DOĞRUSAL DENKLEMLER', 'EŞİTSİZLİKLER', 'ÜÇGENLER', 'EŞLİK VE BENZERLİK', 'DÖNÜŞÜM GEOMETRİSİ', 'GEOMETRİK CİSİMLER'],
  'FEN BİLİMLERİ': ['MEVSİMLER VE İKLİM', 'DNA VE GENETİK KOD', 'BASINÇ', 'MADDE VE ENDÜSTRİ', 'BASİT MAKİNELER', 'ENERJİ DÖNÜŞÜMLERİ VE ÇEVRE BİLİMİ', 'ELEKTRİK YÜKLERİ VE ELEKTRİK ENERJİSİ'],
  'T.C. İNKILAP TARİHİ': ['BİR KAHRAMAN DOĞUYOR', 'MİLLİ UYANIŞ', 'MİLLİ BİR DESTAN', 'ATATÜRKÇÜLÜK', 'DEMOKRATİKLEŞME ÇABALARI', 'DIŞ POLİTİKA', 'ATATÜRK\'ÜN ÖLÜMÜ'],
  'İNGİLİZCE': ['FRIENDSHIP', 'TEEN LIFE', 'IN THE KITCHEN', 'ON THE PHONE', 'THE INTERNET', 'ADVENTURES', 'TOURISM', 'CHORES', 'SCIENCE', 'NATURAL FORCES'],
  'DİN KÜLTÜRÜ': ['KADER İNANCI', 'ZEKAT VE SADAKA', 'DİN VE HAYAT', 'HZ. MUHAMMED\'İN ÖRNEKLİĞİ', 'KUR\'AN-I KERİM VE ÖZELLİKLERİ'],
  'PARAGRAF': ['GÜNLÜK RUTİN', 'KARIŞIK DENEME', 'ZAMANLI TEST']
};

const GRADE_TOPICS_MAP: Record<string, Record<string, string[]>> = {
  '5. Sınıf': {
    'TÜRKÇE':        ['SÖZCÜKTE ANLAM', 'CÜMLEDE ANLAM', 'PARAGRAF', 'İSİM', 'SIFAT', 'ZAMİR', 'FİİL', 'ZARF', 'BAĞLAÇ', 'YAZIM KURALLARI', 'NOKTALAMA İŞARETLERİ', 'METİN TÜRLERİ', 'ATASÖZÜ VE DEYİM'],
    'MATEMATİK':     ['DOĞAL SAYILAR', 'ÇARPANLAR VE KATLAR', 'KESİRLER', 'ONDALIKlı SAYILAR', 'YÜZDELİK VE ORAN', 'VERİ ANALİZİ', 'ÇOKGENLER', 'ÇEMBER VE DAİRE', 'ÖLÇME', 'ALAN HESAPLAMA'],
    'FEN BİLİMLERİ': ['HÜCRE', 'VÜCUDUMUZ BİR BÜTÜNDÜR', 'KUVVET VE HAREKET', 'MADDE VE DEĞİŞİM', 'IŞIK VE SES', 'DÜNYA VE EVREN', 'ÇEVREMİZİ TANIYALIM', 'ENERJİ'],
    'T.C. İNKILAP TARİHİ': ['SOSYAL BİLGİLER TEMEL KAVRAMLAR', 'KÜLTÜR VE MİRAS', 'İNSAN VE TOPLUM', 'GÜÇ-YÖNETİM-TOPLUM', 'ÜRETİM-DAĞITİM-TÜKETİM', 'BİLİM-TEKNOLOJİ-TOPLUM'],
    'İNGİLİZCE':     ['GREETINGS', 'MY TOWN', 'GAMES AND HOBBIES', 'HEALTH', 'ANIMAL SHELTER', 'CELEBRATIONS', 'FOOD AND DRINKS', 'SPORTS'],
    'DİN KÜLTÜRÜ':   ['İSLAM\'IN ŞARTLARI', 'İMANIN ŞARTLARI', 'HZ. MUHAMMED', 'KUR\'AN-I KERİM', 'İBADET', 'AHLAKİ DEĞERLER', 'DİNLER TARİHİ'],
  },
  '6. Sınıf': {
    'TÜRKÇE':        ['SÖZCÜKTE ANLAM', 'CÜMLEDE ANLAM', 'PARAGRAFTA ANLAM', 'FİİL', 'ZAMİR', 'SIFAT', 'İSİM', 'SÖZCÜK TÜRLERİ', 'YAZIM KURALLARI', 'NOKTALAMA', 'SÖZ SANATLARI', 'METİN TÜRLERİ'],
    'MATEMATİK':     ['ÇARPANLAR VE KATLAR', 'KESİRLERLE İŞLEMLER', 'ONDALIKlı SAYILAR', 'ORAN VE ORANTININ', 'YÜZDELER', 'CEBİR GİRİŞ', 'DENKLEMLER', 'GEOMETRİ', 'ALAN VE ÇEVRE', 'VERİ ANALİZİ', 'OLASILIK'],
    'FEN BİLİMLERİ': ['HÜCRE VE ORGANİZMALAR', 'VÜCUDUMUZDAKI SİSTEMLER', 'MADDE VE ISI', 'IŞIK VE SES', 'KUVVET VE HAREKET', 'ELEKTRİK VE MANYETİZMA', 'GÜNEŞ SİSTEMİ'],
    'T.C. İNKILAP TARİHİ': ['KÜLTÜR VE MİRAS', 'İNSAN VE TOPLUM', 'GÜÇ-YÖNETİM-TOPLUM', 'ÜRETİM-DAĞITİM-TÜKETİM', 'BİLİM-TEKNOLOJİ-TOPLUM', 'KÜRESEL BAĞLANTILAR'],
    'İNGİLİZCE':     ['LIFE', 'YUMMY BREAKFAST', 'WEATHER AND EMOTIONS', 'AMAZING ANIMALS', 'MY VILLAGE', 'TV AND SOCIAL MEDIA', 'TRAVEL'],
    'DİN KÜLTÜRÜ':   ['İSLAM\'IN ŞARTLARI', 'KUR\'AN VE YORUMU', 'Hz. MUHAMMED\'İN HAYATI', 'İBADET', 'İSLAM AHLAKI', 'İNSAN HAKLARI'],
  },
  '7. Sınıf': {
    'TÜRKÇE':        ['SÖZCÜKTE ANLAM', 'CÜMLEDE ANLAM', 'PARAGRAFTA ANLAM', 'FİİLİMSİLER', 'YAZIM KURALLARI', 'CÜMLENİN ÖGELERİ', 'CÜMLE TÜRLERİ', 'FİİL ZAMANI', 'ANLATIM BİÇİMLERİ', 'METİN TÜRLERİ', 'NOKTALAMA', 'SÖZEL MANTIK'],
    'MATEMATİK':     ['ÇARPANLAR VE KATLAR', 'ÜSLÜ SAYILAR', 'KÖKlü SAYILAR', 'CEBİRSEL İFADELER', 'DOĞRUSAL DENKLEMLER', 'ORANTILAR', 'YÜZDELER VE FAİZ', 'GEOMETRİ', 'ÇEVRİT AÇILAR', 'ÜÇGENLERİN ÖZELLİKLERİ', 'VERİ ANALİZİ', 'OLASILIK'],
    'FEN BİLİMLERİ': ['HÜCRE VE BÖLÜNME', 'KALITIM VE ADAPTASYON', 'KUVVET VE ENERJİ', 'SAF MADDE VE KARIŞIM', 'IŞIK', 'ELEKTRİK', 'GÜNEŞ SİSTEMİ VE UZAY'],
    'T.C. İNKILAP TARİHİ': ['İLETİŞİM VE İNSAN İLİŞKİLERİ', 'NÜFUS VE YERLEŞME', 'EKONOMİ VE SOSYAL HAYAT', 'BİLİM VE TEKNOLOJİ', 'TÜRKİYE\'DE BÖLGELER', 'ÜLKELER VE BÖLGELER'],
    'İNGİLİZCE':     ['APPEARANCE AND PERSONALITY', 'SPORTS', 'BIOGRAPHIES', 'WILD ANIMALS', 'TV', 'DEMOCRACY', 'INTERNET AND MEDIA', 'SHOPPING', 'ENVIRONMENT'],
    'DİN KÜLTÜRÜ':   ['ALLAH\'A İNANÇ', 'KUR\'AN-I KERİM', 'HZ. MUHAMMED', 'İBADET VE AHLAKİ DEĞERLER', 'DİN VE HAYAT', 'DÜNYA DİNLERİ'],
  },
  'LGS': { ...TOPICS_MAP },
  '9. Sınıf': {
    'TÜRKÇE':        ['METİN TÜRLERİ', 'ANLAM BİLGİSİ', 'SÖZCÜK TÜRLERİ', 'CÜMLENİN ÖGELERİ', 'ANLATIM BİÇİMLERİ', 'YAZIM KURALLARI', 'NOKTALAMA', 'DİL BİLGİSİ', 'PARAGRAF YORUMU', 'EDEBÎ SANATLAR'],
    'MATEMATİK':     ['KÜMEler', 'MANTIK', 'GERÇEK SAYILAR', 'ÜSLÜ VE KÖKlü İFADELER', 'ORAN-ORANTININ', 'POLİNOMLAR', 'DENKLEM SİSTEMLERİ', 'EŞİTSİZLİKLER', 'ÜÇGENLER', 'ÇEVRİT VE DÖRTGENLER', 'ÇEMBER', 'İSTATİSTİK', 'OLASILIK'],
    'FEN BİLİMLERİ': ['KİNEMATİK', 'DİNAMİK', 'İŞ-GÜÇ-ENERJİ', 'MADDE VE ÖZELLİKLERİ', 'ATOM', 'PERİYODİK SİSTEM', 'KİMYASAL BAĞLAR', 'HÜCRE', 'HÜCRE BÖLÜNMESİ', 'KALITIM', 'EKOSİSTEM'],
    'T.C. İNKILAP TARİHİ': ['OSMANLI DEVLETİ', 'FRANSIZ İHTİLALİ', 'SANAYİ DEVRİMİ', 'MİLLİYETÇİLİK', 'BALKAN SAVAŞLARI', 'DÜNYA SAVAŞLARI', 'ATATÜRK İLKELERİ'],
    'İNGİLİZCE':     ['STUDYING ABROAD', 'MY ENVIRONMENT', 'HUMANS AND NATURE', 'COMING SOON', 'INSPIRATIONAL PEOPLE', 'BRIDGING CULTURES', 'NATURAL DISASTERS', 'DIGITAL AGE', 'INNOVATIONS', 'TELEVISION AND SOCIAL MEDIA'],
    'DİN KÜLTÜRÜ':   ['İSLAM\'IN TEMEL KAYNAKLARI', 'İSLAM\'DA İBADET', 'Hz. MUHAMMED\'İN HAYATI', 'AHLAKİ DEĞERLER', 'DÜNYA DİNLERİ', 'DİN VE BİLİM'],
  },
  '10. Sınıf': {
    'TÜRKÇE':        ['DİVAN EDEBİYATI', 'HALK EDEBİYATI', 'ROMAN', 'HİKÂYE', 'ŞİİR', 'TÜYATRO', 'EDEBİ DÖNEMLER', 'ANLAM BİLGİSİ', 'DİL BİLGİSİ', 'PARAGRAF'],
    'MATEMATİK':     ['FONKSİYONLAR', 'İKİNCİ DERECEDEN FONKSİYONLAR', 'ÜSTEL VE LOGARİTMİK FONKSİYONLAR', 'TRİGONOMETRİ', 'ANALİTİK GEOMETRİ', 'PERMÜTASYON-KOMBİNASYON', 'OLASILIK', 'İSTATİSTİK'],
    'FEN BİLİMLERİ': ['NEWTON YASALARI', 'DAIRESEL HAREKET', 'ÇALIŞMA-ENERJİ', 'KİMYASAL TEPKİMELER', 'ASİT-BAZ', 'ELEKTROKİMYA', 'KALITIM', 'EVRİM', 'EKOSÜTEMLER'],
    'T.C. İNKILAP TARİHİ': ['KURTULUŞ SAVAŞI', 'TÜRK DEVRİMİ', 'ATATÜRK DÖNEMİ', 'ÇAĞDAŞLAŞMA', 'DIŞ POLİTİKA', 'DEMOKRAT PARTİ DÖNEMİ'],
    'İNGİLİZCE':     ['SCHOOL LIFE', 'PLANS', 'LEGENDARY FIGURES', 'INVENTIONS', 'BACK TO THE PAST', 'HELPFUL TIPS', 'TOURISM', 'CHORES', 'ENVIRONMENT'],
    'DİN KÜLTÜRÜ':   ['İSLAM\'IN TEMEL KAYNAKLARI', 'İSLAM\'DA AİLE', 'BİREY-TOPLUM', 'ÇALIŞMA HAYATI', 'İSLAM VE BİLİM', 'DİNİ AKIMLAR'],
  },
  '11. Sınıf': {
    'TÜRKÇE':        ['SERVET-İ FÜNUN', 'MİLLİ EDEBİYAT', 'CUMHURİYET EDEBİYATI', 'ROMAN ANALİZİ', 'ŞİİR ANALİZİ', 'DENEME-ELEŞTİRİ', 'DİL BİLGİSİ', 'PARAGRAF', 'ANLATIM BİÇİMLERİ'],
    'MATEMATİK':     ['LİMİT VE SÜREKLİLİK', 'TÜREV', 'TÜREV UYGULAMALARI', 'İNTEGRAL', 'İNTEGRAL UYGULAMALARI', 'DİZİLER', 'SERİLER', 'OLASILIK', 'İSTATİSTİK'],
    'FEN BİLİMLERİ': ['MANYETİZMA', 'ELEKTROMANYETİK İNDÜKSİYON', 'MODERN FİZİK', 'ORGANİK KİMYA', 'ORGANİK REAKSİYONLAR', 'BİYOKİMYA', 'GENETİK MÜHENDİSLİĞİ', 'SİNİR SİSTEMİ'],
    'T.C. İNKILAP TARİHİ': ['II. DÜNYA SAVAŞI', 'SOĞUK SAVAŞ DÖNEMİ', 'TÜRKİYE-AB İLİŞKİLERİ', 'KÜRESELLEŞME', 'GÜNÜMÜZ TÜRKİYESİ'],
    'İNGİLİZCE':     ['FUTURE JOBS', 'HEALTHY LIFE', 'HARD TIMES', 'WHAT A LIFE', 'THE FUTURE', 'HEROES', 'TOURISM', 'DIGITAL AGE', 'ENVIRONMENT'],
    'DİN KÜLTÜRÜ':   ['AHLAK VE DEĞERLER', 'İSLAM MEDENİYETİ', 'DİNLER TARİHİ', 'GÜNÜMÜZ DİNİ AKIMLARI', 'BİLİM-DİN-FELSEFE'],
  },
};

const getMockPercentage = (topic: string) => {
  const hash = topic.length * 7 % 100;
  return hash < 30 ? hash + 15 : hash;
};

const findMatchingSubject = (aiName: string): string | undefined => {
  if (!aiName) return undefined;
  const upper = aiName.toUpperCase().trim();
  
  if (upper.includes('TÜRKÇE') || upper.includes('TURKCE') || upper.includes('TRK') || upper.includes('TUR')) return 'TÜRKÇE';
  if (upper.includes('MATEMATİK') || upper.includes('MATEMATIK') || upper.includes('MAT')) return 'MATEMATİK';
  if (upper.includes('FEN') || upper.includes('FİZ') || upper.includes('KİM') || upper.includes('BİY')) return 'FEN BİLİMLERİ';
  if (upper.includes('İNKILAP') || upper.includes('INKILAP') || upper.includes('TARİH') || upper.includes('TARIH') || upper.includes('T.C.')) return 'T.C. İNKILAP TARİHİ';
  if (upper.includes('İNGİLİZCE') || upper.includes('INGILIZCE') || upper.includes('İNG') || upper.includes('ING') || upper.includes('ENGLISH')) return 'İNGİLİZCE';
  if (upper.includes('DİN') || upper.includes('DIN') || upper.includes('AHLAK') || upper.includes('KÜLTÜR') || upper.includes('KULTUR')) return 'DİN KÜLTÜRÜ';
  if (upper.includes('PARAGRAF')) return 'PARAGRAF';
  
  return undefined;
};

type SubjectSmartState = {
  days: string[];
  topics: string[];
  q: string;
  aiParsedTopics?: {name: string, percentage: number, isWeak: boolean}[];
};

type TemplateTopicEntry = { name: string; questionCount: number };
type TemplateSubjectState = {
  enabled: boolean;
  days: string[];
  dailyGoal: number;
  topics: TemplateTopicEntry[];
  customInput: string;
};

const TemplateSubjectCard = ({
  subject,
  allTopics,
  state,
  unit,
  onUpdate,
}: {
  subject: string;
  allTopics: string[];
  state: TemplateSubjectState;
  unit: string;
  onUpdate: (s: TemplateSubjectState) => void;
}) => {
  const selectedNames = state.topics.map(t => t.name);

  const toggleDay = (day: string) => {
    const next = state.days.includes(day) ? state.days.filter(d => d !== day) : [...state.days, day];
    onUpdate({ ...state, days: next });
  };

  const toggleTopic = (name: string) => {
    if (selectedNames.includes(name)) {
      onUpdate({ ...state, topics: state.topics.filter(t => t.name !== name) });
    } else {
      onUpdate({ ...state, topics: [...state.topics, { name, questionCount: 10 }] });
    }
  };

  const setQuestionCount = (name: string, val: number) => {
    onUpdate({ ...state, topics: state.topics.map(t => t.name === name ? { ...t, questionCount: Math.max(1, val) } : t) });
  };

  const addCustomTopic = () => {
    const trimmed = state.customInput.trim().toUpperCase();
    if (!trimmed || selectedNames.includes(trimmed)) return;
    onUpdate({ ...state, topics: [...state.topics, { name: trimmed, questionCount: 10 }], customInput: '' });
  };

  const autoSelectFirst3 = () => {
    const toAdd = allTopics.slice(0, 3).filter(t => !selectedNames.includes(t));
    onUpdate({ ...state, topics: [...state.topics, ...toAdd.map(n => ({ name: n, questionCount: 10 }))] });
  };

  const SUBJECT_COLORS: Record<string, string> = {
    'TÜRKÇE': '#6366F1', 'MATEMATİK': '#0EA5E9', 'FEN BİLİMLERİ': '#10B981',
    'T.C. İNKILAP TARİHİ': '#F59E0B', 'İNGİLİZCE': '#EC4899', 'DİN KÜLTÜRÜ': '#8B5CF6', 'PARAGRAF': '#64748B',
  };
  const color = SUBJECT_COLORS[subject] || 'var(--primary)';

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: `1.5px solid ${state.enabled ? color + '55' : 'var(--border)'}`, padding: '1rem 1.25rem', marginBottom: '0.85rem', boxShadow: state.enabled ? `0 2px 12px ${color}18` : 'none', transition: 'all 0.2s' }}>
      {/* Başlık Satırı */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: state.enabled ? '0.85rem' : 0 }}>
        {/* Checkbox + Ders Adı */}
        <button
          onClick={() => onUpdate({ ...state, enabled: !state.enabled })}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: '180px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', border: `2px solid ${state.enabled ? color : 'var(--border)'}`, background: state.enabled ? color : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
            {state.enabled && <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: state.enabled ? color : 'var(--text-secondary)' }}>{subject}</span>
        </button>

        {state.enabled && (
          <>
            {/* Günlük Hedef */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-main)', padding: '0.3rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>GÜNLÜK HEDEF</span>
              <input
                type="number"
                min={1}
                value={state.dailyGoal}
                onChange={e => onUpdate({ ...state, dailyGoal: Math.max(1, Number(e.target.value)) })}
                style={{ width: '52px', padding: '0.25rem 0.3rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 800, textAlign: 'center', outline: 'none', color: color }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{unit}</span>
            </div>

            {/* Gün Seçimi */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', flex: 1 }}>
              {['PTESİ', 'SALI', 'ÇARŞ', 'PERŞ', 'CUMA', 'CMTESİ', 'PAZAR'].map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  style={{ padding: '0.35rem 0.55rem', borderRadius: '6px', border: 'none', background: state.days.includes(day) ? color : 'var(--bg-main)', color: state.days.includes(day) ? 'white' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {day}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {state.enabled && (
        <>
          {/* Konu Ekleme Satırı */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>ÇALIŞILACAK KONULAR</span>
            <input
              type="text"
              value={state.customInput}
              onChange={e => onUpdate({ ...state, customInput: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addCustomTopic()}
              placeholder="Elle konu ekle..."
              style={{ flex: 1, padding: '0.3rem 0.6rem', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }}
            />
            <button onClick={addCustomTopic} style={{ padding: '0.3rem 0.6rem', borderRadius: '7px', background: color, color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', lineHeight: 1 }}>+</button>
            <button onClick={autoSelectFirst3} style={{ padding: '0.3rem 0.7rem', borderRadius: '7px', background: 'rgba(99,102,241,0.1)', color: color, border: 'none', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>İLK 3 KONU OTOMATİK</button>
          </div>

          {/* Konu Pilleri */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {allTopics.map(topic => {
              const isSelected = selectedNames.includes(topic);
              const entry = state.topics.find(t => t.name === topic);
              return (
                <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: '7px', border: `1.5px solid ${isSelected ? color : 'var(--border)'}`, background: isSelected ? color + '10' : 'var(--bg-main)', overflow: 'hidden', transition: 'all 0.15s' }}>
                  <button
                    onClick={() => toggleTopic(topic)}
                    style={{ padding: '0.3rem 0.6rem', background: 'none', border: 'none', fontSize: '0.72rem', fontWeight: 700, color: isSelected ? color : 'var(--text-secondary)', cursor: 'pointer' }}>
                    {isSelected ? '✓ ' : ''}{topic}
                  </button>
                  {isSelected && (
                    <>
                      <div style={{ width: '1px', alignSelf: 'stretch', background: color + '55' }} />
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={entry?.questionCount ?? 10}
                        onChange={e => setQuestionCount(topic, Number(e.target.value))}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '46px', padding: '0.25rem 0.3rem', border: 'none', background: color + '0A', fontSize: '0.82rem', fontWeight: 800, color: color, textAlign: 'center', outline: 'none' }}
                      />
                      <span style={{ fontSize: '0.65rem', color: color, paddingRight: '0.45rem', paddingLeft: '0.1rem', fontWeight: 700 }}>{unit}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Seçili konular özeti */}
          {state.topics.length > 0 && (
            <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: color + '0D', borderRadius: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {/* Konu dökümü — rakamlar düzenlenebilir */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color, whiteSpace: 'nowrap' }}>Konu dağılımı:</span>
                {state.topics.map(t => (
                  <span key={t.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: 'white', padding: '0.1rem 0.2rem 0.1rem 0.45rem', borderRadius: '5px', border: `1.5px solid ${color}44` }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.7rem' }}>{t.name}</span>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={t.questionCount}
                      onChange={e => setQuestionCount(t.name, Math.max(1, Number(e.target.value)))}
                      onClick={e => e.stopPropagation()}
                      style={{
                        width: '38px', padding: '0.05rem 0.15rem',
                        border: `1px solid ${color}55`, borderRadius: '4px',
                        fontSize: '0.8rem', fontWeight: 900, color,
                        textAlign: 'center', outline: 'none', background: color + '0A',
                      }}
                    />
                  </span>
                ))}
              </div>
              {/* Haftalık toplam */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.2rem', borderTop: `1px dashed ${color}33` }}>
                <span style={{ fontWeight: 700, color }}>{state.dailyGoal} {unit}/gün</span>
                <span style={{ color: 'var(--text-muted)' }}>×</span>
                <span style={{ fontWeight: 700 }}>{state.days.length} gün</span>
                <span style={{ color: 'var(--text-muted)' }}>=</span>
                <span style={{ fontWeight: 900, fontSize: '0.8rem', color, background: color + '15', padding: '0.1rem 0.5rem', borderRadius: '5px' }}>
                  {state.dailyGoal * state.days.length} {unit}/hafta
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SmartSubjectCard = ({ subject, topics, state, onUpdate }: { 
  subject: string, 
  topics: string[], 
  state: SubjectSmartState,
  onUpdate: (s: SubjectSmartState) => void 
}) => {
  const isActive = state.topics.length > 0;

  const toggleDay = (day: string) => {
    const nextDays = state.days.includes(day) ? state.days.filter(d => d !== day) : [...state.days, day];
    onUpdate({ ...state, days: nextDays });
  };

  const toggleTopic = (topic: string) => {
    const nextTopics = state.topics.includes(topic) ? state.topics.filter(t => t !== topic) : [...state.topics, topic];
    onUpdate({ ...state, topics: nextTopics });
  };

  // Eğer yapay zekadan gerçek konular geldiyse onları kullan, eksik olan standart konuları da sonuna ekle
  const aiTopics = state.aiParsedTopics && state.aiParsedTopics.length > 0 
    ? [...state.aiParsedTopics].sort((a,b) => a.percentage - b.percentage) 
    : [];

  const otherTopics = topics
    .filter(t => !aiTopics.some(aiT => aiT.name.toUpperCase().includes(t.toUpperCase()) || t.toUpperCase().includes(aiT.name.toUpperCase())))
    .map(t => ({ name: t, percentage: null, isWeak: false }));

  const displayTopics = aiTopics.length > 0 
    ? [...aiTopics, ...otherTopics] 
    : topics.map(t => ({ name: t, percentage: null, isWeak: false }));

  const handleLowTopics = () => {
    // Yapay zeka geldiyse isWeak olanları seç, yoksa baştan 3 tane seç
    const low = state.aiParsedTopics && state.aiParsedTopics.length > 0
      ? state.aiParsedTopics.filter(t => t.isWeak || t.percentage < 50).map(t => t.name)
      : displayTopics.slice(0, 3).map(t => t.name);
    onUpdate({ ...state, topics: low });
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        
        {/* Subject Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '200px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isActive ? 'var(--primary)' : 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {isActive && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>✓</span>}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{subject}</h3>
        </div>

        {/* Daily Goal Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>HEDEF</span>
          <input 
            type="text" 
            value={state.q}
            onChange={(e) => onUpdate({ ...state, q: e.target.value })}
            placeholder="50 Soru, Syf 20-30..."
            style={{ width: '120px', padding: '0.3rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', outline: 'none' }} 
          />
        </div>

        {/* Days Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', flex: 1 }}>
          {['PTESİ', 'SALI', 'ÇARŞ', 'PERŞ', 'CUMA', 'CMTESİ', 'PAZAR'].map(day => (
            <button 
              key={day}
              onClick={() => toggleDay(day)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: 'none', background: state.days.includes(day) ? 'var(--primary)' : 'var(--border)', color: state.days.includes(day) ? 'white' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              {day}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleLowTopics} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
          📉 Zayıf Konuları Seç
        </button>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
          {displayTopics.map(({name: topic, percentage, isWeak}) => ( // Tüm konular sığsın
            <button 
              key={topic}
              onClick={() => toggleTopic(topic)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: state.topics.includes(topic) ? '1px solid var(--primary)' : '1px solid var(--border)', background: state.topics.includes(topic) ? 'rgba(4, 120, 87, 0.05)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: state.topics.includes(topic) ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {topic} {percentage !== null && <span style={{ color: isWeak ? 'var(--danger)' : 'var(--success)' }}>({percentage}%)</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function WizardClient({ students }: { students: any[] }) {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examFile, setExamFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('standart');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSmartDist, setShowSmartDist] = useState(true);
  const [selectedArchiveExams, setSelectedArchiveExams] = useState<string[]>([]);
  const [showSmartTemplate, setShowSmartTemplate] = useState(false);
  const [templateGrade, setTemplateGrade] = useState('LGS');
  const [templateUnit, setTemplateUnit] = useState('Soru');

  const ALL_DAYS_SHORT = ['PTESİ', 'SALI', 'ÇARŞ', 'PERŞ', 'CUMA', 'CMTESİ', 'PAZAR'];
  const initTemplateState = (): Record<string, TemplateSubjectState> => {
    const s: Record<string, TemplateSubjectState> = {};
    SUBJECTS.forEach(sub => {
      const defaultGoal = ['TÜRKÇE','MATEMATİK'].includes(sub) ? 40
        : sub === 'FEN BİLİMLERİ' ? 35
        : 20;
      s[sub] = { enabled: false, days: [...ALL_DAYS_SHORT], dailyGoal: defaultGoal, topics: [], customInput: '' };
    });
    return s;
  };
  const [templateState, setTemplateState] = useState<Record<string, TemplateSubjectState>>(initTemplateState);
  

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  type ScheduleData = Record<string, Record<string, { q: string, t: string }>>;
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});

  // Bugünden başlayarak 7 gün — hem gün adı hem tarih
  const ALL_DAYS_ORDERED = ['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'];
  const TR_DAY_INDEX: Record<number, number> = { 1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 0:6 }; // JS getDay → TR index

  const { orderedDays, weekDates } = (() => {
    const today = new Date();
    const startIdx = TR_DAY_INDEX[today.getDay()]; // bugünün TR indeksi
    const days: string[] = [];
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(ALL_DAYS_ORDERED[(startIdx + i) % 7]);
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }));
    }
    return { orderedDays: days, weekDates: dates };
  })();
  
  const [smartState, setSmartState] = useState<Record<string, SubjectSmartState>>({});
  
  const [studentNote, setStudentNote] = useState<string>('Bu program senin genel durumun baz alınarak hazırlanmıştır. Görevlerini sorumluluk bilinciyle, ertelemeden tamamlaman başarının en büyük anahtarıdır. Sana inancım tam!');

  // Tablodaki ödevlere göre dinamik not üret
  const generateNoteFromSchedule = (data: typeof scheduleData) => {
    const satırlar: string[] = [];
    SUBJECTS.forEach(sub => {
      const days = Object.values(data[sub] || {}) as { q: string; t: string }[];
      const dolu = days.find(d => d.q);
      if (!dolu) return;
      const q = dolu.q;
      const t = dolu.t ? ` (${dolu.t.split('/')[0].trim()})` : '';
      satırlar.push(`• ${sub}${t} — günlük ${q} Soru`);
    });

    if (!satırlar.length) return studentNote;

    const ad = manualStudentName ? manualStudentName.split(' ')[0] : '';
    const karşılama = ad ? `Merhaba ${ad}!\n\n` : '';
    return `${karşılama}Bu haftanın çalışma programın aşağıdaki gibidir:\n\n${satırlar.join('\n')}\n\nHer günü plana sadık kalarak tamamlaman çok önemli. Düzenli ve kararlı çalışmaya devam et — sana inancım tam!`;
  };

  useEffect(() => {
    if (selectedStudent) {
      const initialState: Record<string, SubjectSmartState> = {};
      const ALL_DAYS = ['PTESİ', 'SALI', 'ÇARŞ', 'PERŞ', 'CUMA', 'CMTESİ', 'PAZAR'];
      
      SUBJECTS.forEach(sub => {
        initialState[sub] = { days: [...ALL_DAYS], topics: [], q: sub === 'PARAGRAF' ? '30' : '50' };
      });
      setSmartState(initialState);
    }
  }, [selectedStudent]);

  const [analysisSeconds, setAnalysisSeconds] = useState(0);
  const [isPdfScanning, setIsPdfScanning] = useState(false);
  const [pdfScanResult, setPdfScanResult] = useState<string | null>(null);
  const [pdfStudentName, setPdfStudentName] = useState<string>('');
  const [manualStudentName, setManualStudentName] = useState<string>('');
  const [smartFillText, setSmartFillText] = useState('');
  const [isSmartFilling, setIsSmartFilling] = useState(false);
  const [smartFillMsg, setSmartFillMsg] = useState<string | null>(null);

  // Ders bazlı soru kotaları — ana dersler fazla, ara dersler orta
  const SUBJECT_QUOTAS: Record<string, { min: number; ideal: number; max: number }> = {
    'TÜRKÇE':               { min: 20, ideal: 40, max: 80 },
    'MATEMATİK':            { min: 20, ideal: 40, max: 80 },
    'FEN BİLİMLERİ':        { min: 18, ideal: 35, max: 70 },
    'T.C. İNKILAP TARİHİ': { min: 10, ideal: 20, max: 35 },
    'İNGİLİZCE':            { min: 10, ideal: 20, max: 35 },
    'DİN KÜLTÜRÜ':          { min: 10, ideal: 20, max: 35 },
    'PARAGRAF':             { min: 10, ideal: 20, max: 35 },
  };
  const DAILY_TARGET = 155;
  const DAILY_MIN_Q  = 100;
  const DAILY_MAX_Q  = 265;

  /**
   * Başarı oranına göre çarpan — düşük başarı = daha fazla soru
   * 0 %  → ×3.0  |  30 % → ×2.0  |  60 % → ×1.2  |  80 %+ → ×0.7
   */
  const successMultiplier = (correct: number, incorrect: number, blank: number): number => {
    const total = correct + incorrect + blank;
    if (total === 0) return 1.5; // veri yoksa orta seviye
    const rate = correct / total;
    if (rate <= 0.20) return 3.0;
    if (rate <= 0.35) return 2.5;
    if (rate <= 0.50) return 2.0;
    if (rate <= 0.65) return 1.5;
    if (rate <= 0.80) return 1.2;
    return 0.75; // güçlü alan — idame sorusu
  };

  /**
   * Günlük hedef değişince konu soru sayılarını yeniden dağıt.
   * oldGoal → newGoal oranıyla tüm konular ölçeklenir;
   *   artış  → zayıf (yüksek count) konular biraz daha fazla alır
   *   azalış → güçlü (düşük count) konulardan biraz daha kesilir
   */
  const redistributeOnGoalChange = (
    topics: TemplateTopicEntry[],
    oldGoal: number,
    newGoal: number,
  ): TemplateTopicEntry[] => {
    if (!topics.length || oldGoal <= 0 || oldGoal === newGoal) return topics;

    const ratio      = newGoal / oldGoal;
    const isIncrease = ratio > 1;
    const totalQ     = topics.reduce((s, t) => s + t.questionCount, 0) || 1;
    const n          = topics.length;

    const updated = topics.map(t => {
      // Her konunun toplam içindeki payı (normalized)
      const share = t.questionCount / totalQ;
      // Bias: artışta zayıf (yüksek pay) daha çok; azalışta güçlü (düşük pay) daha çok kesilir
      const avgShare = 1 / n;
      const bias = isIncrease
        ? 1 + (share - avgShare) * 0.4   // zayıf → ratio biraz daha büyük
        : 1 - (avgShare - share) * 0.4;  // güçlü → ratio biraz daha küçük
      const biasedRatio = Math.max(0.05, ratio * bias);
      return { ...t, questionCount: Math.max(1, Math.round(t.questionCount * biasedRatio)) };
    });

    // Yuvarlama düzeltmesi: toplam farkını en zayıf/güçlü konuya yansıt
    const actualTotal = updated.reduce((s, t) => s + t.questionCount, 0);
    const targetTotal = Math.round(totalQ * ratio);
    const diff = targetTotal - actualTotal;
    if (diff !== 0 && updated.length > 0) {
      const adjIdx = diff > 0
        ? updated.reduce((mi, t, i, a) => t.questionCount >= a[mi].questionCount ? i : mi, 0)
        : updated.reduce((mi, t, i, a) => t.questionCount <= a[mi].questionCount ? i : mi, 0);
      updated[adjIdx] = { ...updated[adjIdx], questionCount: Math.max(1, updated[adjIdx].questionCount + diff) };
    }
    return updated;
  };

  const handlePdfScanForTemplate = async (file: File) => {
    setIsPdfScanning(true);
    setPdfScanResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-exam', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'PDF okunamadı.');

      const subjects: any[] = JSON.parse(data.parsedData?.subjectDetails || '[]');
      if (!subjects.length) throw new Error('PDF\'den ders verisi çıkarılamadı.');

      // ─ Başarı oranına dayalı ders planları
      type SubjectPlan = { key: string; topics: TemplateTopicEntry[]; dailyGoal: number };
      const plans: SubjectPlan[] = [];

      subjects.forEach((sub: any) => {
        const key = findMatchingSubject(sub.name || '');
        if (!key) return;

        const quota  = SUBJECT_QUOTAS[key] || { min: 10, ideal: 25, max: 60 };
        const subMul = successMultiplier(sub.correct || 0, sub.incorrect || 0, sub.blank || 0);
        const dailyGoal = Math.round(Math.min(quota.max, Math.max(quota.min, quota.ideal * subMul)));

        // Konu listesi: tüm konuları başarı oranına göre sırala
        const allTopics: any[] = sub.topics?.length ? sub.topics : [];
        const weakTopicNames: string[] = sub.weakTopics?.length ? sub.weakTopics : [];

        // Konu havuzu: önce açıkça zayıf olanlar, ardından yanlış/boş > 0 olanlar
        let topicPool: any[] = allTopics
          .filter((t: any) => (t.incorrect || 0) + (t.blank || 0) > 0)
          .sort((a: any, b: any) => {
            // Başarısızlık oranına göre sırala (kötü olan önce)
            const rateA = (a.correct || 0) / Math.max((a.correct||0)+(a.incorrect||0)+(a.blank||0), 1);
            const rateB = (b.correct || 0) / Math.max((b.correct||0)+(b.incorrect||0)+(b.blank||0), 1);
            return rateA - rateB;
          });

        // Zayıf listesindeki konu varsa ama topics'te yoksa ekle
        weakTopicNames.forEach(name => {
          if (!topicPool.some((t: any) => t.name?.toUpperCase().includes(name.toUpperCase()))) {
            topicPool.push({ name, correct: 0, incorrect: 1, blank: 0 });
          }
        });

        // Her konuya başarı oranıyla orantılı soru sayısı
        const topicEntries: TemplateTopicEntry[] = topicPool.map((t: any) => {
          const tMul = successMultiplier(t.correct || 0, t.incorrect || 0, t.blank || 0);
          const base = Math.round(dailyGoal / Math.max(topicPool.length, 1));
          return { name: t.name, questionCount: Math.max(5, Math.round(base * tMul)) };
        });

        plans.push({ key, topics: topicEntries, dailyGoal });
      });

      if (!plans.length) throw new Error('Eşleştirilebilir ders verisi bulunamadı.');

      // ─ Günlük toplam kontrol — aralığa sığdır
      const rawTotal = plans.reduce((s, p) => s + p.dailyGoal, 0);
      const scale = rawTotal < DAILY_MIN_Q
        ? DAILY_TARGET / Math.max(rawTotal, 1)
        : rawTotal > DAILY_MAX_Q
          ? DAILY_MAX_Q / rawTotal
          : 1;

      setTemplateState(prev => {
        const next = { ...prev };
        plans.forEach(({ key, topics, dailyGoal }) => {
          const quota  = SUBJECT_QUOTAS[key] || { min: 10, ideal: 25, max: 60 };
          const scaled = Math.round(Math.min(Math.max(dailyGoal * scale, quota.min), quota.max));

          // Konu soru sayılarını da aynı oranda ölçekle
          const scaledTopics = topics.map(t => ({
            ...t,
            questionCount: Math.max(5, Math.round(t.questionCount * scale)),
          }));

          next[key] = {
            ...next[key],
            enabled: scaledTopics.length > 0,
            dailyGoal: scaled,
            topics: scaledTopics.length > 0 ? scaledTopics : next[key].topics,
          };
        });
        return next;
      });

      const examName = data.parsedData?.name || file.name;
      const studentNameFromPdf = data.parsedData?.studentName || '';
      if (studentNameFromPdf) {
        setPdfStudentName(studentNameFromPdf);
        if (!manualStudentName) setManualStudentName(studentNameFromPdf);
      }
      const total = Math.round(plans.reduce((s, p) => {
        const quota = SUBJECT_QUOTAS[p.key] || { min: 10, max: 60 };
        return s + Math.min(Math.max(p.dailyGoal * scale, quota.min), quota.max);
      }, 0));
      setPdfScanResult(`✅ "${examName}" karnesi analiz edildi${studentNameFromPdf ? ` — Öğrenci: ${studentNameFromPdf}` : ''} — günlük ~${total} soru atandı.`);
    } catch (err: any) {
      setPdfScanResult(`❌ ${err.message}`);
    } finally {
      setIsPdfScanning(false);
    }
  };

  const handleSmartFill = async () => {
    if (!smartFillText.trim()) return;
    setIsSmartFilling(true);
    setSmartFillMsg(null);
    try {
      const res = await fetch('/api/smart-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: smartFillText, topicsMap: TOPICS_MAP }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bilinmeyen hata.');

      const fills: any[] = data.fills || [];
      if (!fills.length) throw new Error('Metinden ders bilgisi çıkarılamadı.');

      // ─ templateState güncelle
      setTemplateState(prev => {
        const next = { ...prev };
        fills.forEach(f => {
          const key = Object.keys(next).find(k =>
            k.toUpperCase().includes(f.subject?.toUpperCase()) ||
            f.subject?.toUpperCase().includes(k.toUpperCase())
          );
          if (!key) return;
          if (f.type === 'question') {
            const qCount = f.questionCount || 40;
            const topics: TemplateTopicEntry[] = (f.topics || []).map((t: string) => ({ name: t, questionCount: qCount }));
            next[key] = { ...next[key], enabled: true, days: f.days, dailyGoal: qCount, topics: topics.length ? topics : next[key].topics };
          } else if (f.type === 'page') {
            // sayfa tipi için topics'i boş bırak, scheduleData'ya direkt yazılacak
            next[key] = { ...next[key], enabled: true, days: f.days };
          }
        });
        return next;
      });

      // ─ scheduleData'yı (tabloyu) direkt güncelle
      setScheduleData(prev => {
        const next = { ...prev };
        fills.forEach(f => {
          const subject = SUBJECTS.find(s =>
            s.toUpperCase().includes(f.subject?.toUpperCase()) ||
            f.subject?.toUpperCase().includes(s.toUpperCase())
          );
          if (!subject) return;
          next[subject] = { ...(next[subject] || {}) };

          if (f.type === 'question') {
            const topics: string[] = f.topics || [];
            let ti = 0;
            f.days.forEach((day: string) => {
              const mappedDay = DAY_MAP[day] || day;
              const topic = topics.length ? topics[ti % topics.length] : '';
              next[subject][mappedDay] = { q: String(f.questionCount || ''), t: topic };
              if (topics.length) ti++;
            });
          } else if (f.type === 'page' && f.pageRanges) {
            f.days.forEach((day: string, i: number) => {
              const mappedDay = DAY_MAP[day] || day;
              next[subject][mappedDay] = { q: '', t: f.pageRanges[i] || '' };
            });
          }
        });
        return next;
      });

      const names = fills.map((f: any) => f.subject).join(', ');
      setSmartFillMsg(`✅ ${names} için tablo dolduruldu.`);
      setSmartFillText('');
    } catch (err: any) {
      setSmartFillMsg(`❌ ${err.message}`);
    } finally {
      setIsSmartFilling(false);
    }
  };

  // Arşivden Sınav Seçimi - AI Dağıtımını Tetikler
  const handleSyncTopicList = async (examIdToUse?: string) => {
    if (!selectedStudent || !selectedStudent.exams || selectedStudent.exams.length === 0) {
      alert('Öğrencinin kayıtlı sınavı bulunmuyor.');
      return;
    }

    // Aggregate topics from all SINGLE exams to avoid double counting
    const subjectMap: Record<string, Record<string, { correct: number, incorrect: number, blank: number }>> = {};
    const examsToUse = examIdToUse ? selectedStudent.exams.filter((e:any)=>e.id === examIdToUse) : selectedStudent.exams; // fallback to all if no singles

    examsToUse.forEach((exam: any) => {
      if (exam.subjectDetails && exam.subjectDetails !== '[]') {
        try {
          const details = JSON.parse(exam.subjectDetails);
          details.forEach((sub: any) => {
            if (!subjectMap[sub.name]) subjectMap[sub.name] = {};
            if (sub.topics) {
              sub.topics.forEach((t: any) => {
                if (!subjectMap[sub.name][t.name]) {
                  subjectMap[sub.name][t.name] = { correct: 0, incorrect: 0, blank: 0 };
                }
                subjectMap[sub.name][t.name].correct += (t.correct || 0);
                subjectMap[sub.name][t.name].incorrect += (t.incorrect || 0);
                subjectMap[sub.name][t.name].blank += (t.blank || 0);
              });
            }
          });
        } catch (e) {}
      }
    });

    const aggregatedData = Object.keys(subjectMap).map(subName => {
      return {
        subject: subName,
        topics: Object.entries(subjectMap[subName]).map(([name, stats]) => {
          const total = stats.correct + stats.incorrect + stats.blank;
          return {
            name,
            correct: stats.correct,
            incorrect: stats.incorrect,
            blank: stats.blank,
            successPercentage: total > 0 ? Math.round((stats.correct / total) * 100) : 0
          };
        })
      };
    });

    if (aggregatedData.length === 0) {
      alert('Sınavlardan konu verisi çıkarılamadı. Lütfen konu analizi içeren bir sınav yükleyin.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisSeconds(0);
    const interval = setInterval(() => {
      setAnalysisSeconds(s => s + 1);
    }, 1000);

    try {
      const res = await fetch('/api/ai-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aggregatedData, 
          studentName: selectedStudent.firstName + ' ' + selectedStudent.lastName 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Yapay zeka analizinde hata oluştu.');
      }

      const { aiData } = data;
      const nextState = { ...smartState };
      
      // AI'dan gelen subject verilerini smartState'e uygula
      if (aiData && aiData.subjects) {
        aiData.subjects.forEach((subjectOutput: any) => {
          const rawSubName = subjectOutput.name || '';
          const sub = findMatchingSubject(rawSubName);
          if (sub && nextState[sub]) {
            const weeklyQ = parseInt(subjectOutput.questionCount) || 0;
            const activeDaysCount = nextState[sub].days.length || 7;
            const dailyQ = weeklyQ > 0 ? Math.round(weeklyQ / activeDaysCount).toString() : nextState[sub].q;
            nextState[sub].q = dailyQ;
            if (subjectOutput.topics && Array.isArray(subjectOutput.topics)) {
              nextState[sub].aiParsedTopics = subjectOutput.topics;
              // Eksik (isWeak) olanları otomatik seç
              const weakNames = subjectOutput.topics.filter((t:any) => t.isWeak).map((t:any) => t.name);
              if (weakNames.length > 0) {
                nextState[sub].topics = weakNames;
              } else if (subjectOutput.weakTopic && subjectOutput.weakTopic !== 'Genel Tekrar' && subjectOutput.weakTopic !== 'Günlük Rutin') {
                nextState[sub].topics = [subjectOutput.weakTopic];
              }
            } else if (subjectOutput.weakTopic && subjectOutput.weakTopic !== 'Genel Tekrar' && subjectOutput.weakTopic !== 'Günlük Rutin') {
              // Geriye dönük uyumluluk
              nextState[sub].topics = [subjectOutput.weakTopic];
            }
          }
        });
      }
      
      setSmartState(nextState);

      // AI sonuçlarını templateState'e başarı çarpanıyla aktar
      setTemplateState(prev => {
        const next = { ...prev };
        if (aiData && aiData.subjects) {
          aiData.subjects.forEach((subjectOutput: any) => {
            const rawSubName = subjectOutput.name || '';
            const sub = findMatchingSubject(rawSubName);
            if (!sub || !next[sub]) return;

            const quota = SUBJECT_QUOTAS[sub] || { min: 10, ideal: 25, max: 60 };
            const activeDaysCount = next[sub].days.length || 7;

            // AI'dan gelen haftalık soru sayısını günlüğe çevir
            const weeklyQ = parseInt(subjectOutput.questionCount) || 0;
            const aiDailyQ = weeklyQ > 0 ? Math.round(weeklyQ / activeDaysCount) : quota.ideal;

            const topics: TemplateTopicEntry[] = [];
            if (subjectOutput.topics && Array.isArray(subjectOutput.topics)) {
              // Konuları başarı oranına göre sırala: en zayıf önce
              const allT: any[] = [...subjectOutput.topics].sort((a: any, b: any) => {
                const rateA = a.percentage != null ? a.percentage / 100 : (a.isWeak ? 0.2 : 0.7);
                const rateB = b.percentage != null ? b.percentage / 100 : (b.isWeak ? 0.2 : 0.7);
                return rateA - rateB; // zayıf önce
              });
              const weakT = allT.filter((t: any) => t.isWeak || (t.percentage != null && t.percentage < 60));
              const topicsToUse = weakT.length > 0 ? weakT : allT.slice(0, 4);

              topicsToUse.forEach((t: any) => {
                // Her konunun başarı oranına göre bireysel çarpan
                const tRate = t.percentage != null ? t.percentage / 100 : (t.isWeak ? 0.2 : 0.6);
                const tMul  = tRate <= 0.20 ? 3.0 : tRate <= 0.40 ? 2.5 : tRate <= 0.60 ? 1.8 : tRate <= 0.80 ? 1.2 : 0.8;
                const base  = Math.round(aiDailyQ / Math.max(topicsToUse.length, 1));
                topics.push({ name: t.name, questionCount: Math.max(5, Math.min(quota.max, Math.round(base * tMul))) });
              });
            } else if (subjectOutput.weakTopic && subjectOutput.weakTopic !== 'Genel Tekrar') {
              topics.push({ name: subjectOutput.weakTopic, questionCount: aiDailyQ });
            }

            // Dersin genel dailyGoal: ideal × ders başarı çarpanı (düşük başarı = daha fazla)
            const subRate = subjectOutput.topics?.length
              ? subjectOutput.topics.reduce((s: number, t: any) => s + (t.percentage ?? 50), 0) / subjectOutput.topics.length / 100
              : 0.5;
            const subMul = subRate <= 0.30 ? 2.5 : subRate <= 0.50 ? 2.0 : subRate <= 0.70 ? 1.5 : subRate <= 0.85 ? 1.0 : 0.75;
            const finalDaily = Math.round(Math.min(quota.max, Math.max(quota.min, quota.ideal * subMul)));

            if (topics.length > 0) {
              next[sub] = { ...next[sub], enabled: true, dailyGoal: finalDaily, topics };
            }
          });
        }
        return next;
      });

      // AI sonuçlarını anında tabloya aktar
      setScheduleData(prev => {
        const next = { ...prev };
        SUBJECTS.forEach(subject => {
          const state = nextState[subject];
          if (state && state.topics.length > 0 && state.days.length > 0) {
            next[subject] = { ...(next[subject] || {}) };
            let topicIndex = 0;
            state.days.forEach(day => {
              const mappedDay = day === 'PTESİ' ? 'PAZARTESİ' : 
                                day === 'SALI' ? 'SALI' : 
                                day === 'ÇARŞ' ? 'ÇARŞAMBA' : 
                                day === 'PERŞ' ? 'PERŞEMBE' : 
                                day === 'CUMA' ? 'CUMA' : 
                                day === 'CMTESİ' ? 'CUMARTESİ' : 'PAZAR';
                                
              const topic = state.topics[topicIndex % state.topics.length];
              next[subject][mappedDay] = { q: state.q, t: topic };
              topicIndex++;
            });
          }
        });
        return next;
      });
      
      // AI'dan dönen değerlendirmeyi doğrudan öğrenci notuna ekle
      if (aiData?.evaluationSummary) {
        setStudentNote(aiData.evaluationSummary + '\n\nBu eksikleri kapatmak için bu haftaki görevlerini ertelemeden tamamlaman başarının anahtarıdır. Sana inancım tam!');
      }
      
      alert(`AI Analizi Tamamlandı!\n\nRehber Öğretmen Değerlendirmesi programa eklendi.`);
      
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const DAY_MAP: Record<string, string> = {
    'PTESİ': 'PAZARTESİ', 'SALI': 'SALI', 'ÇARŞ': 'ÇARŞAMBA',
    'PERŞ': 'PERŞEMBE', 'CUMA': 'CUMA', 'CMTESİ': 'CUMARTESİ', 'PAZAR': 'PAZAR',
  };

  const MAX_TOPICS_PER_DAY = 3;

  const handleTemplateBulkAdd = () => {
    // Konu olmasa da etkin olan dersler dahil edilir
    const activeSubjects = SUBJECTS.filter(s => templateState[s]?.enabled && templateState[s].dailyGoal > 0);
    if (activeSubjects.length === 0) {
      alert('Lütfen en az bir ders etkinleştirin ve günlük soru sayısı girin.');
      return;
    }
    setScheduleData(prev => {
      const next = { ...prev };
      activeSubjects.forEach(subject => {
        const ts = templateState[subject];
        next[subject] = { ...(next[subject] || {}) };
        const topicNames = ts.topics.map(t => t.name);
        const topicCount = topicNames.length;

        ts.days.forEach((day, dayIdx) => {
          const mappedDay = DAY_MAP[day] || day;

          if (topicCount === 0) {
            // Konu seçilmemiş: sadece soru sayısı, konu alanı boş
            next[subject][mappedDay] = { q: String(ts.dailyGoal), t: '' };
          } else {
            // Her güne max 3 konu, kayan pencere
            const perDay = Math.min(MAX_TOPICS_PER_DAY, topicCount);
            const startIdx = (dayIdx * perDay) % topicCount;
            const dayTopics: string[] = [];
            for (let i = 0; i < perDay; i++) {
              const name = topicNames[(startIdx + i) % topicCount];
              if (!dayTopics.includes(name)) dayTopics.push(name);
            }
            next[subject][mappedDay] = { q: String(ts.dailyGoal), t: dayTopics.join(' / ') };
          }
        });
      });
      return next;
    });
    setShowSmartTemplate(false);
    // Notu tablodaki gerçek ödevlere göre güncelle
    setScheduleData(prev => {
      setStudentNote(generateNoteFromSchedule(prev));
      return prev;
    });
    alert('Şablon haftalık programa aktarıldı!');
  };

  const handleBulkAdd = () => {
    setScheduleData(prev => {
      const next = { ...prev };
      
      SUBJECTS.forEach(subject => {
        const state = smartState[subject];
        if (state && state.topics.length > 0 && state.days.length > 0) {
          next[subject] = { ...(next[subject] || {}) };
          let topicIndex = 0;
          state.days.forEach(day => {
            const mappedDay = day === 'PTESİ' ? 'PAZARTESİ' : 
                              day === 'SALI' ? 'SALI' : 
                              day === 'ÇARŞ' ? 'ÇARŞAMBA' : 
                              day === 'PERŞ' ? 'PERŞEMBE' : 
                              day === 'CUMA' ? 'CUMA' : 
                              day === 'CMTESİ' ? 'CUMARTESİ' : 'PAZAR';
                              
            const topic = state.topics[topicIndex % state.topics.length];
            next[subject][mappedDay] = { q: state.q, t: topic };
            topicIndex++;
          });
        }
      });
      return next;
    });
    setScheduleData(prev => { setStudentNote(generateNoteFromSchedule(prev)); return prev; });
    alert('Seçili olan konular haftalık programa aktarıldı!');
  };

  const handleSaveToArchive = async () => {
    if (!selectedStudent) {
      alert('Lütfen önce bir öğrenci seçin.');
      return;
    }

    const tasksData: any[] = [];
    Object.entries(scheduleData).forEach(([subject, daysObj]) => {
      Object.entries(daysObj).forEach(([day, taskInfo]) => {
        if (taskInfo.t || taskInfo.q) {
          const targetValue = (taskInfo.q || '').trim();
          const isPureNumeric = /^\d+$/.test(targetValue);
          tasksData.push({
            subject,
            day,
            topic: taskInfo.t || 'Genel Tekrar',
            questionCount: isPureNumeric ? parseInt(targetValue) : 0,
            pagesRange: !isPureNumeric && targetValue.length > 0 ? targetValue : null
          });
        }
      });
    });

    if (tasksData.length === 0) {
      alert('Program boş olamaz. Lütfen en az bir göreve soru sayısı veya konu başlığı girin.');
      return;
    }

    try {
      const result = await createSchedule(selectedStudent.id, tasksData);
      
      if (result.success) {
        alert('Çalışma programı başarıyla arşive kaydedildi!');
        window.location.href = `/students/${selectedStudent.id}?tab=programlar`;
      } else {
        alert('Kaydedilirken hata oluştu: ' + result.error);
      }
    } catch (e) {
      alert('Sistem hatası oluştu.');
    }
  };

  
  const handlePdfUploadSync = async () => {
    if (!examFile) return;
    setShowSyncModal(false);
    setIsAnalyzing(true);
    setAnalysisSeconds(0);
    const interval = setInterval(() => setAnalysisSeconds(s => s + 1), 1000);

    try {
      const formData = new FormData();
      formData.append('pdf', examFile);
      
      const uploadRes = await fetch('/api/upload-exam', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);
      
      const res = await fetch('/api/ai-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aggregatedData: [{ subject: "Yapay Zeka Analizi", topics: uploadData.topics || [] }],
          studentName: selectedStudent.firstName + ' ' + selectedStudent.lastName,
          rawScanData: uploadData.rawText 
        })
      });
      
      const distData = await res.json();
      if (!res.ok) throw new Error(distData.error);
      
      const { aiData } = distData;
      setSmartState(prev => {
        const next = { ...prev };
        Object.keys(aiData.subjects).forEach(aiSubject => {
          const mapped = findMatchingSubject(aiSubject);
          if (mapped && next[mapped]) {
            next[mapped] = { ...next[mapped], aiParsedTopics: aiData.subjects[aiSubject] };
          }
        });
        return next;
      });
      
      if (aiData?.evaluationSummary) {
        setStudentNote(aiData.evaluationSummary + '\n\nBu eksikleri kapatmak için bu haftaki görevlerini ertelemeden tamamlaman başarının anahtarıdır. Sana inancım tam!');
      }
      alert('Yapay Zeka PDF Analizi Tamamlandı!');
    } catch(err:any) {
      alert('Hata: ' + err.message);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };


  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <style>{`
        .print-only {
          display: none !important;
        }
        .print-only-block {
          display: none !important;
        }
        @page {
          size: A4 landscape;
          margin: 8mm 10mm;
        }

        @media print {
          /* ── 1. HER ŞEYİ GİZLE ── */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
          }

          body * {
            visibility: hidden !important;
          }

          /* ── 2. SADECE PRINT-AREA GÖRÜNÜR ── */
          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          /* no-print içindekiler kesinlikle gizlensin */
          .print-area .no-print,
          .print-area .no-print * {
            visibility: hidden !important;
            display: none !important;
          }

          /* print-only'ler görünsün */
          .print-only {
            display: inline !important;
          }
          .print-only-block {
            display: block !important;
          }

          /* ── 3. PRINT-AREA KONUMLANDIRMA ── */
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
            transform: none !important;
            box-sizing: border-box !important;
          }

          /* ── 4. GENEL BOX-SIZING ── */
          .print-area *, .print-area *::before, .print-area *::after {
            box-sizing: border-box !important;
          }

          /* ── 5. YARDIMCI ── */
          .vertical-text { writing-mode: vertical-rl !important; transform: rotate(180deg) !important; text-align: center !important; }
          .time-header { writing-mode: vertical-rl !important; transform: rotate(180deg) !important; text-align: center !important; font-weight: 800 !important; background: #f3f4f6 !important; }

          /* ── 6. TABLO ── */
          .print-area table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1.5px solid #000 !important;
            margin: 0.3rem 0 !important;
            table-layout: fixed !important;
            page-break-inside: avoid !important;
          }

          .print-area table th,
          .print-area table td {
            border: 1px solid #000 !important;
            padding: 3px 4px !important;
            font-size: 0.65rem !important;
            line-height: 1.2 !important;
            color: #000 !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* İlk sütun (ders adı) */
          .print-area table th:first-child,
          .print-area table td:first-child {
            width: 11% !important;
            font-weight: 800 !important;
          }

          /* Gün sütunları eşit */
          .print-area table th:not(:first-child),
          .print-area table td:not(:first-child) {
            width: calc(89% / 7) !important;
          }

          .print-area table th {
            font-weight: 800 !important;
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            text-align: center !important;
          }

          .print-area table tr {
            page-break-inside: avoid !important;
          }

          .print-area table td > div,
          .print-area table td > span {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* ── 7. ALT DETAYLAR ── */
          .print-area .details-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.6rem !important;
            margin-top: 0.4rem !important;
            width: 100% !important;
          }

          .print-area .details-container > div {
            border: 1px solid #000 !important;
            padding: 0.5rem !important;
            border-radius: 0 !important;
            background: white !important;
          }

          .print-area .details-container h4 {
            font-size: 0.7rem !important;
            font-weight: 800 !important;
            margin: 0 0 0.2rem 0 !important;
            color: #000 !important;
            border-bottom: 1px solid #000 !important;
            padding-bottom: 0.15rem !important;
          }

          .print-area .details-container p,
          .print-area .details-container div {
            font-size: 0.65rem !important;
            line-height: 1.3 !important;
            color: #000 !important;
          }

          /* ── 8. İMZA ── */
          .print-area .signatures-container {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 0.6rem !important;
            width: 100% !important;
            padding: 0 0.5rem !important;
          }

          .print-area .signatures-container > div {
            text-align: center !important;
            min-width: 120px !important;
          }

          .print-area .signatures-container p {
            margin: 0 !important;
            font-size: 0.7rem !important;
            color: #000 !important;
          }

          .print-area .signatures-container p:first-child {
            font-weight: 800 !important;
            border-bottom: 1px dotted #555 !important;
            padding-bottom: 1.2rem !important;
            margin-bottom: 0.2rem !important;
          }
        }
        
        .smart-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .smart-scroll::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <header className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Hızlı Ders Programı Tasarımı
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Öğrenci profilini seçerek YZ destekli akıllı program hazırlayabilirsiniz.</p>
        </div>
        <div style={{ width: '300px' }}>
          <select 
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const std = students.find(s => s.id === e.target.value);
              setSelectedStudent(std);
              if (std) setManualStudentName(`${std.firstName} ${std.lastName}`);
            }}
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border)', fontSize: '1rem', background: 'var(--bg-main)', outline: 'none', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
            <option value="">Öğrenci Seçiniz...</option>
            {students.map((s:any) => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
            ))}
          </select>
        </div>
      </header>



        <section className="print-area" style={{ animation: 'fadeIn 0.3s', padding: 0, overflow: 'visible' }}>
          <div className="no-print" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>HAFTALIK DERS ÇALIŞMA PLANI</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Öğrenci:</span>
                <input
                  type="text"
                  value={manualStudentName}
                  onChange={e => setManualStudentName(e.target.value)}
                  placeholder="Öğrenci adını girin..."
                  style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', border: 'none', borderBottom: '1.5px solid var(--border)', outline: 'none', background: 'transparent', minWidth: '180px', padding: '0.1rem 0.2rem' }}
                />
                {selectedStudent?.grade && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>— {selectedStudent.grade}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select 
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="btn-secondary"
                style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', outline: 'none', background: 'white', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
              >
                <option value="standart">Standart Şablon</option>
                <option value="detayli">Detaylı Takip Şablonu</option>
                <option value="birlestirilmis">Birleştirilmiş Konu Şablonu</option>
                <option value="zaman_dilimli">Zaman Dilimli Şablon</option>
              </select>
              <button className="btn-secondary" onClick={() => setShowSmartDist(!showSmartDist)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                {showSmartDist ? 'Akıllı Dağıtımı Gizle' : '🧠 Akıllı Dağıtımı Aç'}
              </button>
            </div>
          </div>

          {showSmartDist && (
            <div className="no-print" style={{ padding: '1.5rem 2rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', animation: 'fadeIn 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🧠 Akıllı Dağıtım
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Analiz belgesi yükleyin, YZ eksikleri belirlesin ve LGS ağırlıklarına göre soru sayılarını atasın.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleSyncTopicList()}
                    disabled={isAnalyzing || !selectedStudent?.exams?.length}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'rgba(16, 185, 129, 0.05)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!selectedStudent?.exams?.length || isAnalyzing) ? 0.5 : 1 }}>
                    {isAnalyzing ? '🔄 Senkronize Ediliyor...' : '🔄 Konu Takip Listesiyle Senkronize Et'}
                  </button>
                  <button
                    onClick={() => setShowSmartTemplate(v => !v)}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--secondary)', color: 'var(--secondary)', background: showSmartTemplate ? 'rgba(99,102,241,0.1)' : 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {showSmartTemplate ? '▲ Şablonu Kapat' : '📋 Akıllı Dağıtım Şablonu'}
                  </button>
                  <button className="btn-primary" onClick={handleBulkAdd} style={{ padding: '0.75rem 1.5rem' }}>
                    Planı Programa Aktar ⬇️
                  </button>
                </div>
              </div>
              
              {/* Akıllı Dağıtım Şablonu Paneli */}
              {showSmartTemplate && (
                <div style={{ marginBottom: '1.5rem', background: 'white', borderRadius: '14px', border: '1.5px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', animation: 'fadeIn 0.2s' }}>
                  {/* Panel Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(90deg, rgba(99,102,241,0.07), rgba(16,185,129,0.04))', borderRadius: '14px 14px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>📋</span>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Akıllı Dağıtım Şablonu</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-main)', padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: 600 }}>Tüm Dersler</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {/* PDF Karne Tara */}
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.45rem 1rem', borderRadius: '8px',
                        border: '1px solid #8B5CF6', background: isPdfScanning ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)',
                        color: '#8B5CF6', fontWeight: 800, fontSize: '0.8rem',
                        cursor: isPdfScanning ? 'wait' : 'pointer', transition: 'all 0.2s',
                      }}>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: 'none' }}
                          disabled={isPdfScanning}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfScanForTemplate(f); e.target.value = ''; }}
                        />
                        {isPdfScanning
                          ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Karne Taranıyor...</>
                          : <>📄 PDF Karne Tara & Doldur</>}
                      </label>

                      {/* Konu Takip Senkronize */}
                      <button
                        onClick={() => handleSyncTopicList()}
                        disabled={isAnalyzing || !selectedStudent?.exams?.length}
                        title={!selectedStudent?.exams?.length ? 'Önce öğrenci ve sınav seçin' : ''}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.45rem 1rem', borderRadius: '8px',
                          border: '1px solid var(--primary)', background: isAnalyzing ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)',
                          color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
                          opacity: (!selectedStudent?.exams?.length || isAnalyzing) ? 0.45 : 1,
                          transition: 'all 0.2s',
                        }}>
                        {isAnalyzing
                          ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span> Analiz... ({analysisSeconds}s)</>
                          : <>🔄 Konu Takip Senkronize</>}
                      </button>

                      <button onClick={() => setShowSmartTemplate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1, padding: '0.2rem' }}>✕</button>
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.25rem' }}>
                    {/* PDF Tarama Sonucu */}
                    {pdfScanResult && (
                      <div style={{
                        marginBottom: '0.85rem', padding: '0.6rem 1rem', borderRadius: '8px',
                        background: pdfScanResult.startsWith('✅') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${pdfScanResult.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        fontSize: '0.82rem', fontWeight: 700,
                        color: pdfScanResult.startsWith('✅') ? '#065f46' : '#991b1b',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                      }}>
                        <span>{pdfScanResult}</span>
                        <button onClick={() => setPdfScanResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}>✕</button>
                      </div>
                    )}
                    {/* ── AKILLI METİN DOLDURMA ── */}
                    <div style={{ marginBottom: '1rem', background: 'linear-gradient(135deg,rgba(99,102,241,0.05),rgba(16,185,129,0.04))', border: '1.5px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366F1', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>🧠</span> Akıllı Metin ile Doldur
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                        Her satıra bir talimat yaz. Örnek:
                        <div style={{ marginTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {[
                            'Matematik her gün 40 soru tam sayılar',
                            'Türkçe Pazartesi Salı 30 soru paragrafta anlam',
                            'Hız Yayınları sayfa 45-90 Matematik 5 gün',
                            'Fen her gün 35 soru basit makineler baskı',
                          ].map(ex => (
                            <button key={ex} onClick={() => setSmartFillText(t => t ? t + '\n' + ex : ex)}
                              style={{ padding: '0.2rem 0.5rem', borderRadius: '5px', border: '1px dashed rgba(99,102,241,0.4)', background: 'white', fontSize: '0.68rem', color: '#6366F1', cursor: 'pointer', fontStyle: 'italic' }}>
                              {ex}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={smartFillText}
                        onChange={e => setSmartFillText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSmartFill(); }}
                        placeholder={'Matematik her gün 40 soru tam sayılar\nTürkçe Pazartesi Salı 30 soru\nHız Yayınları sayfa 45-90 Matematik 5 gün'}
                        rows={3}
                        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.82rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.55, background: 'white' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ctrl+Enter ile de gönderebilirsin</span>
                        <button
                          onClick={handleSmartFill}
                          disabled={isSmartFilling || !smartFillText.trim()}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', borderRadius: '8px', border: 'none', background: isSmartFilling ? '#a5b4fc' : '#6366F1', color: 'white', fontWeight: 800, fontSize: '0.82rem', cursor: isSmartFilling || !smartFillText.trim() ? 'not-allowed' : 'pointer', opacity: !smartFillText.trim() ? 0.5 : 1, transition: 'all 0.2s' }}>
                          {isSmartFilling ? <><span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>⏳</span> Dolduruluyor...</> : <>🚀 Tabloyu Doldur</>}
                        </button>
                      </div>
                      {smartFillMsg && (
                        <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.7rem', borderRadius: '7px', background: smartFillMsg.startsWith('✅') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${smartFillMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: '0.78rem', fontWeight: 700, color: smartFillMsg.startsWith('✅') ? '#065f46' : '#991b1b', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{smartFillMsg}</span>
                          <button onClick={() => setSmartFillMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.85rem' }}>✕</button>
                        </div>
                      )}
                    </div>

                    {/* MÜFREDAT SINIFI */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Müfredat Sınıfı</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {['5. Sınıf', '6. Sınıf', '7. Sınıf', 'LGS', '9. Sınıf', '10. Sınıf', '11. Sınıf'].map(g => (
                          <button key={g} onClick={() => { setTemplateGrade(g); setTemplateState(prev => { const next = {...prev}; Object.keys(next).forEach(k => { next[k] = {...next[k], topics: []}; }); return next; }); }}
                            style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                              background: templateGrade === g ? 'var(--primary)' : 'var(--bg-main)',
                              color: templateGrade === g ? 'white' : 'var(--text-secondary)' }}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PLANLAMA BİRİMİ */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Planlama Birimi</div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {['Soru', 'Sayfa', 'Dakika'].map(u => (
                          <button key={u} onClick={() => setTemplateUnit(u)}
                            style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                              background: templateUnit === u ? 'var(--secondary)' : 'var(--bg-main)',
                              color: templateUnit === u ? 'white' : 'var(--text-secondary)' }}>
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ders Kartları */}
                    <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }} className="smart-scroll">
                      {SUBJECTS.map(subject => (
                        <TemplateSubjectCard
                          key={subject}
                          subject={subject}
                          allTopics={(GRADE_TOPICS_MAP[templateGrade] || GRADE_TOPICS_MAP['LGS'])[subject] || TOPICS_MAP[subject] || []}
                          state={templateState[subject]}
                          unit={templateUnit}
                          onUpdate={(ns) => setTemplateState(prev => ({ ...prev, [subject]: ns }))}
                        />
                      ))}
                    </div>

                    {/* Özet + Alt Buton */}
                    {(() => {
                      const activeSubjects = SUBJECTS.filter(s => templateState[s]?.enabled && templateState[s].topics.length > 0);
                      const weeklyTotal = activeSubjects.reduce((sum, s) => sum + templateState[s].dailyGoal * templateState[s].days.length, 0);
                      const CORE = ['TÜRKÇE','MATEMATİK','FEN BİLİMLERİ'];
                      const SUBJECT_COLORS_MAP: Record<string,string> = {
                        'TÜRKÇE':'#6366F1','MATEMATİK':'#0EA5E9','FEN BİLİMLERİ':'#10B981',
                        'T.C. İNKILAP TARİHİ':'#F59E0B','İNGİLİZCE':'#EC4899','DİN KÜLTÜRÜ':'#8B5CF6','PARAGRAF':'#64748B'
                      };
                      return (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                          {activeSubjects.length > 0 && (
                            <div style={{ marginBottom: '0.75rem' }}>
                              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                                Günlük soru hedefleri — düzenleyebilirsiniz:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                {activeSubjects.map(s => {
                                  const c = SUBJECT_COLORS_MAP[s] || 'var(--primary)';
                                  const ts = templateState[s];
                                  return (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.55rem 0.25rem 0.45rem', borderRadius: '8px', background: c + '10', border: `1.5px solid ${c}33`, fontSize: '0.72rem', fontWeight: 700 }}>
                                      <span style={{ color: c }}>{s}</span>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>—</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={200}
                                        value={ts.dailyGoal}
                                        onChange={e => {
                                          const newGoal = Math.max(1, Number(e.target.value));
                                          setTemplateState(prev => {
                                            const ts = prev[s];
                                            return {
                                              ...prev,
                                              [s]: {
                                                ...ts,
                                                dailyGoal: newGoal,
                                                topics: redistributeOnGoalChange(ts.topics, ts.dailyGoal, newGoal),
                                              },
                                            };
                                          });
                                        }}
                                        style={{ width: '44px', padding: '0.1rem 0.2rem', border: `1px solid ${c}55`, borderRadius: '5px', fontSize: '0.82rem', fontWeight: 900, color: c, textAlign: 'center', outline: 'none', background: 'white' }}
                                      />
                                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{templateUnit}/gün</span>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>({ts.dailyGoal * ts.days.length}/hafta)</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Toplam haftalık:</span>
                                <span style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--primary)', background: 'rgba(4,120,87,0.08)', padding: '0.15rem 0.6rem', borderRadius: '6px' }}>
                                  {weeklyTotal} {templateUnit}/hafta
                                </span>
                              </div>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button onClick={() => { if (window.confirm('Tablo ve akıllı dağıtım sıfırlanacak. Emin misiniz?')) { setScheduleData({}); setTemplateState(initTemplateState()); } }} className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontWeight: 700, borderColor: '#EF4444', color: '#EF4444' }}>🗑️ Tabloyu Sıfırla</button>
                            <button onClick={() => setShowSmartTemplate(false)} className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontWeight: 700 }}>Kapat</button>
                            <button onClick={handleTemplateBulkAdd} className="btn-primary" style={{ padding: '0.55rem 1.5rem', fontWeight: 700 }}>Planı Hazırla</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Compact Scrollable Area */}
              <div className="smart-scroll" style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {SUBJECTS.map(subject => (
                  smartState[subject] ? 
                  <SmartSubjectCard 
                    key={subject} 
                    subject={subject} 
                    topics={TOPICS_MAP[subject]} 
                    state={smartState[subject]} 
                    onUpdate={(newState) => setSmartState(prev => ({...prev, [subject]: newState}))} 
                  /> : null
                ))}
              </div>
            </div>
          )}

          
          {/* Sadece yazıcıda çıkacak başlık */}
          <div className="print-only-block" style={{ display: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
              <div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000', margin: 0 }}>HAFTALIK DERS ÇALIŞMA PROGRAMI</h1>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>
                  Öğrenci: {manualStudentName || '—'}{selectedStudent?.grade ? ` | Sınıf: ${selectedStudent.grade}` : ''}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}>
                  {weekDates[0]} — {weekDates[6]}
                </p>
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto', padding: '1.5rem', background: 'white' }}>
            
            {selectedTemplate === 'standart' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', border: '1px solid var(--text-primary)', textAlign: 'left', background: 'var(--bg-main)' }}>DERS / GÖREV</th>
                  {orderedDays.map((day, i) => (
                    <th key={day} style={{ padding: '0.6rem 0.5rem', border: '1px solid var(--text-primary)', textAlign: 'center', background: 'var(--bg-main)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{day}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{weekDates[i]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBJECTS.map((subject) => (
                  <tr key={subject}>
                    <td style={{ padding: '1rem', border: '1px solid var(--text-primary)', fontWeight: 800, background: 'var(--bg-main)' }}>{subject}</td>
                    {orderedDays.map((day) => {
                      const cellData = scheduleData[subject]?.[day] || { q: '', t: '' };

                      return (
                         <td key={`${subject}-${day}`} style={{ border: '1px solid var(--text-primary)', verticalAlign: 'top', padding: 0, position: 'relative' }}>
                          <div className="no-print" style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 2 }}>
                            {(cellData.q || cellData.t) && (
                              <button
                                onClick={() => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {q:'',t:''}}}))}
                                title="Hücreyi temizle"
                                style={{ width: '16px', height: '16px', borderRadius: '50%', border: 'none', background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}>
                                ✕
                              </button>
                            )}
                          </div>
                          <div style={{ padding: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <input
                                  className="no-print"
                                  type="text"
                                  value={cellData.q}
                                  onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...cellData, q: e.target.value}}}))}
                                  style={{ fontWeight: 800, fontSize: '0.95rem', width: '55px', border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', padding: '0', flexShrink: 0 }}
                                />
                                <div className="print-only" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginRight: '0.2rem' }}>
                                  {cellData.q}
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', opacity: cellData.q ? 1 : 0.4 }}>SORU</span>
                              </div>
                              <input type="checkbox" style={{ width: '14px', height: '14px', accentColor: 'var(--text-primary)', border: '1px solid var(--text-primary)' }} />
                            </div>
                            <textarea
                              className="no-print"
                              rows={2}
                              placeholder="Konu gir..."
                              value={cellData.t}
                              onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...cellData, t: e.target.value}}}))}
                              style={{ fontSize: '0.78rem', color: 'var(--text-primary)', border: '1px dashed transparent', borderRadius: '4px', outline: 'none', width: '100%', resize: 'none', background: 'transparent', padding: '1px 2px', fontFamily: 'var(--font-geist-sans)', fontWeight: cellData.t ? 700 : 400, transition: 'border-color 0.15s' }}
                              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                              onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
                            />
                            <div className="print-only" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', fontWeight: cellData.t ? 700 : 400, whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '30px' }}>
                              {cellData.t || ' '}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ background: 'var(--bg-main)' }}>
                  <td style={{ padding: '1rem', border: '1px solid var(--text-primary)', fontWeight: 800 }}>GÜNLÜK TOPLAM</td>
                  {orderedDays.map((day) => {
                    let total = 0;
                    SUBJECTS.forEach(sub => {
                      const q = parseInt(scheduleData[sub]?.[day]?.q) || 0;
                      total += q;
                    });
                    
                    return (
                      <td key={`total-${day}`} style={{ padding: '1rem', border: '1px solid var(--text-primary)', textAlign: 'center' }}>
                        <input 
                          className="no-print"
                          type="text" 
                          readOnly 
                          value={total > 0 ? total : ''} 
                          placeholder="0" 
                          style={{ fontWeight: 800, fontSize: '1.2rem', border: 'none', outline: 'none', background: 'transparent', width: '100%', textAlign: 'center', color: total > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }} 
                        />
                        <div 
                          className="print-only"
                          style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', textAlign: 'center', width: '100%' }}
                        >
                          {total > 0 ? total : '0'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SORU</div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
            )}

            {selectedTemplate === 'detayli' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.8rem', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>Dersler</th>
                    {['1. GÜN', '2. GÜN', '3. GÜN', '4. GÜN', '5. GÜN', '6. GÜN', '7. GÜN'].map(day => (
                      <th key={day} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>{day}</th>
                    ))}
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map((subject) => {
                    let totalQ = 0;
                    DAYS.forEach(day => { totalQ += parseInt(scheduleData[subject]?.[day]?.q) || 0; });
                    return (
                      <React.Fragment key={subject}>
                        <tr>
                          <td rowSpan={4} style={{ border: '1px solid var(--text-primary)', fontWeight: 800, width: '40px' }}>
                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto' }}>{subject}</div>
                          </td>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left', width: '150px' }}>Konu ve Kaynak Adı</td>
                          {orderedDays.map(day => (
                            <td key={'konu-'+day} style={{ border: '1px solid var(--text-primary)', padding: 0 }}>
                              <textarea 
                                className="no-print"
                                value={scheduleData[subject]?.[day]?.t || ''} 
                                onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{q:''}), t: e.target.value}}}))} 
                                style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', resize: 'none', background: 'transparent', fontSize: '0.75rem', textAlign: 'center', outline: 'none' }} 
                              />
                              <div 
                                className="print-only"
                                style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '20px', textAlign: 'center', width: '100%' }}
                              >
                                {scheduleData[subject]?.[day]?.t || ' '}
                              </div>
                            </td>
                          ))}
                          <td rowSpan={4} style={{ border: '1px solid var(--text-primary)', fontWeight: 800, fontSize: '1.2rem', verticalAlign: 'middle' }}>{totalQ > 0 ? totalQ : ''}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left' }}>Günlük Soru Hedefi</td>
                          {orderedDays.map(day => (
                            <td key={'hedef-'+day} style={{ border: '1px solid var(--text-primary)', padding: 0, background: 'rgba(0,0,0,0.02)' }}>
                              <input 
                                className="no-print"
                                type="text" 
                                value={scheduleData[subject]?.[day]?.q || ''} 
                                onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{t:''}), q: e.target.value}}}))} 
                                style={{ width: '100%', border: 'none', textAlign: 'center', background: 'transparent', fontWeight: 800, outline: 'none' }} 
                              />
                              <div 
                                className="print-only"
                                style={{ fontWeight: 800, textAlign: 'center', width: '100%' }}
                              >
                                {scheduleData[subject]?.[day]?.q || ' '}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left' }}>Çözülen Soru Sayısı</td>
                          {orderedDays.map(day => <td key={'cozulen-'+day} style={{ border: '1px solid var(--text-primary)' }}></td>)}
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 700, textAlign: 'left' }}>Çalışılan Süre</td>
                          {orderedDays.map(day => <td key={'sure-'+day} style={{ border: '1px solid var(--text-primary)' }}></td>)}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}

            {selectedTemplate === 'birlestirilmis' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.8rem', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)', width: '120px' }}>Dersler</th>
                    {['1. GÜN', '2. GÜN', '3. GÜN', '4. GÜN', '5. GÜN', '6. GÜN', '7. GÜN'].map(day => (
                      <th key={day} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>{day}</th>
                    ))}
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)', width: '80px' }}>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map((subject) => {
                    let totalQ = 0;
                    const allTopics = new Set<string>();
                    DAYS.forEach(day => {
                      totalQ += parseInt(scheduleData[subject]?.[day]?.q) || 0;
                      if (scheduleData[subject]?.[day]?.t) {
                        allTopics.add(scheduleData[subject][day].t);
                      }
                    });
                    const mergedTopics = Array.from(allTopics).join(' + ');

                    return (
                      <React.Fragment key={subject}>
                        <tr>
                          <td rowSpan={2} style={{ border: '1px solid var(--text-primary)', fontWeight: 800 }}>
                             <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto', padding: '1rem 0' }}>{subject}</div>
                          </td>
                          {orderedDays.map(day => (
                            <td key={'q-'+day} style={{ border: '1px solid var(--text-primary)', padding: 0, background: 'rgba(0,0,0,0.05)' }}>
                               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', gap: '0.2rem' }}>
                                 <input 
                                   className="no-print"
                                   type="text" 
                                   value={scheduleData[subject]?.[day]?.q || ''} 
                                   onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{t:''}), q: e.target.value}}}))} 
                                   style={{ width: '55px', border: 'none', textAlign: 'center', background: 'transparent', fontWeight: 800, outline: 'none', padding: '0', flexShrink: 0 }} 
                                 />
                                 <div 
                                   className="print-only"
                                   style={{ fontWeight: 800, textAlign: 'center', marginRight: '0.2rem' }}
                                 >
                                   {scheduleData[subject]?.[day]?.q}
                                 </div>
                                 <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>SORU</span>
                               </div>
                            </td>
                          ))}
                          <td rowSpan={2} style={{ border: '1px solid var(--text-primary)', fontWeight: 800, fontSize: '1.2rem', verticalAlign: 'middle' }}>{totalQ > 0 ? totalQ : ''}</td>
                        </tr>
                        <tr>
                          <td colSpan={7} style={{ border: '1px solid var(--text-primary)', padding: '1rem', fontWeight: 700 }}>
                            <textarea 
                              className="no-print"
                              value={mergedTopics} 
                              readOnly 
                              placeholder="Bu dersten planlanmış konu yok" 
                              style={{ width: '100%', textAlign: 'center', border: 'none', resize: 'none', background: 'transparent', fontWeight: 800, outline: 'none', fontFamily: 'inherit' }} 
                            />
                            <div 
                              className="print-only"
                              style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'center', width: '100%' }}
                            >
                              {mergedTopics || 'Bu dersten planlanmış konu yok'}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}

            {selectedTemplate === 'zaman_dilimli' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.8rem', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>DERS/İÇERİK</th>
                    {['1. GÜN', '2. GÜN', '3. GÜN', '4. GÜN', '5. GÜN', '6. GÜN', '7. GÜN'].map(day => (
                      <th key={day} style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>{day}</th>
                    ))}
                    <th style={{ padding: '0.5rem', border: '1px solid var(--text-primary)', background: 'var(--bg-main)' }}>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {['Sabah', 'Öğle Arası', 'Etüt', 'Akşam'].map(period => (
                     <React.Fragment key={period}>
                       {SUBJECTS.map((subject, idx) => {
                          let rowContent = (day: string) => {
                            if (period === 'Etüt') return (
                              <>
                                <textarea 
                                  className="no-print"
                                  value={scheduleData[subject]?.[day]?.t || ''} 
                                  onChange={e => setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{q:''}), t: e.target.value}}}))} 
                                  style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', resize: 'none', background: 'transparent', fontSize: '0.7rem', textAlign: 'center', outline: 'none' }} 
                                />
                                <div 
                                  className="print-only"
                                  style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '20px', textAlign: 'center', width: '100%' }}
                                >
                                  {scheduleData[subject]?.[day]?.t || ' '}
                                </div>
                              </>
                            );
                            if (period === 'Akşam') return (
                              <>
                                <input 
                                  className="no-print"
                                  type="text" 
                                  value={scheduleData[subject]?.[day]?.q ? scheduleData[subject]?.[day]?.q + ' SORU' : ''} 
                                  onChange={e => { const val = e.target.value.replace(' SORU',''); setScheduleData(prev => ({...prev, [subject]: {...(prev[subject]||{}), [day]: {...(prev[subject]?.[day]||{t:''}), q: val}}}))}} 
                                  style={{ width: '100%', border: 'none', textAlign: 'center', background: 'transparent', fontSize: '0.7rem', fontWeight: 600, outline: 'none' }} 
                                />
                                <div 
                                  className="print-only"
                                  style={{ fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', width: '100%' }}
                                >
                                  {scheduleData[subject]?.[day]?.q ? scheduleData[subject]?.[day]?.q + ' SORU' : ' '}
                                </div>
                              </>
                            );
                            return (
                              <>
                                <textarea 
                                  className="no-print"
                                  style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', resize: 'none', background: 'transparent', fontSize: '0.7rem', textAlign: 'center', outline: 'none' }} 
                                />
                                <div 
                                  className="print-only"
                                  style={{ minHeight: '20px', width: '100%' }}
                                >
                                  &nbsp;
                                </div>
                              </>
                            );
                          };

                         return (
                           <tr key={subject + period}>
                             {idx === 0 && (
                               <td rowSpan={SUBJECTS.length} style={{ border: '1px solid var(--text-primary)', width: '30px', background: 'var(--bg-main)' }}>
                                 <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto', fontWeight: 800 }}>{period}</div>
                               </td>
                             )}
                             <td style={{ border: '1px solid var(--text-primary)', padding: '0.4rem', fontWeight: 800, width: '100px' }}>{subject}</td>
                             {orderedDays.map(day => (
                               <td key={period+subject+day} style={{ border: '1px solid var(--text-primary)', padding: 0 }}>
                                 {rowContent(day)}
                               </td>
                             ))}
                             {idx === 0 && <td rowSpan={SUBJECTS.length} style={{ border: '1px solid var(--text-primary)' }}></td>}
                           </tr>
                         );
                       })}
                     </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}

          </div>

          <div className="print-details-section" style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'white' }}>
            <div className="details-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ border: '1px solid var(--text-primary)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                    SEVGİLİ {manualStudentName ? manualStudentName.split(' ')[0].toUpperCase() : 'ÖĞRENCİM'},
                  </h4>
                  <button className="no-print"
                    onClick={() => setStudentNote(generateNoteFromSchedule(scheduleData))}
                    style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--primary)', background: '#EFF6FF', color: 'var(--primary)', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>
                    🤖 Ödevden Güncelle
                  </button>
                </div>
                <textarea
                  className="no-print"
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  style={{ width: '100%', border: 'none', resize: 'vertical', minHeight: '120px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-geist-sans)', lineHeight: '1.6' }}
                  rows={8}
                />
                <div 
                  className="print-only"
                  style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {studentNote}
                </div>
              </div>

              <div style={{ border: '1px solid var(--text-primary)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>ÖĞRENCİ DEĞERLENDİRMESİ</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bu hafta sana verilen görevleri tamamlarken çalışma verimini nasıl değerlendirirsin? Zorlandığın konular neler oldu?</p>
                <div style={{ borderBottom: '1px dotted var(--text-muted)', marginTop: '1.5rem' }}></div>
                <div style={{ borderBottom: '1px dotted var(--text-muted)', marginTop: '1.5rem' }}></div>
              </div>
            </div>

            <div className="signatures-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Öğrenci</p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {manualStudentName || '—'}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Eğitim Danışmanı & Rehber Öğretmen</p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>Ahmet ŞANLI</p>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              {/* Sol: Sıfırla */}
              <button
                onClick={() => {
                  if (window.confirm('Tablo ve akıllı dağıtım sıfırlanacak. Emin misiniz?')) {
                    setScheduleData({});
                    setTemplateState(initTemplateState());
                  }
                }}
                style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid #EF4444', color: '#EF4444', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <span>🗑️</span> Tabloyu Sıfırla
              </button>
              {/* Sağ: Yazdır + Kaydet */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button
                className="btn-secondary"
                onClick={() => { window.print(); }}
                style={{ padding: '1rem 2.5rem', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.3rem' }}>🖨️</span> Programı Yazdır
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveToArchive} 
                style={{ padding: '1rem 3rem', background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'white', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.3rem' }}>💾</span> Arşive Kaydet
              </button>
              </div>
            </div>
          </div>
        </section>

      {isAnalyzing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="card" style={{
            width: '500px',
            maxWidth: '90vw',
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            {/* Spinning Brain Icon with Gradient Ring */}
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '4px solid var(--border)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{
                fontSize: '2.5rem',
                animation: 'pulse 1.5s ease-in-out infinite',
                userSelect: 'none'
              }}>🧠</div>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Yapay Zeka Analiz Ediyor
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Öğrencinin karne verileri yapay zeka koçu tarafından işleniyor.
            </p>
            
            {/* Progress Step List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left', margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 0 ? 1 : 0.4, transition: 'all 0.3s' }}>
                <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 2 ? 'var(--success)' : 'rgba(4, 120, 87, 0.1)', color: analysisSeconds >= 2 ? 'white' : 'var(--primary)', fontWeight: 'bold' }}>
                  {analysisSeconds >= 2 ? '✓' : '•'}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analysisSeconds >= 2 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  Sınav verileri ve karne okunuyor...
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 2 ? 1 : 0.4, transition: 'all 0.3s' }}>
                <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 7 ? 'var(--success)' : (analysisSeconds >= 2 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)'), color: analysisSeconds >= 7 ? 'white' : 'var(--primary)', fontWeight: 'bold' }}>
                  {analysisSeconds >= 7 ? '✓' : (analysisSeconds >= 2 ? '•' : '•')}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analysisSeconds >= 7 ? 'var(--text-secondary)' : (analysisSeconds >= 2 ? 'var(--text-primary)' : 'var(--text-muted)') }}>
                  Zayıf yönler ve konu eksikleri tespit ediliyor...
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 7 ? 1 : 0.4, transition: 'all 0.3s' }}>
                <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 7 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)', color: 'var(--primary)', fontWeight: 'bold' }}>
                  •
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analysisSeconds >= 7 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  Haftalık soru hedefleri ve koçluk notu hazırlanıyor...
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
              İşlem süresi sınav boyutuna göre değişebilir. Lütfen bekleyin.
            </p>
          </div>
        </div>
      )}
      {/* Sync Modal */}
      {showSyncModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '16px', padding: '2.5rem', position: 'relative' }}>
            <button onClick={() => setShowSyncModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>🧠</span> Akıllı Senkronizasyon
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>Öğrencinin güncel zayıflıklarını ve hedeflerini YZ ile analiz ederek programı otomatik dizin.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Option 1: PDF */}
              <div style={{ border: '2px solid var(--border)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>📄 Yeni PDF Sınav Yükle</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Son girilen denemeyi yükleyin, yapay zeka saniyeler içinde eksikleri bulsun.</p>
                <input type="file" accept="application/pdf" onChange={(e) => setExamFile(e.target.files?.[0] || null)} style={{ marginBottom: '1rem', width: '100%' }} />
                <button onClick={handlePdfUploadSync} disabled={!examFile} className="btn-primary" style={{ width: '100%', padding: '0.8rem', opacity: examFile ? 1 : 0.5 }}>PDF'i Tara ve Senkronize Et</button>
              </div>

              {/* Option 2: Arşiv */}
              <div style={{ border: '2px solid var(--border)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>🗂️ Arşivden Sınav Seç</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Öğrencinin daha önce sisteme işlenmiş sınavlarından birini analiz edin.</p>
                <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                  <option value="">Sınav Seçiniz...</option>
                  {selectedStudent?.exams?.map((e:any) => (
                    <option key={e.id} value={e.id}>{new Date(e.date).toLocaleDateString('tr-TR')} - {e.examType || 'Deneme'}</option>
                  ))}
                </select>
                <button onClick={() => { setShowSyncModal(false); handleSyncTopicList(selectedExamId); }} disabled={!selectedExamId} className="btn-secondary" style={{ width: '100%', padding: '0.8rem', opacity: selectedExamId ? 1 : 0.5 }}>Seçili Sınavla Senkronize Et</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
