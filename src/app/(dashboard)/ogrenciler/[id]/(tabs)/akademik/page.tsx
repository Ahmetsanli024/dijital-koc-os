"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react"

export default function StudentAcademicPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const studentId = params.id

  // Initial curriculum data according to the Turkish 8th Grade LGS Syllabus (as requested in the user's images)
  const initialCurriculum: Record<string, { id: string; name: string; topics: string[] }[]> = {
    matematik: [
      { id: "m1", name: "1. Çarpanlar ve Katlar", topics: ["Asal Sayılar", "EBOB - EKOK", "Aralarında Asal Sayılar", "Problemler"] },
      { id: "m2", name: "2. Üslü İfadeler", topics: ["Üslü Sayılar", "Üslü İfadelerle İşlemler", "Bilimsel Gösterim", "Problemler"] },
      { id: "m3", name: "3. Kareköklü İfadeler", topics: ["Tam Kare Sayılar", "Kareköklü İfadelerde İşlemler", "Ondalık Gösterim", "Gerçek Sayılar"] },
      { id: "m4", name: "4. Veri Analizi", topics: ["Veri Toplama ve Düzenleme", "Tablo ve Grafik Okuma", "Ortalama, Ortanca, Tepe Değer", "Problemler"] },
    ],
    fen: [
      { id: "f1", name: "1. Mevsimler ve İklim", topics: ["Mevsimlerin Oluşumu", "İklim ve Hava Hareketleri", "İklim Elemanları", "İklim ve İnsan"] },
      { id: "f2", name: "2. DNA ve Genetik Kod", topics: ["DNA'nın Yapısı", "DNA'nın Kendini Eşlemesi", "Protein Sentezi", "Genetik Kod", "Kalıtım"] },
      { id: "f3", name: "3. Basınç", topics: ["Katı Basıncı", "Sıvı Basıncı", "Gaz Basıncı", "Pascal Prensibi"] },
    ],
    turkce: [
      { id: "t1", name: "1. Fiilimsiler", topics: ["Fiilimsilerin Anlam Özellikleri", "Fiilimsi Türleri", "Fiilimsilerin Cümledeki Görevleri"] },
      { id: "t2", name: "2. Sözcükte Anlam", topics: ["Gerçek, Mecaz ve Terim Anlam", "Eş Anlamlı/Zıt Anlamlı Sözcükler", "Somut - Soyut Anlam", "Deyimler ve Atasözleri"] },
      { id: "t3", name: "3. Cümlede Anlam", topics: ["Cümle Anlam Özellikleri", "Cümleler Arası Anlam İlişkileri", "Anlamca Çelişen Cümleler", "Cümle Tamamlama"] },
    ],
    inkilap: [
      { id: "i1", name: "1. Bir Kahraman Doğuyor", topics: ["Mustafa Kemal'in Ailesi", "Mustafa Kemal'in Çocukluk Yılları", "Mustafa Kemal'in Eğitim Hayatı"] },
      { id: "i2", name: "2. Milli Uyanış", topics: ["I. Dünya Savaşı Öncesi Osmanlı Devleti", "I. Dünya Savaşı", "Mondros Ateşkes Antlaşması", "İşgaller", "Cemiyetler"] },
    ],
    din: [
      { id: "d1", name: "1. Kader İnancı", topics: ["Kaza ve Kader", "Kader İnancının İnsan Hayatındaki Önemi", "İnsanın İradesi ve Kader", "Kaderle İlgili Kavramlar"] },
      { id: "d2", name: "2. Zekat ve Sadaka", topics: ["Zekatın Önemi ve Hükmü", "Zekatın Kimlere Verileceği", "Sadakanın Önemi", "İnfak ve Yardımlaşma"] },
    ],
    ingilizce: [
      { id: "e1", name: "1. Friendship", topics: ["Vocabulary (Feelings, Personality, Friendship)", "Expressing Likes and Dislikes", "Stating Opinions", "Making Inquiries"] },
      { id: "e2", name: "2. Teen Life", topics: ["Daily Routines", "Chores", "Free Time Activities", "Stating Frequency", "Simple Present Tense"] },
    ]
  }

  // Local state to manage student's custom progress on these topics
  // Format: { [topicName]: { ogrendim: boolean, tekrar: boolean, pekistirdim: boolean } }
  const [progress, setProgress] = useState<Record<string, { ogrendim: boolean; tekrar: boolean; pekistirdim: boolean }>>({})

  // Fetch or set initial values on mount
  useEffect(() => {
    // Generate default/mock progress values for a beautiful first view
    const defaultProgress: Record<string, { ogrendim: boolean; tekrar: boolean; pekistirdim: boolean }> = {}
    
    Object.values(initialCurriculum).forEach((chapters) => {
      chapters.forEach((chapter) => {
        chapter.topics.forEach((topic) => {
          // Semi-randomly initialize for mock aesthetics
          const hash = topic.length % 5
          defaultProgress[topic] = {
            ogrendim: hash > 1,
            tekrar: hash > 2,
            pekistirdim: hash > 3,
          }
        })
      })
    })

    setProgress(defaultProgress)
  }, [studentId])

  const handleCheckboxChange = (topic: string, field: "ogrendim" | "tekrar" | "pekistirdim", value: boolean) => {
    setProgress((prev) => ({
      ...prev,
      [topic]: {
        ...prev[topic],
        [field]: value,
      },
    }))
    toast.success(`"${topic}" konusu güncellendi.`)
  }

  // Calculate stats for current curriculum
  const calculateSubjectStats = (subjectKey: string) => {
    const chapters = initialCurriculum[subjectKey]
    let totalTopics = 0
    let completedTopics = 0

    chapters.forEach((chapter) => {
      chapter.topics.forEach((topic) => {
        totalTopics++
        const prog = progress[topic]
        if (prog?.ogrendim && prog?.tekrar && prog?.pekistirdim) {
          completedTopics++
        }
      })
    })

    return {
      total: totalTopics,
      completed: completedTopics,
      percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    }
  }

  // Mock Exams list
  const mockExams = [
    { id: "1", exam_name: "LGS - Lider Yayınları - 3", date: "10 Temmuz 2026", turkce_net: "18.5", mat_net: "15.0", fen_net: "17.5", inkilap_net: "9.0", din_net: "9.5", ing_net: "9.0", total_net: "78.5" },
    { id: "2", exam_name: "LGS - Karekök - 4", date: "05 Temmuz 2026", turkce_net: "19.0", mat_net: "16.0", fen_net: "18.0", inkilap_net: "9.5", din_net: "10.0", ing_net: "9.5", total_net: "82.0" },
    { id: "3", exam_name: "LGS - Özdebir - 1", date: "28 Haziran 2026", turkce_net: "15.0", mat_net: "11.5", fen_net: "14.0", inkilap_net: "8.0", din_net: "8.5", ing_net: "8.3", total_net: "65.3" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Academic Performance Header */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">Toplam Sınav</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">3 Deneme</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Son 30 gün içinde</p>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">Ortalama Net</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">75.2 Net</div>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" /> %12.4 Yükseliş Trendi
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">En Başarılı Ders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Türkçe</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Ortalama %93 Doğruluk</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">Eksik Konular</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">4 Konu</div>
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5 mt-1">
              <AlertCircle className="h-3.5 w-3.5" /> Tekrar gerektiren konular
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Topic Completion List (Konu Tamamlama Listesi) */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-600" />
                LGS Konu Tamamlama Listesi
              </CardTitle>
              <CardDescription>
                Müfredat konularını ve öğrencinin öğrenme/tekrar durumlarını takip edin.
              </CardDescription>
            </div>
            <Badge className="bg-violet-600 text-white hover:bg-violet-700 w-fit self-start">8. Sınıf Müfredatı</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matematik" className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <TabsTrigger value="matematik" className="text-xs py-2 font-bold">Matematik</TabsTrigger>
              <TabsTrigger value="fen" className="text-xs py-2 font-bold">Fen Bilimleri</TabsTrigger>
              <TabsTrigger value="turkce" className="text-xs py-2 font-bold">Türkçe</TabsTrigger>
              <TabsTrigger value="inkilap" className="text-xs py-2 font-bold">İnkılap Tarihi</TabsTrigger>
              <TabsTrigger value="din" className="text-xs py-2 font-bold">Din Kültürü</TabsTrigger>
              <TabsTrigger value="ingilizce" className="text-xs py-2 font-bold">İngilizce</TabsTrigger>
            </TabsList>

            {Object.keys(initialCurriculum).map((subjectKey) => {
              const stats = calculateSubjectStats(subjectKey)
              return (
                <TabsContent key={subjectKey} value={subjectKey} className="space-y-6 pt-6">
                  {/* Progress Indicator for current tab */}
                  <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200/60 rounded-xl dark:bg-zinc-900/40 dark:border-zinc-800">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase">
                        {subjectKey === 'fen' ? 'Fen Bilimleri' : subjectKey === 'turkce' ? 'Türkçe' : subjectKey === 'inkilap' ? 'T.C. İnkılap Tarihi' : subjectKey === 'din' ? 'Din Kültürü' : subjectKey} Başarı Durumu
                      </span>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {stats.completed} / {stats.total} alt konu başarıyla tamamlandı
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">{stats.percentage}%</span>
                      <div className="h-2 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-600" style={{ width: `${stats.percentage}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Syllabus / Content list mapping */}
                  <div className="space-y-4">
                    {initialCurriculum[subjectKey].map((chapter) => (
                      <Card key={chapter.id} className="border-zinc-200/80 shadow-none dark:border-zinc-800 overflow-hidden">
                        <div className="p-4 bg-zinc-50/50 border-b border-zinc-200/80 dark:bg-zinc-900/20 dark:border-zinc-800">
                          <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{chapter.name}</h4>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-white/40 dark:bg-zinc-950/20">
                              <TableHead className="w-[50%] font-bold text-zinc-800 dark:text-zinc-300">Alt Ünite / Konu Başlığı</TableHead>
                              <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">Öğrendim</TableHead>
                              <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">Tekrar Ettim</TableHead>
                              <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">Pekiştirdim (Soru Çözdüm)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {chapter.topics.map((topic) => {
                              const prog = progress[topic] || { ogrendim: false, tekrar: false, pekistirdim: false }
                              return (
                                <TableRow key={topic} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                                  <TableCell className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs py-3">{topic}</TableCell>
                                  <TableCell className="text-center py-3">
                                    <Checkbox
                                      checked={prog.ogrendim}
                                      onCheckedChange={(checked) => handleCheckboxChange(topic, "ogrendim", !!checked)}
                                      className="border-zinc-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <Checkbox
                                      checked={prog.tekrar}
                                      onCheckedChange={(checked) => handleCheckboxChange(topic, "tekrar", !!checked)}
                                      className="border-zinc-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <Checkbox
                                      checked={prog.pekistirdim}
                                      onCheckedChange={(checked) => handleCheckboxChange(topic, "pekistirdim", !!checked)}
                                      className="border-zinc-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* 3. Sınav Geçmişi (Exam History) */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Girilmiş Deneme Sınavları
            </CardTitle>
            <CardDescription>Öğrencinin her ders için deneme sonuçları ve netleri</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs border-zinc-200 dark:border-zinc-800">
            <Plus className="h-4 w-4" /> Yeni Sonuç Gir
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-zinc-800 dark:text-zinc-300">Deneme Sınav Adı</TableHead>
                <TableHead className="font-bold text-zinc-800 dark:text-zinc-300">Tarih</TableHead>
                <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">Türkçe</TableHead>
                <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">Matematik</TableHead>
                <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">Fen Bilimleri</TableHead>
                <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">İnkılap</TableHead>
                <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">Din K.</TableHead>
                <TableHead className="text-center font-bold text-zinc-800 dark:text-zinc-300">İngilizce</TableHead>
                <TableHead className="text-right font-bold text-zinc-800 dark:text-zinc-300">Toplam Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExams.map((exam) => (
                <TableRow key={exam.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                  <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 text-xs py-3.5">{exam.exam_name}</TableCell>
                  <TableCell className="text-xs text-zinc-500 font-semibold py-3.5">{exam.date}</TableCell>
                  <TableCell className="text-center font-semibold text-xs text-zinc-700 dark:text-zinc-300 py-3.5">{exam.turkce_net}</TableCell>
                  <TableCell className="text-center font-semibold text-xs text-zinc-700 dark:text-zinc-300 py-3.5">{exam.mat_net}</TableCell>
                  <TableCell className="text-center font-semibold text-xs text-zinc-700 dark:text-zinc-300 py-3.5">{exam.fen_net}</TableCell>
                  <TableCell className="text-center font-semibold text-xs text-zinc-700 dark:text-zinc-300 py-3.5">{exam.inkilap_net}</TableCell>
                  <TableCell className="text-center font-semibold text-xs text-zinc-700 dark:text-zinc-300 py-3.5">{exam.din_net}</TableCell>
                  <TableCell className="text-center font-semibold text-xs text-zinc-700 dark:text-zinc-300 py-3.5">{exam.ing_net}</TableCell>
                  <TableCell className="text-right py-3.5">
                    <Badge className="bg-violet-100 text-violet-700 font-bold text-xs dark:bg-violet-950/60 dark:text-violet-300">
                      {exam.total_net} Net
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}