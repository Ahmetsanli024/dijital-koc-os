"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  School,
  Users,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Plus
} from "lucide-react"

export default function SinifPage() {
  const classes = [
    { id: "1", name: "8-A Sınıfı", studentCount: 12, avgNet: 78.5, weakTopics: 4, lastExam: "TYT-3" },
    { id: "2", name: "8-B Sınıfı", studentCount: 8, avgNet: 71.2, weakTopics: 7, lastExam: "TYT-3" },
    { id: "3", name: "12-A Sınıfı", studentCount: 4, avgNet: 65.8, weakTopics: 12, lastExam: "AYT-2" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Sınıf Yönetimi</h1>
        <p className="text-sm text-zinc-500 mt-1">Sınıf bazlı öğrenci listesi, deneme sonuçları ve genel durum takibi</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40">
                <School className="h-4.5 w-4.5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Toplam Sınıf</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/40">
                <Users className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Toplam Öğrenci</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Genel Ortalama</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">73.2 Net</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sınıf Kartları */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Card key={c.id} className="border-zinc-200/80 shadow-sm hover:shadow-md hover:border-violet-100 transition dark:border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                </div>
                <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
                  {c.studentCount} Öğrenci
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Ortalama Net:</span>
                <span className="text-violet-600 font-bold">{c.avgNet} Net</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${c.avgNet}%` }}></div>
              </div>
              <div className="flex justify-between">
                <span>Zayıf Konu Sayısı:</span>
                <Badge variant="outline" className={`text-[10px] font-bold ${c.weakTopics > 5 ? "text-rose-600 border-rose-200 bg-rose-50" : "text-amber-600 border-amber-200 bg-amber-50"}`}>
                  {c.weakTopics} Konu
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Son Deneme:</span>
                <span className="text-zinc-500">{c.lastExam}</span>
              </div>
              <Button variant="outline" className="w-full mt-2 gap-1.5 text-xs">
                Sınıfı İncele <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}