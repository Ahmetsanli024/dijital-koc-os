"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight
} from "lucide-react"

export default function StudentSummaryPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const studentId = params.id

  // Dynamic state fallback logic
  const mockStudents: Record<string, any> = {
    "1": { first_name: "Ali", last_name: "Yılmaz", class_number: "8-A", school: "Atatürk Ortaokulu" },
    "2": { first_name: "Zeynep", last_name: "Kaya", class_number: "8-A", school: "Cumhuriyet Ortaokulu" },
    "3": { first_name: "Mehmet", last_name: "Demir", class_number: "8-B", school: "Fatih Ortaokulu" },
    "4": { first_name: "Selin", last_name: "Şahin", class_number: "12-A", school: "Atatürk Anadolu Lisesi" },
  }

  const studentName = mockStudents[studentId]
    ? `${mockStudents[studentId].first_name} ${mockStudents[studentId].last_name}`
    : "Öğrenci"

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* AI Coaching & PDR Assessment summary card */}
      <Card className="md:col-span-2 border-violet-100 bg-violet-50/20 dark:border-violet-950/40 dark:bg-violet-950/5 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-violet-800 dark:text-violet-300">
              <Sparkles className="h-5 w-5 fill-violet-200 text-violet-600 dark:text-violet-400" />
              Yapay Zeka Koçluk & PDR Değerlendirmesi
            </CardTitle>
            <CardDescription className="text-violet-600/80 dark:text-violet-400/80">
              {studentName} için seans notları ve gelişim analizi
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm font-medium text-violet-950/80 dark:text-violet-300">
          <p className="leading-relaxed">
            &ldquo;Son 3 seanstaki gözlem notlarına göre öğrencimizde ders çalışma isteğinde hafif bir yükseliş gözlenmektedir. Özellikle Fen Bilimleri ve Türkçe netlerindeki artış motivasyonunu olumlu etkilemiş. Sınav kaygısı düzeyi hala orta seviyede seyretmektedir, bu hafta yapılacak görüşmede nefes egzersizleri ve sınav anı stratejileri üzerinde durulması önerilir.&rdquo;
          </p>

          <div className="pt-4 border-t border-violet-100 dark:border-violet-900/40 space-y-3">
            <h4 className="font-bold text-xs text-violet-800 uppercase tracking-wider dark:text-violet-300">Uzman Koçluk Önerileri:</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-violet-950/80 dark:text-violet-400">
              <li>Haftalık ders programında Matematik ağırlığı %20 oranında hafifletilip, başarılı olduğu sözel derslerle dengelenmeli (Özgüven tazelemek adına).</li>
              <li>Sınav kaygısını yönetebilmesi adına veli ile görüşülüp evdeki beklenti baskısı azaltılmalı.</li>
              <li>Akıllı program dağıtımında yeşil etiketli (iyi olduğu) konulardan sonra kırmızı etiketli (zorlandığı) 1 konunun blok çalışılması sağlanmalı.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Mini Stats Dashboard */}
      <div className="space-y-6">
        {/* Akademik Gelişim */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
              Akademik Özet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">82.5 Net</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Son Deneme Sınavı</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +3.2 Net Artış
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <span>Konu Tamamlama Oranı</span>
                <span>12 / 16 Konu</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full bg-violet-600" style={{ width: "75%" }}></div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/ogrenciler/${studentId}/akademik`)}
              className="w-full text-xs gap-1.5 h-8 font-semibold"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Konu Takibini İncele
            </Button>
          </CardContent>
        </Card>

        {/* Son Görüşme Notu */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
              Son Gözlem Notu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50/30">😊 Pozitif Ruh Hali</Badge>
              <span className="text-[10px] text-zinc-400 font-semibold">Dün</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
              &ldquo;Ders programındaki hedeflerini %80 oranında tamamlamış olmanın mutluluğu var. Matematik dersinde çözdüğü soru sayısı artmış.&rdquo;
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/ogrenciler/${studentId}/pdr`)}
              className="w-full text-xs gap-1.5 h-8 font-semibold"
            >
              <Award className="h-3.5 w-3.5" />
              Tüm Seans Notları
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}