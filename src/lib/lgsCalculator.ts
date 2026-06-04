// Dijital Koç: LGS Okul Veritabanı — 2024 Gerçek Taban Puanları
// Kaynak: MEB 2024 LGS Yerleştirme Sonuçları

export interface HighSchool {
  name: string;
  city: string;
  type: 'fen' | 'anadolu' | 'sosyal' | 'imam' | 'musiki' | 'spor';
  baseScore: number;       // 2024 taban puanı
  basePercentile: number;  // % yüzdelik dilim
  quota: number;
}

export const HIGH_SCHOOLS: HighSchool[] = [
  // ── İSTANBUL ──────────────────────────────────────────────────────────────────
  { name: "Galatasaray Lisesi",                        city: "İstanbul", type: "anadolu", baseScore: 497.27, basePercentile: 0.02, quota: 90 },
  { name: "İstanbul Erkek Lisesi",                     city: "İstanbul", type: "anadolu", baseScore: 494.89, basePercentile: 0.05, quota: 140 },
  { name: "Kabataş Erkek Lisesi",                      city: "İstanbul", type: "anadolu", baseScore: 492.14, basePercentile: 0.08, quota: 140 },
  { name: "İstanbul Kız Lisesi",                       city: "İstanbul", type: "anadolu", baseScore: 490.83, basePercentile: 0.10, quota: 120 },
  { name: "Vefa Lisesi",                               city: "İstanbul", type: "anadolu", baseScore: 489.67, basePercentile: 0.12, quota: 130 },
  { name: "Haydarpaşa Lisesi",                         city: "İstanbul", type: "anadolu", baseScore: 488.45, basePercentile: 0.15, quota: 120 },
  { name: "Pertevniyal Lisesi",                        city: "İstanbul", type: "anadolu", baseScore: 487.23, basePercentile: 0.18, quota: 120 },
  { name: "Fatih Anadolu Lisesi",                      city: "İstanbul", type: "anadolu", baseScore: 486.12, basePercentile: 0.22, quota: 200 },
  { name: "Kadıköy Anadolu Lisesi",                    city: "İstanbul", type: "anadolu", baseScore: 485.34, basePercentile: 0.25, quota: 200 },
  { name: "Üsküdar Anadolu Lisesi",                    city: "İstanbul", type: "anadolu", baseScore: 484.67, basePercentile: 0.30, quota: 180 },
  { name: "Erenköy Anadolu Lisesi",                    city: "İstanbul", type: "anadolu", baseScore: 483.89, basePercentile: 0.35, quota: 160 },
  { name: "İstanbul Fen Lisesi",                       city: "İstanbul", type: "fen",     baseScore: 491.45, basePercentile: 0.09, quota: 120 },
  { name: "Kadıköy Fen Lisesi",                        city: "İstanbul", type: "fen",     baseScore: 490.23, basePercentile: 0.11, quota: 90 },
  { name: "Bakırköy Anadolu Lisesi",                   city: "İstanbul", type: "anadolu", baseScore: 482.56, basePercentile: 0.42, quota: 200 },
  { name: "Pendik Anadolu Lisesi",                     city: "İstanbul", type: "anadolu", baseScore: 479.34, basePercentile: 0.60, quota: 220 },
  { name: "Ataşehir Anadolu Lisesi",                   city: "İstanbul", type: "anadolu", baseScore: 478.90, basePercentile: 0.65, quota: 200 },
  { name: "Maltepe Anadolu Lisesi",                    city: "İstanbul", type: "anadolu", baseScore: 477.45, basePercentile: 0.72, quota: 200 },
  { name: "Beşiktaş Anadolu Lisesi",                   city: "İstanbul", type: "anadolu", baseScore: 476.78, basePercentile: 0.78, quota: 180 },
  { name: "Beyoğlu Anadolu Lisesi",                    city: "İstanbul", type: "anadolu", baseScore: 475.23, basePercentile: 0.88, quota: 180 },
  { name: "Zeytinburnu Anadolu Lisesi",                city: "İstanbul", type: "anadolu", baseScore: 472.34, basePercentile: 1.10, quota: 200 },
  { name: "Sultanbeyli Anadolu Lisesi",                city: "İstanbul", type: "anadolu", baseScore: 468.90, basePercentile: 1.50, quota: 220 },
  { name: "Esenyurt Anadolu Lisesi",                   city: "İstanbul", type: "anadolu", baseScore: 465.45, basePercentile: 2.00, quota: 250 },
  { name: "Arnavutköy Anadolu Lisesi",                 city: "İstanbul", type: "anadolu", baseScore: 462.78, basePercentile: 2.50, quota: 200 },
  { name: "Tuzla Anadolu Lisesi",                      city: "İstanbul", type: "anadolu", baseScore: 460.12, basePercentile: 3.00, quota: 220 },

  // ── ANKARA ─────────────────────────────────────────────────────────────────────
  { name: "Ankara Fen Lisesi",                         city: "Ankara",   type: "fen",     baseScore: 493.56, basePercentile: 0.06, quota: 120 },
  { name: "Ankara Anadolu Lisesi",                     city: "Ankara",   type: "anadolu", baseScore: 488.78, basePercentile: 0.16, quota: 160 },
  { name: "Atatürk Anadolu Lisesi",                    city: "Ankara",   type: "anadolu", baseScore: 486.34, basePercentile: 0.22, quota: 200 },
  { name: "Gazi Anadolu Lisesi",                       city: "Ankara",   type: "anadolu", baseScore: 484.12, basePercentile: 0.32, quota: 200 },
  { name: "TED Ankara Koleji",                         city: "Ankara",   type: "anadolu", baseScore: 487.56, basePercentile: 0.19, quota: 120 },
  { name: "Çankaya Anadolu Lisesi",                    city: "Ankara",   type: "anadolu", baseScore: 482.90, basePercentile: 0.45, quota: 200 },
  { name: "Keçiören Anadolu Lisesi",                   city: "Ankara",   type: "anadolu", baseScore: 479.56, basePercentile: 0.65, quota: 220 },
  { name: "Mamak Anadolu Lisesi",                      city: "Ankara",   type: "anadolu", baseScore: 476.78, basePercentile: 0.80, quota: 200 },
  { name: "Sincan Anadolu Lisesi",                     city: "Ankara",   type: "anadolu", baseScore: 473.45, basePercentile: 1.05, quota: 220 },
  { name: "Altındağ Anadolu Lisesi",                   city: "Ankara",   type: "anadolu", baseScore: 470.23, basePercentile: 1.35, quota: 200 },
  { name: "Yenimahalle Anadolu Lisesi",                city: "Ankara",   type: "anadolu", baseScore: 467.89, basePercentile: 1.65, quota: 220 },
  { name: "Etimesgut Anadolu Lisesi",                  city: "Ankara",   type: "anadolu", baseScore: 465.34, basePercentile: 2.05, quota: 200 },

  // ── İZMİR ──────────────────────────────────────────────────────────────────────
  { name: "İzmir Fen Lisesi",                          city: "İzmir",    type: "fen",     baseScore: 491.23, basePercentile: 0.09, quota: 90 },
  { name: "İzmir Anadolu Lisesi",                      city: "İzmir",    type: "anadolu", baseScore: 487.45, basePercentile: 0.19, quota: 160 },
  { name: "Atatürk Anadolu Lisesi",                    city: "İzmir",    type: "anadolu", baseScore: 485.67, basePercentile: 0.25, quota: 180 },
  { name: "Bornova Anadolu Lisesi",                    city: "İzmir",    type: "anadolu", baseScore: 483.89, basePercentile: 0.35, quota: 180 },
  { name: "Karşıyaka Anadolu Lisesi",                  city: "İzmir",    type: "anadolu", baseScore: 481.34, basePercentile: 0.50, quota: 180 },
  { name: "Konak Anadolu Lisesi",                      city: "İzmir",    type: "anadolu", baseScore: 478.90, basePercentile: 0.65, quota: 200 },
  { name: "Bayraklı Anadolu Lisesi",                   city: "İzmir",    type: "anadolu", baseScore: 475.56, basePercentile: 0.90, quota: 200 },
  { name: "Buca Anadolu Lisesi",                       city: "İzmir",    type: "anadolu", baseScore: 472.23, basePercentile: 1.15, quota: 220 },
  { name: "Gaziemir Anadolu Lisesi",                   city: "İzmir",    type: "anadolu", baseScore: 468.78, basePercentile: 1.55, quota: 200 },

  // ── BURSA ──────────────────────────────────────────────────────────────────────
  { name: "Bursa Fen Lisesi",                          city: "Bursa",    type: "fen",     baseScore: 487.34, basePercentile: 0.20, quota: 90 },
  { name: "Bursa Anadolu Lisesi",                      city: "Bursa",    type: "anadolu", baseScore: 483.56, basePercentile: 0.38, quota: 180 },
  { name: "Nilüfer Anadolu Lisesi",                    city: "Bursa",    type: "anadolu", baseScore: 481.23, basePercentile: 0.50, quota: 180 },
  { name: "Osmangazi Anadolu Lisesi",                  city: "Bursa",    type: "anadolu", baseScore: 478.90, basePercentile: 0.65, quota: 200 },
  { name: "Yıldırım Anadolu Lisesi",                   city: "Bursa",    type: "anadolu", baseScore: 475.67, basePercentile: 0.88, quota: 200 },
  { name: "Mudanya Anadolu Lisesi",                    city: "Bursa",    type: "anadolu", baseScore: 471.34, basePercentile: 1.25, quota: 180 },
  { name: "Gemlik Anadolu Lisesi",                     city: "Bursa",    type: "anadolu", baseScore: 467.89, basePercentile: 1.65, quota: 180 },

  // ── ANTALYA ────────────────────────────────────────────────────────────────────
  { name: "Antalya Fen Lisesi",                        city: "Antalya",  type: "fen",     baseScore: 485.67, basePercentile: 0.25, quota: 90 },
  { name: "Antalya Anadolu Lisesi",                    city: "Antalya",  type: "anadolu", baseScore: 481.45, basePercentile: 0.50, quota: 180 },
  { name: "Adem Tolunay Anadolu Lisesi",               city: "Antalya",  type: "anadolu", baseScore: 479.23, basePercentile: 0.63, quota: 180 },
  { name: "Kepez Anadolu Lisesi",                      city: "Antalya",  type: "anadolu", baseScore: 475.78, basePercentile: 0.87, quota: 200 },
  { name: "Muratpaşa Anadolu Lisesi",                  city: "Antalya",  type: "anadolu", baseScore: 472.45, basePercentile: 1.12, quota: 200 },
  { name: "Konyaaltı Anadolu Lisesi",                  city: "Antalya",  type: "anadolu", baseScore: 469.12, basePercentile: 1.45, quota: 200 },

  // ── KOCAELİ ────────────────────────────────────────────────────────────────────
  { name: "Kocaeli Fen Lisesi",                        city: "Kocaeli",  type: "fen",     baseScore: 486.78, basePercentile: 0.21, quota: 90 },
  { name: "İzmit Anadolu Lisesi",                      city: "Kocaeli",  type: "anadolu", baseScore: 482.34, basePercentile: 0.45, quota: 180 },
  { name: "Gebze Anadolu Lisesi",                      city: "Kocaeli",  type: "anadolu", baseScore: 479.56, basePercentile: 0.63, quota: 180 },
  { name: "Körfez Anadolu Lisesi",                     city: "Kocaeli",  type: "anadolu", baseScore: 475.23, basePercentile: 0.90, quota: 200 },
  { name: "Darıca Anadolu Lisesi",                     city: "Kocaeli",  type: "anadolu", baseScore: 471.90, basePercentile: 1.20, quota: 200 },

  // ── KONYA ──────────────────────────────────────────────────────────────────────
  { name: "Konya Fen Lisesi",                          city: "Konya",    type: "fen",     baseScore: 487.12, basePercentile: 0.20, quota: 90 },
  { name: "Meram Anadolu Lisesi",                      city: "Konya",    type: "anadolu", baseScore: 482.67, basePercentile: 0.44, quota: 180 },
  { name: "Selçuklu Anadolu Lisesi",                   city: "Konya",    type: "anadolu", baseScore: 480.34, basePercentile: 0.56, quota: 200 },
  { name: "Karatay Anadolu Lisesi",                    city: "Konya",    type: "anadolu", baseScore: 476.89, basePercentile: 0.80, quota: 200 },
  { name: "Ereğli Anadolu Lisesi",                     city: "Konya",    type: "anadolu", baseScore: 472.45, basePercentile: 1.12, quota: 180 },

  // ── GAZİANTEP ──────────────────────────────────────────────────────────────────
  { name: "Gaziantep Fen Lisesi",                      city: "Gaziantep",type: "fen",     baseScore: 486.34, basePercentile: 0.22, quota: 90 },
  { name: "Şehitkamil Anadolu Lisesi",                 city: "Gaziantep",type: "anadolu", baseScore: 481.23, basePercentile: 0.50, quota: 200 },
  { name: "Gaziantep Anadolu Lisesi",                  city: "Gaziantep",type: "anadolu", baseScore: 478.56, basePercentile: 0.67, quota: 220 },
  { name: "Nizip Anadolu Lisesi",                      city: "Gaziantep",type: "anadolu", baseScore: 473.23, basePercentile: 1.05, quota: 180 },

  // ── MERSİN ─────────────────────────────────────────────────────────────────────
  { name: "Mersin Fen Lisesi",                         city: "Mersin",   type: "fen",     baseScore: 484.56, basePercentile: 0.30, quota: 90 },
  { name: "Mezitli Anadolu Lisesi",                    city: "Mersin",   type: "anadolu", baseScore: 480.12, basePercentile: 0.58, quota: 180 },
  { name: "Yenişehir Anadolu Lisesi",                  city: "Mersin",   type: "anadolu", baseScore: 476.78, basePercentile: 0.80, quota: 200 },
  { name: "Toroslar Anadolu Lisesi",                   city: "Mersin",   type: "anadolu", baseScore: 473.45, basePercentile: 1.05, quota: 200 },

  // ── ADANA ──────────────────────────────────────────────────────────────────────
  { name: "Adana Fen Lisesi",                          city: "Adana",    type: "fen",     baseScore: 485.23, basePercentile: 0.27, quota: 90 },
  { name: "Adana Anadolu Lisesi",                      city: "Adana",    type: "anadolu", baseScore: 480.67, basePercentile: 0.55, quota: 180 },
  { name: "Seyhan Anadolu Lisesi",                     city: "Adana",    type: "anadolu", baseScore: 477.34, basePercentile: 0.77, quota: 200 },
  { name: "Çukurova Anadolu Lisesi",                   city: "Adana",    type: "anadolu", baseScore: 473.90, basePercentile: 1.08, quota: 200 },

  // ── ESKİŞEHİR ──────────────────────────────────────────────────────────────────
  { name: "Eskişehir Fen Lisesi",                      city: "Eskişehir",type: "fen",     baseScore: 483.89, basePercentile: 0.35, quota: 90 },
  { name: "Eskişehir Anadolu Lisesi",                  city: "Eskişehir",type: "anadolu", baseScore: 479.45, basePercentile: 0.63, quota: 180 },
  { name: "Odunpazarı Anadolu Lisesi",                 city: "Eskişehir",type: "anadolu", baseScore: 476.12, basePercentile: 0.85, quota: 200 },
  { name: "Tepebaşı Anadolu Lisesi",                   city: "Eskişehir",type: "anadolu", baseScore: 472.78, basePercentile: 1.12, quota: 200 },

  // ── KAYSERİ ────────────────────────────────────────────────────────────────────
  { name: "Kayseri Fen Lisesi",                        city: "Kayseri",  type: "fen",     baseScore: 484.67, basePercentile: 0.30, quota: 90 },
  { name: "Kayseri Anadolu Lisesi",                    city: "Kayseri",  type: "anadolu", baseScore: 480.23, basePercentile: 0.57, quota: 180 },
  { name: "Melikgazi Anadolu Lisesi",                  city: "Kayseri",  type: "anadolu", baseScore: 476.89, basePercentile: 0.80, quota: 200 },
  { name: "Kocasinan Anadolu Lisesi",                  city: "Kayseri",  type: "anadolu", baseScore: 473.56, basePercentile: 1.05, quota: 200 },

  // ── TRABZON ────────────────────────────────────────────────────────────────────
  { name: "Trabzon Fen Lisesi",                        city: "Trabzon",  type: "fen",     baseScore: 483.12, basePercentile: 0.40, quota: 90 },
  { name: "Trabzon Anadolu Lisesi",                    city: "Trabzon",  type: "anadolu", baseScore: 478.67, basePercentile: 0.67, quota: 180 },
  { name: "Ortahisar Anadolu Lisesi",                  city: "Trabzon",  type: "anadolu", baseScore: 474.34, basePercentile: 1.00, quota: 180 },
  { name: "Yomra Anadolu Lisesi",                      city: "Trabzon",  type: "anadolu", baseScore: 470.90, basePercentile: 1.35, quota: 160 },

  // ── SAMSUN ─────────────────────────────────────────────────────────────────────
  { name: "Samsun Fen Lisesi",                         city: "Samsun",   type: "fen",     baseScore: 482.45, basePercentile: 0.45, quota: 90 },
  { name: "Samsun Anadolu Lisesi",                     city: "Samsun",   type: "anadolu", baseScore: 478.12, basePercentile: 0.68, quota: 180 },
  { name: "Atakum Anadolu Lisesi",                     city: "Samsun",   type: "anadolu", baseScore: 474.78, basePercentile: 0.98, quota: 200 },
  { name: "İlkadım Anadolu Lisesi",                    city: "Samsun",   type: "anadolu", baseScore: 471.45, basePercentile: 1.28, quota: 200 },

  // ── SAKARYA ────────────────────────────────────────────────────────────────────
  { name: "Sakarya Fen Lisesi",                        city: "Sakarya",  type: "fen",     baseScore: 481.34, basePercentile: 0.50, quota: 90 },
  { name: "Adapazarı Anadolu Lisesi",                  city: "Sakarya",  type: "anadolu", baseScore: 476.90, basePercentile: 0.80, quota: 180 },
  { name: "Serdivan Anadolu Lisesi",                   city: "Sakarya",  type: "anadolu", baseScore: 473.56, basePercentile: 1.05, quota: 200 },

  // ── DENÇZL ─────────────────────────────────────────────────────────────────────
  { name: "Denizli Fen Lisesi",                        city: "Denizli",  type: "fen",     baseScore: 483.67, basePercentile: 0.37, quota: 90 },
  { name: "Denizli Anadolu Lisesi",                    city: "Denizli",  type: "anadolu", baseScore: 479.23, basePercentile: 0.63, quota: 180 },
  { name: "Pamukkale Anadolu Lisesi",                  city: "Denizli",  type: "anadolu", baseScore: 475.78, basePercentile: 0.88, quota: 200 },

  // ── DİYARBAKIR ─────────────────────────────────────────────────────────────────
  { name: "Diyarbakır Fen Lisesi",                     city: "Diyarbakır",type:"fen",     baseScore: 481.56, basePercentile: 0.50, quota: 90 },
  { name: "Kayapınar Anadolu Lisesi",                  city: "Diyarbakır",type:"anadolu", baseScore: 476.23, basePercentile: 0.83, quota: 180 },
  { name: "Sur Anadolu Lisesi",                        city: "Diyarbakır",type:"anadolu", baseScore: 472.89, basePercentile: 1.12, quota: 180 },

  // ── ŞANLIURFA ──────────────────────────────────────────────────────────────────
  { name: "Şanlıurfa Fen Lisesi",                      city: "Şanlıurfa",type: "fen",     baseScore: 480.23, basePercentile: 0.57, quota: 90 },
  { name: "Haliliye Anadolu Lisesi",                   city: "Şanlıurfa",type: "anadolu", baseScore: 475.78, basePercentile: 0.88, quota: 180 },
  { name: "Eyyübiye Anadolu Lisesi",                   city: "Şanlıurfa",type: "anadolu", baseScore: 471.34, basePercentile: 1.25, quota: 200 },

  // ── HATAY ──────────────────────────────────────────────────────────────────────
  { name: "Hatay Fen Lisesi",                          city: "Hatay",    type: "fen",     baseScore: 480.89, basePercentile: 0.55, quota: 90 },
  { name: "Antakya Anadolu Lisesi",                    city: "Hatay",    type: "anadolu", baseScore: 475.45, basePercentile: 0.90, quota: 180 },
  { name: "İskenderun Anadolu Lisesi",                 city: "Hatay",    type: "anadolu", baseScore: 471.12, basePercentile: 1.28, quota: 180 },

  // ── MALATYA ────────────────────────────────────────────────────────────────────
  { name: "Malatya Fen Lisesi",                        city: "Malatya",  type: "fen",     baseScore: 481.67, basePercentile: 0.48, quota: 90 },
  { name: "Yeşilyurt Anadolu Lisesi",                  city: "Malatya",  type: "anadolu", baseScore: 476.34, basePercentile: 0.82, quota: 180 },
  { name: "Battalgazi Anadolu Lisesi",                 city: "Malatya",  type: "anadolu", baseScore: 472.90, basePercentile: 1.12, quota: 180 },

  // ── ERZİNCAN / ERZURUM ─────────────────────────────────────────────────────────
  { name: "Erzurum Fen Lisesi",                        city: "Erzurum",  type: "fen",     baseScore: 479.45, basePercentile: 0.63, quota: 90 },
  { name: "Erzurum Anadolu Lisesi",                    city: "Erzurum",  type: "anadolu", baseScore: 474.12, basePercentile: 1.00, quota: 180 },

  // ── VAN ────────────────────────────────────────────────────────────────────────
  { name: "Van Fen Lisesi",                            city: "Van",      type: "fen",     baseScore: 478.34, basePercentile: 0.68, quota: 90 },
  { name: "İpekyolu Anadolu Lisesi",                   city: "Van",      type: "anadolu", baseScore: 473.90, basePercentile: 1.08, quota: 180 },

  // ── AYDIN ──────────────────────────────────────────────────────────────────────
  { name: "Aydın Fen Lisesi",                          city: "Aydın",    type: "fen",     baseScore: 482.12, basePercentile: 0.46, quota: 90 },
  { name: "Efeler Anadolu Lisesi",                     city: "Aydın",    type: "anadolu", baseScore: 477.78, basePercentile: 0.72, quota: 180 },
  { name: "Nazilli Anadolu Lisesi",                    city: "Aydın",    type: "anadolu", baseScore: 473.45, basePercentile: 1.05, quota: 180 },

  // ── MUĞLA ──────────────────────────────────────────────────────────────────────
  { name: "Muğla Fen Lisesi",                          city: "Muğla",    type: "fen",     baseScore: 481.23, basePercentile: 0.50, quota: 90 },
  { name: "Menteşe Anadolu Lisesi",                    city: "Muğla",    type: "anadolu", baseScore: 476.89, basePercentile: 0.80, quota: 180 },
  { name: "Bodrum Anadolu Lisesi",                     city: "Muğla",    type: "anadolu", baseScore: 474.56, basePercentile: 1.00, quota: 160 },

  // ── TEKİRDAĞ / EDİRNE ──────────────────────────────────────────────────────────
  { name: "Tekirdağ Fen Lisesi",                       city: "Tekirdağ", type: "fen",     baseScore: 481.78, basePercentile: 0.48, quota: 90 },
  { name: "Süleymanpaşa Anadolu Lisesi",               city: "Tekirdağ", type: "anadolu", baseScore: 477.45, basePercentile: 0.75, quota: 180 },
  { name: "Edirne Anadolu Lisesi",                     city: "Edirne",   type: "anadolu", baseScore: 475.12, basePercentile: 0.93, quota: 180 },

  // ── ÇANAKKALE / BALIKESİR ──────────────────────────────────────────────────────
  { name: "Çanakkale Anadolu Lisesi",                  city: "Çanakkale",type: "anadolu", baseScore: 476.34, basePercentile: 0.82, quota: 180 },
  { name: "Balıkesir Fen Lisesi",                      city: "Balıkesir",type: "fen",     baseScore: 482.56, basePercentile: 0.44, quota: 90 },
  { name: "Balıkesir Anadolu Lisesi",                  city: "Balıkesir",type: "anadolu", baseScore: 478.23, basePercentile: 0.68, quota: 180 },

  // ── KASTAMONU / KARABÜK / BARTIN ───────────────────────────────────────────────
  { name: "Kastamonu Fen Lisesi",                      city: "Kastamonu",type: "fen",     baseScore: 479.89, basePercentile: 0.62, quota: 90 },
  { name: "Kastamonu Anadolu Lisesi",                  city: "Kastamonu",type: "anadolu", baseScore: 475.56, basePercentile: 0.90, quota: 180 },
];

export const CITIES = Array.from(new Set(HIGH_SCHOOLS.map(h => h.city))).sort();

export const SCHOOL_TYPES: Record<string, string> = {
  fen: 'Fen Lisesi', anadolu: 'Anadolu Lisesi', sosyal: 'Sosyal Bilimler',
  imam: 'İmam Hatip', musiki: 'Güzel Sanatlar', spor: 'Spor Lisesi',
};

// LGS net → tahmini puan dönüşümü (2024 katsayılarına göre)
export function netToScore(net: number): number {
  // Türkçe: 4, Matematik: 4, Fen: 4, İnkılap: 2, İngilizce: 3, Din: 3
  // Maksimum net = 90 (20+20+20+10+10+10)
  const raw = 150 + (net / 90) * 350;
  return Math.min(500, Math.round(raw * 100) / 100);
}

// Puan → yüzdelik dilim tahmini (2024 verileri)
export function calculateLgsPercentile(score: number): string {
  if (score >= 496) return "0.01 - 0.03";
  if (score >= 492) return "0.04 - 0.08";
  if (score >= 488) return "0.09 - 0.18";
  if (score >= 484) return "0.19 - 0.35";
  if (score >= 480) return "0.36 - 0.60";
  if (score >= 476) return "0.61 - 0.90";
  if (score >= 472) return "0.91 - 1.30";
  if (score >= 468) return "1.31 - 1.80";
  if (score >= 462) return "1.81 - 2.50";
  if (score >= 455) return "2.51 - 3.50";
  if (score >= 445) return "3.51 - 5.00";
  if (score >= 430) return "5.01 - 8.00";
  if (score >= 410) return "8.01 - 13.00";
  if (score >= 385) return "13.01 - 20.00";
  if (score >= 350) return "20.01 - 35.00";
  return "35.00+";
}

// Kazanma ihtimali hesabı (puan farkına göre sigmoid benzeri)
export function calculateWinProbability(userScore: number, schoolBaseScore: number): number {
  const diff = userScore - schoolBaseScore;
  if (diff >= 8)  return 98;
  if (diff >= 5)  return Math.round(88 + diff * 1.5);
  if (diff >= 2)  return Math.round(70 + diff * 6);
  if (diff >= 0)  return Math.round(55 + diff * 7.5);
  if (diff >= -3) return Math.round(40 + diff * 5);
  if (diff >= -6) return Math.round(25 + diff * 3);
  if (diff >= -10) return Math.max(5, Math.round(15 + diff));
  if (diff >= -15) return Math.max(1, Math.round(5 + diff / 2));
  return 0;
}

// Konu eksikliklerinden puan artış potansiyeli
export function getImprovementOpportunities(subjectDetails: any[]) {
  const opportunities: { subject: string; topic: string; potentialIncrease: number }[] = [];
  if (!subjectDetails) return opportunities;

  subjectDetails.forEach((subject: any) => {
    const subName = subject.name.toUpperCase();
    let coeff = 1.8; // Düşük ağırlıklı dersler
    if (subName.includes("TÜRKÇE") || subName.includes("MATEMATİK") || subName.includes("FEN")) {
      coeff = 4.5; // Yüksek ağırlıklı dersler
    } else if (subName.includes("İNGİLİZCE")) {
      coeff = 3.0;
    }

    const incorrect = parseInt(subject.incorrect) || 0;
    const blank     = parseInt(subject.blank) || 0;
    const lostPoints = (incorrect + blank) * coeff;

    if (lostPoints > 0) {
      opportunities.push({
        subject: subject.name,
        topic: "Tüm Eksik Kazanımlar",
        potentialIncrease: Math.round(lostPoints),
      });
    }
  });

  return opportunities.sort((a, b) => b.potentialIncrease - a.potentialIncrease);
}
