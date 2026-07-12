"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  FileText,
  BookOpen,
  Award
} from "lucide-react"

export default function RaporlarPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Raporlar</h1>
        <p className="text-sm text-zinc-500 mt-1">Öğrenci, sınıf ve genel performans raporları</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200/80 shadow-sm hover:shadow-md transition dark:border-zinc-800">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/40">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <CardTitle className="text-base mt-3">Öğrenci Performans Raporu</CardTitle>
            <CardDescription>Tek öğrenci için akademik + PDR özet raporu</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2 text-xs">
              <Download className="h-4 w-4" /> PDF Oluştur
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-sm hover:shadow-md transition dark:border-zinc-800">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-base mt-3">Sınıf Raporu</CardTitle>
            <CardDescription>Sınıf bazlı deneme sonuçları ve karşılaştırma</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2 text-xs">
              <Download className="h-4 w-4" /> PDF Oluştur
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-sm hover:shadow-md transition dark:border-zinc-800">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-base mt-3">Veli İlerleme Raporu</CardTitle>
            <CardDescription>Velilere gönderilmek üzere haftalık ilerleme raporu</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2 text-xs">
              <Download className="h-4 w-4" /> PDF Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Genel Performans Özeti */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-600" />
            Genel Koçluk Performansı
          </CardTitle>
          <CardDescription>Tüm öğrencilerin son 30 günlük özet istatistikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Aktif Öğrenci</p>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">24</p>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50/80 text-[10px]">+3 bu ay</Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Ortalama Net</p>
              <p className="text-2xl font-extrabold text-violet-600">74.2</p>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50/80 text-[10px] flex items-center gap-0.5 w-fit">
                <TrendingUp className="h-3 w-3" /> %8.4 artış
              </Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Toplam Deneme</p>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">87</p>
              <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 text-[10px]">Son 30 gün</Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Tamamlanan Ders</p>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">412</p>
              <Badge className="bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-50/80 text-[10px]">%76 başarı</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}