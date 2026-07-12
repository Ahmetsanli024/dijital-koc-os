"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Brain,
  Sparkles,
  Plus,
  Smile,
  Meh,
  Frown,
  Activity,
  Heart,
  Loader2,
  Calendar,
  ShieldAlert
} from "lucide-react"

export default function StudentPdrPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const studentId = params.id

  const [notes, setNotes] = useState<any[]>([])
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [mood, setMood] = useState<string | null>("happy")
  const [attitude, setAttitude] = useState<string | null>("engaged")
  const [observation, setObservation] = useState("")
  const [friends, setFriends] = useState<string | null>("İyi")
  const [family, setFamily] = useState<string | null>("Destekleyici")
  const [school, setSchool] = useState<string | null>("Uyumlu")

  // Mock initial seans/guidance notes
  const initialNotes = [
    {
      id: "p1",
      date: "12 Temmuz 2026",
      mood: "neutral",
      attitude: "withdrawn",
      observation: "Öğrenci deneme sınavlarındaki dalgalanmalardan ötürü biraz karamsar. Çalıştığı halde netlerinin hemen yükselmemesi motivasyonunu düşürmüş. Kendisiyle hedefin bir maraton olduğu, küçük adımlarla başarılacağı konuşuldu.",
      social_status: { friends: "Orta", family: "Gergin", school: "Uyumlu" }
    },
    {
      id: "p2",
      date: "04 Temmuz 2026",
      mood: "happy",
      attitude: "engaged",
      observation: "Bugünkü seans oldukça verimli geçti. Haftalık ödevlerini tamamladığı için özgüveni yerine gelmiş. Arkadaşları ile kütüphanede çalışma kararı almışlar, sosyalleşme düzeyi iyi.",
      social_status: { friends: "İyi", family: "Destekleyici", school: "Uyumlu" }
    }
  ]

  useEffect(() => {
    setNotes(initialNotes)
  }, [studentId])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!observation) {
      toast.error("Lütfen gözlem notunuzu yazın.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const newNote = {
        id: Math.random().toString(),
        date: "Bugün",
        mood,
        attitude,
        observation,
        social_status: { friends, family, school }
      }

      setNotes([newNote, ...notes])
      setIsNoteOpen(false)
      setObservation("")
      setIsLoading(false)
      toast.success("Rehberlik/PDR gözlem notu kaydedildi.")
    }, 800)
  }

  const moodEmojis: Record<string, string> = {
    happy: "😊 Mutlu / Pozitif",
    neutral: "😐 Kararsız / Doğal",
    sad: "😢 Karamsar / Mutsuz",
    angry: "😡 Öfkeli / Gergin",
    anxious: "😰 Kaygılı / Telaşlı"
  }

  const attitudeLabels: Record<string, string> = {
    engaged: "İlgili / İstekli",
    distracted: "Dağınık / Odaksız",
    withdrawn: "Çekingen / İçe Dönük",
    unmotivated: "Motivasyonsuz",
    curious: "Meraklı / Soru Soran"
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 animate-in fade-in duration-300">
      {/* Seans Notları & Gelişim Zaman Çizelgesi (Left Column - Col 2) */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-violet-600" />
                Gözlem ve Görüşme Notları
              </CardTitle>
              <CardDescription>Gerçekleştirdiğiniz koçluk ve psikolojik danışman seans notları</CardDescription>
            </div>

            <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
              <DialogTrigger>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold text-xs">
                  <Plus className="h-4 w-4" /> Seans Notu Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle>Yeni Seans Notu Ekle</DialogTitle>
                  <DialogDescription>
                    Öğrenciyle gerçekleştirdiğiniz görüşmenin psikolojik ve sosyal durum gözlemlerini kaydedin.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddNote} className="space-y-4 py-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="mood">Genel Ruh Hali</Label>
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger id="mood">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">😊 Mutlu / Pozitif</SelectItem>
                          <SelectItem value="neutral">😐 Doğal / Kararsız</SelectItem>
                          <SelectItem value="sad">😢 Mutsuz / Karamsar</SelectItem>
                          <SelectItem value="angry">😡 Öfkeli / Gergin</SelectItem>
                          <SelectItem value="anxious">😰 Kaygılı / Telaşlı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="attitude">Derse/Sürece Tutumu</Label>
                      <Select value={attitude} onValueChange={setAttitude}>
                        <SelectTrigger id="attitude">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engaged">İlgili / İstekli</SelectItem>
                          <SelectItem value="distracted">Dağınık / Odaksız</SelectItem>
                          <SelectItem value="withdrawn">Çekingen / İçe Dönük</SelectItem>
                          <SelectItem value="unmotivated">Motivasyonsuz</SelectItem>
                          <SelectItem value="curious">Meraklı / Açık</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="observation">Gözlem ve Görüşme Detayları</Label>
                    <Textarea
                      id="observation"
                      rows={4}
                      placeholder="Görüşme sırasındaki davranışları, konuştuklarınız, tespit ettiğiniz durumlar..."
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wide">Sosyal Çevre Gözlemleri</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Arkadaş İlişkileri</Label>
                        <Select value={friends} onValueChange={setFriends}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="İyi">İyi</SelectItem>
                            <SelectItem value="Orta">Orta</SelectItem>
                            <SelectItem value="Zayıf">Zayıf</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Aile İlişkileri</Label>
                        <Select value={family} onValueChange={setFamily}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Destekleyici">Destekleyici</SelectItem>
                            <SelectItem value="İlgisiz">İlgisiz</SelectItem>
                            <SelectItem value="Gergin">Gergin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Okul Uyumu</Label>
                        <Select value={school} onValueChange={setSchool}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Uyumlu">Uyumlu</SelectItem>
                            <SelectItem value="Orta">Orta</SelectItem>
                            <SelectItem value="Uyumsuz">Uyumsuz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-3">
                    <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-6">
            {notes.map((note) => (
              <div key={note.id} className="relative border-l border-zinc-200 pl-6 pb-6 last:pb-0 dark:border-zinc-800">
                {/* Timeline node icon */}
                <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-zinc-50 border border-zinc-300 dark:bg-zinc-950 dark:ring-zinc-900 dark:border-zinc-700">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-500">{note.date}</span>
                    <div className="flex gap-1.5">
                      <Badge className="bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
                        {moodEmojis[note.mood] || note.mood}
                      </Badge>
                      <Badge variant="outline" className="text-zinc-600 border-zinc-200 dark:text-zinc-400 dark:border-zinc-800">
                        Tutum: {attitudeLabels[note.attitude] || note.attitude}
                      </Badge>
                    </div>
                  </div>

                  <Card className="border-zinc-100 shadow-none bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/10">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-line">
                        {note.observation}
                      </p>

                      {/* Social maps */}
                      <div className="grid grid-cols-3 gap-2 border-t border-zinc-100/80 pt-2.5 dark:border-zinc-800/60 text-[10px] font-bold text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Smile className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Arkadaş: <strong className="text-zinc-700 dark:text-zinc-300">{note.social_status.friends}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Aile: <strong className="text-zinc-700 dark:text-zinc-300">{note.social_status.family}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Okul: <strong className="text-zinc-700 dark:text-zinc-300">{note.social_status.school}</strong></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Yapay Zeka Uzman Görüşü Yönlendirme Paneli (Right Column) */}
      <div className="space-y-6">
        <Card className="border-violet-100 bg-gradient-to-br from-violet-50/50 to-white dark:border-violet-950/40 dark:from-zinc-950 dark:to-zinc-950/40 shadow-sm relative overflow-hidden">
          <div className="absolute right-[-15px] top-[-15px] opacity-10">
            <Brain className="h-32 w-32 text-violet-600" />
          </div>

          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-violet-800 dark:text-violet-400">
              <Sparkles className="h-4.5 w-4.5 fill-violet-200 text-violet-600" />
              AI Uzman Değerlendirmesi
            </CardTitle>
            <CardDescription className="text-xs">PDR notlarınızı değerlendirerek yönlendirme yapar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-violet-50 border border-violet-100 dark:bg-violet-950/20 dark:border-violet-900/40 rounded-lg text-xs leading-relaxed text-violet-950 font-medium dark:text-violet-300">
              <div className="flex items-center gap-1.5 mb-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                <ShieldAlert className="h-3.5 w-3.5" />
                DİKKAT EDİLMESİ GEREKEN BULGU
              </div>
              &ldquo;Öğrencide sınav performans dalgalanmaları nedeniyle hafif karamsarlık ve &apos;başaramayacağım&apos; inancı gözlemlenmiştir. Bu durum uzun vadede tükenmişlik yaratabilir.&rdquo;
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wide dark:text-zinc-300">PDR Yol Haritası Önerileri:</h4>
              <div className="space-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <p className="flex gap-2">
                  <span className="text-violet-600 font-bold">•</span>
                  <span><strong>Maraton Analojisi:</strong> Öğrenciye her sınavın bir son olmadığı, asıl hedefin eksikleri tespit etmek olduğu seanslarda somutlaştırılmalı.</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-violet-600 font-bold">•</span>
                  <span><strong>Kaygı Envanteri:</strong> Sınav kaygısını nicel ölçmek adına bir kaygı ölçeği uygulanabilir.</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-violet-600 font-bold">•</span>
                  <span><strong>Mikro Hedefler:</strong> Günlük çözülmesi gereken soru sayıları ufak ufak bölünmeli, tamamladıkça ödüllendirme mekanizması işletilmeli.</span>
                </p>
              </div>
            </div>

            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold text-xs mt-2">
              <Sparkles className="h-3.5 w-3.5" /> Analizi Yeniden Çalıştır
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}