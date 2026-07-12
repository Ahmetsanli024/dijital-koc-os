"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Loader2,
  Clock,
  CheckCircle,
  Flame,
  Plus
} from "lucide-react"

export default function LessonPlanPage() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>("1")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("weekly")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const mockStudents = [
    { id: "1", name: "Ali Yılmaz", class: "8-A", weakSubjects: ["Türev", "Optik", "EBOB-EKOK"] },
    { id: "2", name: "Zeynep Kaya", class: "8-A", weakSubjects: ["Kimya Dengesi", "Asal Sayılar"] },
    { id: "3", name: "Mehmet Demir", class: "8-B", weakSubjects: ["Cümle Türleri", "Mevsimler"] },
    { id: "4", name: "Selin Şahin", class: "12-A", weakSubjects: ["Logaritma", "Trigonometri"] },
  ]

  // The 10 templates literature (as planned in our plan!)
  const templates = [
    { id: "weekly", name: "Klasik Haftalık", desc: "Dengeli günlük konu dağılımı ve haftalık soru hedefi.", focus: "Tüm Dersler" },
    { id: "intensive", name: "Yoğunlaştırılmış Kamp", desc: "Yoğun soru çözümü ve konu tekrarlarıyla dolu kamp programı.", focus: "Sınav Tekrar" },
    { id: "cyclic", name: "Döngüsel Program", desc: "İki günde bir tüm dersleri sırayla döndüren esnek sistem.", focus: "Ders Devridaim" },
    { id: "block", name: "Konu Bazlı Blok", desc: "Günde tek bir derse derinlemesine odaklanan blok çalışma sistemi.", focus: "Derin Odaklanma" },
    { id: "pomodoro", name: "Pomodoro Entegre", desc: "25dk çalışma + 5dk mola odaklı pomodoro seans planı.", focus: "Zaman Yönetimi" },
    { id: "weakness", name: "Zayıf Alan Güçlendirme", desc: "Öğrencinin deneme eksiklerine öncelik veren akıllı dağıtım.", focus: "Eksik Kapatma" },
    { id: "exam_repeat", name: "Deneme + TÜRE", desc: "Deneme sınavı çözümü ve hemen ardına Tüm Ünite Reparasyonu.", focus: "Onarım" },
    { id: "weekend", name: "Hafta Sonu Ağırlıklı", desc: "Hafta içi hafif konu, hafta sonu yoğun deneme ve pekiştirme.", focus: "Denge" },
    { id: "summer", name: "Tatil/Yaz Kampı", desc: "Önceden hazırlık ve konu tamamlama ağırlıklı uzun vadeli plan.", focus: "Ön Hazırlık" },
    { id: "adaptive", name: "Bireysel Uyarlamalı", desc: "Yapay zekanın öğrenci hızına göre her gün esnettiği program.", focus: "Yapay Zeka" }
  ]

  // Interactive Generated Timetable state
  const [scheduleData, setScheduleData] = useState<any[]>([])

  const handleGenerateSmartSchedule = () => {
    setIsGenerating(true)
    setHasGenerated(false)

    setTimeout(() => {
      const student = mockStudents.find((s) => s.id === selectedStudent) || mockStudents[0]
      const weak = student.weakSubjects

      // Smartly distribute subjects & topics, prioritising weak areas based on the selected template!
      const generated = [
        {
          day: "Pazartesi",
          lessons: [
            { id: "l1", time: "09:00", subject: "Matematik", topic: weak[0] || "Çarpanlar ve Katlar", questions: 60, completed: false, isWeak: true },
            { id: "l2", time: "11:00", subject: "Türkçe", topic: "Sözcükte Anlam", questions: 40, completed: true, isWeak: false },
          ]
        },
        {
          day: "Salı",
          lessons: [
            { id: "l3", time: "09:00", subject: "Fen Bilimleri", topic: weak[1] || "Mevsimler ve İklim", questions: 50, completed: false, isWeak: true },
            { id: "l4", time: "11:00", subject: "T.C. İnkılap", topic: "Bir Kahraman Doğuyor", questions: 30, completed: false, isWeak: false },
          ]
        },
        {
          day: "Çarşamba",
          lessons: [
            { id: "l5", time: "09:00", subject: "Matematik", topic: weak[2] || "Üslü İfadeler", questions: 60, completed: false, isWeak: true },
            { id: "l6", time: "14:00", subject: "İngilizce", topic: "Friendship Vocabulary", questions: 40, completed: false, isWeak: false },
          ]
        },
        {
          day: "Perşembe",
          lessons: [
            { id: "l7", time: "09:00", subject: "Din Kültürü", topic: "Kader İnancı", questions: 35, completed: false, isWeak: false },
            { id: "l8", time: "11:00", subject: "Türkçe", topic: "Cümlede Anlam", questions: 40, completed: false, isWeak: false },
          ]
        },
        {
          day: "Cuma",
          lessons: [
            { id: "l9", time: "09:00", subject: "Fen Bilimleri", topic: "DNA ve Genetik Kod", questions: 50, completed: false, isWeak: false },
            { id: "l10", time: "14:00", subject: "Matematik", topic: "Kareköklü Sayılar", questions: 60, completed: false, isWeak: false },
          ]
        },
        {
          day: "Cumartesi",
          lessons: [
            { id: "l11", time: "10:00", subject: "Deneme Çözümü", topic: "Genel Deneme Sınavı", questions: 90, completed: false, isWeak: false },
            { id: "l12", time: "13:00", subject: "Hata Analizi", topic: "Yanlış Soru Analizi", questions: 30, completed: false, isWeak: false },
          ]
        },
        {
          day: "Pazar",
          lessons: [
            { id: "l13", time: "11:00", subject: "Rehberlik / PDR", topic: "Haftalık Durum & Kaygı Seansı", questions: 0, completed: false, isWeak: false },
          ]
        }
      ]

      setScheduleData(generated)
      setIsGenerating(false)
      setHasGenerated(true)
      toast.success("Akıllı Dağıtımlı Haftalık Ders Programı Hazırlandı!")
    }, 1500)
  }

  const handleToggleLessonComplete = (dayIndex: number, lessonId: string, checked: boolean) => {
    const updated = [...scheduleData]
    const lesson = updated[dayIndex].lessons.find((l: any) => l.id === lessonId)
    if (lesson) {
      lesson.completed = checked
    }
    setScheduleData(updated)
    toast.success(checked ? "Hedef ders tamamlandı olarak işaretlendi! 👏" : "Ders durumu güncellendi.")
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Akıllı Ders Programı</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Geniş literatüre sahip şablonları seçin ve öğrencinizin deneme eksiklerine göre konuları saniyeler içinde dağıtın.
        </p>
      </div>

      {/* 2. Controls Area */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardContent className="p-5 flex flex-col md:flex-row items-end gap-4">
          <div className="space-y-1.5 flex-1 w-full">
            <Label htmlFor="student-select">Öğrenci Seçin</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger id="student-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockStudents.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.class} Sınıfı)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 flex-1 w-full">
            <Label htmlFor="template-select">Ders Programı Şablon Literatürü</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    ✨ {t.name} ({t.focus})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateSmartSchedule}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-5 px-6 gap-2 w-full md:w-auto"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Hesaplanıyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Akıllı Dağıtımla Program Oluştur
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 3. Generated Timetable Table */}
      {hasGenerated ? (
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800 animate-in fade-in duration-500">
          <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-violet-600" />
                Haftalık Akıllı Dağıtım Tablosu
              </CardTitle>
              <CardDescription>
                Seçilen şablona göre hazırlanmış ve öğrencinin en zayıf konularına öncelik verilmiş ders tablosu.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80 flex items-center gap-1 py-1 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Aktif Program
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {scheduleData.map((dayData, dayIndex) => (
                <div key={dayData.day} className="flex flex-col md:flex-row md:items-start p-4 md:p-6 gap-4">
                  {/* Day Header */}
                  <div className="w-full md:w-32 md:shrink-0">
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50">{dayData.day}</h3>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Planlanan Dersler</span>
                  </div>

                  {/* Lessons Grid for that Day */}
                  <div className="flex-1 grid gap-4 sm:grid-cols-2">
                    {dayData.lessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "p-3.5 rounded-xl border flex items-start justify-between gap-3 bg-white dark:bg-zinc-950 transition-all duration-200",
                          lesson.completed ? "bg-zinc-50/50 border-zinc-200 dark:bg-zinc-900/10 opacity-70" :
                          lesson.isWeak ? "border-rose-200 bg-rose-50/10 hover:border-rose-300 dark:border-rose-950/40" : "border-zinc-200 hover:border-violet-200"
                        )}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded flex items-center gap-1 dark:bg-zinc-900">
                              <Clock className="h-3 w-3" /> {lesson.time}
                            </span>
                            {lesson.isWeak && (
                              <Badge variant="outline" className="text-[9px] font-bold text-rose-600 border-rose-200 bg-rose-50/30 py-0.5">
                                <Flame className="h-3 w-3 inline mr-0.5 fill-rose-100" />
                                Kritik Eksik
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-xs">
                            {lesson.subject}
                          </h4>
                          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                            Konu: <strong className="text-zinc-800 dark:text-zinc-200">{lesson.topic}</strong>
                          </p>
                          {lesson.questions > 0 && (
                            <Badge className="bg-violet-50 text-violet-700 hover:bg-violet-50 font-bold text-[9px]">
                              Target: {lesson.questions} Soru
                            </Badge>
                          )}
                        </div>

                        <div className="pt-0.5">
                          <Checkbox
                            checked={lesson.completed}
                            onCheckedChange={(checked) => handleToggleLessonComplete(dayIndex, lesson.id, !!checked)}
                            className="h-5 w-5 border-zinc-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-md"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-zinc-200 border-dashed rounded-2xl dark:bg-zinc-950 dark:border-zinc-800 h-80">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg">Aktif Ders Programı Bulunamadı</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            Lütfen yukarıdan öğrenciyi ve dilediğiniz akıllı dağıtım şablonunu seçip &quot;Program Oluştur&quot; butonuna basın.
          </p>
        </div>
      )}

      {/* 4. Literature / Templates overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-violet-600" />
          Ders Programı Tasarım Literatür Kitaplığı
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id} className="border-zinc-200/80 hover:border-violet-100 shadow-sm transition-all duration-200 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-50 text-[10px] font-bold">
                    {t.focus}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1.5">{t.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                  {t.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}