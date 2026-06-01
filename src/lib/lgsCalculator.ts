// Dijital Koç: LGS Strateji ve İhtimal Hesaplama Motoru (Mock & Algoritma)

export interface HighSchool {
  name: string;
  city: string;
  baseScore: number;
  basePercentile: number;
  quota: number;
}

// 2025/2026 Tahmini LGS Lise Veritabanı (Örneklem)
export const HIGH_SCHOOLS: HighSchool[] = [
  { name: "Galatasaray Lisesi", city: "İstanbul", baseScore: 495, basePercentile: 0.05, quota: 100 },
  { name: "İstanbul Erkek Lisesi", city: "İstanbul", baseScore: 492, basePercentile: 0.08, quota: 150 },
  { name: "Kabataş Erkek Lisesi", city: "İstanbul", baseScore: 489, basePercentile: 0.12, quota: 150 },
  { name: "Ankara Fen Lisesi", city: "Ankara", baseScore: 490, basePercentile: 0.10, quota: 120 },
  { name: "Atatürk Anadolu Lisesi", city: "Ankara", baseScore: 480, basePercentile: 0.80, quota: 300 },
  { name: "Gazi Anadolu Lisesi", city: "Ankara", baseScore: 472, basePercentile: 1.50, quota: 250 },
  { name: "İzmir Fen Lisesi", city: "İzmir", baseScore: 488, basePercentile: 0.15, quota: 90 },
  { name: "Atatürk Lisesi", city: "İzmir", baseScore: 475, basePercentile: 1.10, quota: 300 },
  { name: "Bursa Nilüfer İMKB Fen Lisesi", city: "Bursa", baseScore: 482, basePercentile: 0.60, quota: 120 },
  { name: "Bursa Anadolu Lisesi", city: "Bursa", baseScore: 470, basePercentile: 1.80, quota: 200 },
  { name: "Antalya Adem Tolunay Anadolu Lisesi", city: "Antalya", baseScore: 465, basePercentile: 2.20, quota: 150 },
  { name: "Adana Fen Lisesi", city: "Adana", baseScore: 478, basePercentile: 0.90, quota: 120 },
  { name: "Trabzon Yomra Fen Lisesi", city: "Trabzon", baseScore: 470, basePercentile: 1.70, quota: 90 },
  { name: "Samsun Garip Zeycan Yıldırım Fen", city: "Samsun", baseScore: 468, basePercentile: 1.90, quota: 120 },
  { name: "Kayseri Fen Lisesi", city: "Kayseri", baseScore: 475, basePercentile: 1.20, quota: 150 },
  { name: "Konya Meram Fen Lisesi", city: "Konya", baseScore: 476, basePercentile: 1.10, quota: 120 },
  { name: "Eskişehir Fatih Fen Lisesi", city: "Eskişehir", baseScore: 472, basePercentile: 1.40, quota: 90 },
  { name: "Sakarya Cevat Ayhan Fen Lisesi", city: "Sakarya", baseScore: 460, basePercentile: 3.00, quota: 120 },
  { name: "Kocaeli Fen Lisesi", city: "Kocaeli", baseScore: 474, basePercentile: 1.30, quota: 120 }
];

export const CITIES = Array.from(new Set(HIGH_SCHOOLS.map(h => h.city))).sort();

// Net to Score and Percentile logic
export function calculateLgsPercentile(score: number): string {
  if (score >= 495) return "0.01 - 0.05";
  if (score >= 490) return "0.06 - 0.15";
  if (score >= 480) return "0.16 - 0.80";
  if (score >= 470) return "0.81 - 2.00";
  if (score >= 450) return "2.01 - 5.00";
  if (score >= 430) return "5.01 - 10.00";
  if (score >= 400) return "10.01 - 20.00";
  if (score >= 350) return "20.01 - 40.00";
  return "40.00+";
}

// Probability calculation based on score vs baseScore
export function calculateWinProbability(userScore: number, schoolBaseScore: number): number {
  const diff = userScore - schoolBaseScore;
  if (diff >= 10) return 99;
  if (diff >= 5) return 85 + diff; // e.g. diff 5 -> 90%
  if (diff >= 0) return 50 + (diff * 5); // e.g. diff 0 -> 50%, diff 4 -> 70%
  if (diff >= -5) return 20 + ((5 + diff) * 6); // e.g. diff -5 -> 20%, diff -1 -> 44%
  if (diff >= -15) return Math.max(1, 20 - Math.abs(diff));
  return 0; // No chance if more than 15 points below
}

// Gap calculation: How much score increases if a topic is mastered
// Note: In LGS, Turkish/Math/Science coefficients are higher (roughly ~4.5 points per question considering std deviation)
// English/Religion/History are lower (roughly ~1.5 points)
export function getImprovementOpportunities(subjectDetails: any[]) {
  const opportunities: { subject: string, topic: string, potentialIncrease: number }[] = [];
  
  if (!subjectDetails) return opportunities;

  subjectDetails.forEach((subject: any) => {
    // Determine coefficient based on subject name
    const subName = subject.name.toUpperCase();
    let coeff = 1.5;
    if (subName.includes("TÜRKÇE") || subName.includes("MATEMATİK") || subName.includes("FEN")) {
      coeff = 4.5;
    }

    // Assuming subject has an array of weak topics or incorrect counts
    // For now, if we don't have detailed topics in the JSON, we simulate it based on incorrect answers.
    const incorrect = parseInt(subject.incorrect) || 0;
    const blank = parseInt(subject.blank) || 0;
    const lostPoints = (incorrect + blank) * coeff;

    if (lostPoints > 0) {
      opportunities.push({
        subject: subject.name,
        topic: "Tüm Eksik Kazanımlar", // Can be detailed if backend provides topic breakdowns
        potentialIncrease: Math.round(lostPoints)
      });
    }
  });

  return opportunities.sort((a, b) => b.potentialIncrease - a.potentialIncrease);
}
