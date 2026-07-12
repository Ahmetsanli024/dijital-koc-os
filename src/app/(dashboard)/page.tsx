"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  User,
  Plus,
  StickyNote
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name || "Hocam")
      }
    }
    fetchUser()
  }, [])

  // Mock data for initial gorgeous view
  const mockMeetings = [
    { id: "1", time: "14:00", name: "Ali Y.", type: "Kariyer Görüşmesi" },
    { id: "2", time: "15:30", name: "Zeynep K.", type: "Motivasyon Görüşmesi" },
    { id: "3", time: "17:00", name: "Veli Toplantısı (Ayşe A.)", type: "Sonuç Değerlendirme" },
  ]

  const mockNotes = [
    { id: "1", color: "yellow", content: "Ali Y. sınav kaygısı arttı, veli ile görüşüldü.", date: "Bugün", tags: ["#kaygı", "#veli"] },
    { id: "2", color: "blue", content: "9-A sınıfı genel motivasyon düşük, toplu seans planlanacak.", date: "Dün", tags: ["#sınıf", "#motivasyon"] },
    { id: "3", color: "green", content: "Zeynep K. fen neti +4 arttı, tebrik edildi.", date: "9 Temmuz 2026", tags: ["#başarı", "#tebrik"] },
  ]

  const mockExams = [
    { id: "1", examName: "LGS - Lider Yayınları - 3", studentName: "Ali Y.", net: "78.5", change: "+2.1" },
    { id: "2", examName: "LGS - Karekök - 4", studentName: "Zeynep K.", net: "82.0", change: "+3.5" },
    { id: "3", examName: "LGS - Özdebir - 1", studentName: "Mehmet D.", net: "65.3", change: "-1.2" },
  ]

  const noteColorClasses = {
    yellow: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300",
    blue: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-300",
    green: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300",
    orange: "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-300",
    red: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300",
  }

  const dotColorClasses = {
    yellow: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    orange: "bg-orange-500",
    red: "bg-rose-500",
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Hoş Geldiniz, {userName}!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Bugün 13 Temmuz 2026, Pazartesi. İşte öğrencilerinize dair son durumlar:
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/ogrenciler")} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Yeni Öğrenci Ekle
          </Button>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bugünkü Görüşmeler */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              ⏰ BUGÜNKÜ GÖRÜŞMELER
            </CardTitle>
            <Calendar className="h-4.5 w-4.5 text-violet-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {mockMeetings.map((meeting) => (
                <div key={meeting.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded dark:bg-violet-950/40 dark:text-violet-400">
                    {meeting.time}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {meeting.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{meeting.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" onClick={() => router.push("/takvim")} className="p-0 text-xs text-violet-600 dark:text-violet-400 h-auto gap-1">
              Tüm takvimi gör <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Bu Hafta Tamamlanma */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              📊 BU HAFTA DERS PLANI
            </CardTitle>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">%72</span>
                <span className="text-zinc-500 dark:text-zinc-400">18 / 25 ders tamamlandı</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: "72%" }}></div>
              </div>
            </div>
            <div className="text-xs space-y-1 text-zinc-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>En yüksek başarı oranı:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Zeynep K. (%92)</span>
              </div>
              <div className="flex justify-between">
                <span>En düşük başarı oranı:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Ali Y. (%45)</span>
              </div>
            </div>
            <Button variant="link" onClick={() => router.push("/ders-programi")} className="p-0 text-xs text-violet-600 dark:text-violet-400 h-auto gap-1">
              Programları incele <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Kırmızı Konular */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              🔴 KIRMIZI KONU ALARMI
            </CardTitle>
            <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">5 Öğrenci</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Toplam 12 konuda %40 başarı oranı altında kalındı. Konu tekrarı veya yeni ödev atanmalı.
              </p>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex gap-1.5 items-center">
                <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200 bg-rose-50/30">Ali Y.</Badge>
                <span className="truncate">Türev, Optik, İntegral</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200 bg-rose-50/30">Zeynep K.</Badge>
                <span className="truncate">Kimya Dengesi</span>
              </div>
            </div>
            <Button variant="link" onClick={() => router.push("/denemeler")} className="p-0 text-xs text-violet-600 dark:text-violet-400 h-auto gap-1">
              Konu takibine git <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Underneath: Sticky notes and Recent Exams */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son Sticker Notlar */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">📌 Son Rehberlik Notları</CardTitle>
              <CardDescription>Öğrenci veya sınıflar hakkında sticker notlarınız</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/notlar")} className="text-xs gap-1">
              Tüm Notlar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {mockNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-3 rounded-lg border flex flex-col gap-1.5 transition duration-200",
                  noteColorClasses[note.color as keyof typeof noteColorClasses]
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", dotColorClasses[note.color as keyof typeof dotColorClasses])}></span>
                    <span className="text-xs font-semibold uppercase">{note.color === 'yellow' ? 'Önemli' : note.color === 'blue' ? 'Grup' : 'Başarı'}</span>
                  </div>
                  <span className="text-[10px] opacity-70">{note.date}</span>
                </div>
                <p className="text-xs leading-relaxed font-medium">{note.content}</p>
                <div className="flex gap-1.5 mt-0.5">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold opacity-80">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Son Yüklenen Denemeler */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">📈 Son Yüklenen Denemeler</CardTitle>
              <CardDescription>Yapay zeka ile analiz edilen son sınav sonuçları</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/denemeler")} className="text-xs">
              Tüm Sınavlar
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {mockExams.map((exam) => (
                <div key={exam.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {exam.examName}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <User className="h-3 w-3" />
                      <span>{exam.studentName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                        {exam.net} Net
                      </p>
                      <span className={cn(
                        "text-[10px] font-semibold",
                        exam.change.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {exam.change}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/ogrenciler/${exam.id}`)} className="text-xs px-2.5 h-7">
                      Detay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}