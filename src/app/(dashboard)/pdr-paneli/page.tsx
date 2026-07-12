"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Calendar,
  Smile,
  Meh,
  Frown,
  ArrowRight
} from "lucide-react"

export default function PdrPanelPage() {
  const urgentStudents = [
    { id: "1", name: "Mehmet Demir", class: "8-B", issue: "Motivasyon kaybı, çalışma isteğinde düşüş", lastSession: "Dün", severity: "urgent" },
    { id: "2", name: "Ali Yılmaz", class: "8-A", issue: "Sınav kaygısı, aile içi gerginlik tespit edildi", lastSession: "2 gün önce", severity: "attention" }
  ]

  const recentEvaluations = [
    { id: "1", student: "Zeynep Kaya", date: "Bugün", severity: "normal", evaluation: "Pozitif gelişim gözlenmektedir. Ders çalışma disiplini artmış." },
    { id: "2", student: "Mehmet Demir", date: "Dün", severity: "urgent", evaluation: "Motivasyon kaybı gözlemlendi. Aile görüşmesi öneriliyor." },
    { id: "3", student: "Ali Yılmaz", date: "2 gün önce", severity: "attention", evaluation: "Sınav kaygısı orta seviyede. Nefes teknikleri öğretildi." },
    { id: "4", student: "Selin Şahin", date: "05 Temmuz", severity: "normal", evaluation: "Hedef ölçümü yapıldı. YKS süreci planlandı." }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">PDR Paneli</h1>
        <p className="text-sm text-zinc-500 mt-1">Tüm öğrencilerin psikolojik durum özetleri, AI değerlendirmeleri ve acil durum uyaruları</p>
      </div>

      {/* Acil Durum Kartı */}
      {urgentStudents.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-rose-800 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5" />
              Acil Takip Edilmesi Gereken Durumlar ({urgentStudents.length})
            </CardTitle>
            <CardDescription>Aşağıdaki öğrencilerde son 7 gün içinde dikkat veya acil seviyesinde PDR bulguları tespit edildi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${s.severity === "urgent" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{s.name} <span className="text-xs text-zinc-400 font-normal">({s.class})</span></p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.issue}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Son seans: {s.lastSession}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] font-bold ${s.severity === "urgent" ? "text-rose-600 border-rose-200 bg-rose-50" : "text-amber-600 border-amber-200 bg-amber-50"}`}>
                  {s.severity === "urgent" ? "🔴 ACİL" : "🟡 DİKKAT"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent AI Evaluations */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Son AI PDR Değerlendirmeleri
          </CardTitle>
          <CardDescription>Yapay zekanın öğrencilerin PDR notlarına göre yaptığı uzman değerlendirmeler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEvaluations.map((ev) => {
            const severityStyles: Record<string, string> = {
              normal: "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/10",
              attention: "border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10",
              urgent: "border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/10"
            }
            const severityLabels: Record<string, string> = {
              normal: "🟢 Normal",
              attention: "🟡 Dikkat",
              urgent: "🔴 Acil"
            }
            return (
              <div key={ev.id} className={`p-4 rounded-lg border ${severityStyles[ev.severity]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{ev.student}</p>
                    <p className="text-[10px] text-zinc-400 font-semibold">{ev.date}</p>
                  </div>
                  <Badge className="text-[10px] font-bold">{severityLabels[ev.severity]}</Badge>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{ev.evaluation}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}