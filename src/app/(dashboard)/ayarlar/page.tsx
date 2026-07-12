"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Settings,
  User,
  Bell,
  Key,
  Sparkles,
  Check,
  Loader2
} from "lucide-react"

export default function AyarlarPage() {
  const [fullName, setFullName] = useState("Ahmet Hoca")
  const [email, setEmail] = useState("hoca@egitimkocu.com")
  const [isLoading, setIsLoading] = useState(false)
  const [openaiKey, setOpenaiKey] = useState("")
  const [notifications, setNotifications] = useState({
    examAnalyzed: true,
    pdrUrgent: true,
    parentReply: false,
    dailyReport: true,
  })

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Profil bilgileriniz kaydedildi.")
    }, 600)
  }

  const handleSaveAi = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("OpenAI API anahtarı ayarlandı. AI özellikleri aktif.")
    }, 600)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Ayarlar</h1>
        <p className="text-sm text-zinc-500 mt-1">Profil, bildirim ve AI entegrasyon ayarlarınız</p>
      </div>

      {/* Profil Ayarları */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-violet-600" />
            Profil Bilgileri
          </CardTitle>
          <CardDescription>Ad, e-posta ve görünen bilgilerinizi yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Entegrasyonu */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Yapay Zeka (OpenAI) Ayarları
          </CardTitle>
          <CardDescription>Deneme PDF analizi, PDR değerlendirme ve mesaj taslakları için OpenAI API anahtarı</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAi} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="openaiKey">OpenAI API Anahtarı</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="openaiKey"
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold">
                API anahtarınız güvenli şekilde sunucuda saklanır. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-violet-600 underline">OpenAI'den alın</a>.
              </p>
            </div>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              AI Anahtarını Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bildirim Tercihleri */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-violet-600" />
            Bildirim Tercihleri
          </CardTitle>
          <CardDescription>Hangi durumlarda bildirim alacağınızı seçin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "examAnalyzed", label: "Deneme analizi tamamlandığında", desc: "AI PDF analiz işleminde sonuç hazır" },
            { key: "pdrUrgent", label: "PDR acil durum bulgularında", desc: "AI değerlendirmesi 'acil' seviyesine çıktığında" },
            { key: "parentReply", label: "Veli yanıtlarında", desc: "Veli mesajınıza yanıt geldiğinde" },
            { key: "dailyReport", label: "Günlük rapor", desc: "Her akşam günün özetini alın" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{item.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}