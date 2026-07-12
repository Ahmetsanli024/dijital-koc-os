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
import { toast } from "sonner"
import {
  Calendar as CalendarIcon,
  Plus,
  Users,
  GraduationCap,
  Clock,
  CheckCircle2,
  CalendarDays
} from "lucide-react"

export default function CalendarPage() {
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [events, setEvents] = useState<any[]>([])

  // Mock events for the current week
  const mockEvents = [
    { id: "1", date: 13, day: "Pzt", time: "14:00", title: "Ali Y. - Kariyer Görüşmesi", type: "meeting", student: "Ali Yılmaz" },
    { id: "2", date: 13, day: "Pzt", time: "16:00", title: "Zeynep K. - Motivasyon Seansı", type: "meeting", student: "Zeynep Kaya" },
    { id: "3", date: 14, day: "Sal", time: "15:00", title: "TYT Deneme Sınavı - Grup", type: "exam", student: "9-A Sınıfı" },
    { id: "4", date: 15, day: "Çar", time: "17:00", title: "Veli Toplantısı - Ayşe Demir", type: "parent_meeting", student: "Mehmet Demir" },
    { id: "5", date: 16, day: "Per", time: "14:00", title: "Selin Ş. - Program Değerlendirme", type: "meeting", student: "Selin Şahin" },
    { id: "6", date: 18, day: "Cmt", time: "10:00", title: "9-A Sınıfı Genel Deneme", type: "exam", student: "9-A Sınıfı" },
  ]

  const eventTypeStyles: Record<string, { color: string; label: string; bg: string }> = {
    meeting: { color: "text-violet-700", label: "Görüşme", bg: "bg-violet-100 dark:bg-violet-950/40" },
    exam: { color: "text-rose-700", label: "Sınav", bg: "bg-rose-100 dark:bg-rose-950/40" },
    parent_meeting: { color: "text-amber-700", label: "Veli Toplantısı", bg: "bg-amber-100 dark:bg-amber-950/40" },
    reminder: { color: "text-blue-700", label: "Hatırlatıcı", bg: "bg-blue-100 dark:bg-blue-950/40" },
    other: { color: "text-zinc-700", label: "Diğer", bg: "bg-zinc-100 dark:bg-zinc-900" }
  }

  const weekDays = [
    { day: "Pzt", date: 13 },
    { day: "Sal", date: 14 },
    { day: "Çar", date: 15 },
    { day: "Per", date: 16 },
    { day: "Cum", date: 17 },
    { day: "Cmt", date: 18 },
    { day: "Paz", date: 19 },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Takvim & Ajanda</h1>
          <p className="text-sm text-zinc-500 mt-1">Öğrenci görüşmeleri, sınav planlamaları ve veli toplantıları tek ekranda</p>
        </div>
        <div className="flex gap-2">
          <Select value={view} onValueChange={(v) => setView(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Aylık</SelectItem>
              <SelectItem value="week">Haftalık</SelectItem>
              <SelectItem value="day">Günlük</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold text-xs">
            <Plus className="h-4 w-4" /> Yeni Etkinlik
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40">
                <Users className="h-4.5 w-4.5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Bu Hafta Görüşme</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40">
                <GraduationCap className="h-4.5 w-4.5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Planlı Sınav</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
                <CalendarDays className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Veli Toplantısı</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Tamamlanma</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">2/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Haftalık Görünüm */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-violet-600" />
                13 - 19 Temmuz 2026
              </CardTitle>
              <CardDescription>Bu haftanın etkinlikleri ve görüşme takvimi</CardDescription>
            </div>
            <div className="flex gap-1.5">
              {Object.entries(eventTypeStyles).map(([key, style]) => (
                <span key={key} className="inline-flex items-center gap-1 text-[10px] font-bold">
                  <span className={`h-2 w-2 rounded-full ${style.bg}`}></span>
                  <span className="text-zinc-600 dark:text-zinc-400">{style.label}</span>
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-7 border-t border-zinc-100 dark:border-zinc-800">
            {weekDays.map((day) => {
              const dayEvents = mockEvents.filter((e) => e.date === day.date)
              const isToday = day.date === 13
              return (
                <div key={day.day} className={`min-h-[180px] border-r border-zinc-100 dark:border-zinc-800 last:border-r-0 p-3 space-y-2.5 ${isToday ? "bg-violet-50/30 dark:bg-violet-950/10" : ""}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className={`text-xs font-bold ${isToday ? "text-violet-700 dark:text-violet-400" : "text-zinc-600 dark:text-zinc-400"}`}>{day.day}</span>
                    <span className={`text-sm font-extrabold ${isToday ? "text-violet-600 bg-violet-100 dark:bg-violet-950/40 rounded px-1.5" : "text-zinc-700 dark:text-zinc-300"}`}>{day.date}</span>
                  </div>
                  {dayEvents.length === 0 ? (
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-700 text-center pt-8 font-semibold">Etkinlik yok</p>
                  ) : (
                    dayEvents.map((event) => {
                      const style = eventTypeStyles[event.type]
                      return (
                        <div
                          key={event.id}
                          className={`p-2.5 rounded-lg ${style.bg} border border-transparent cursor-pointer hover:scale-[1.02] transition-all`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {event.time}
                            </span>
                            <Badge variant="outline" className={`text-[9px] font-bold py-0 ${style.color}`}>{style.label}</Badge>
                          </div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{event.title}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}