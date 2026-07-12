"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  MessageSquare,
  Sparkles,
  Phone,
  User,
  Send,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

export default function StudentParentPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const studentId = params.id

  const [parentName, setParentName] = useState("Fatma Yılmaz")
  const [parentPhone, setParentPhone] = useState("5551234567")
  const [relation, setRelation] = useState("Anne")

  const [selectedTopic, setSelectedTopic] = useState<string | null>("deneme")
  const [messageContent, setMessageContent] = useState("")
  const [isDrafting, setIsDrafting] = useState(false)
  const [messageLogs, setMessageLogs] = useState<any[]>([])

  // Dynamic state fallback logic
  const mockStudents: Record<string, any> = {
    "1": { first_name: "Ali", last_name: "Yılmaz" },
    "2": { first_name: "Zeynep", last_name: "Kaya" },
    "3": { first_name: "Mehmet", last_name: "Demir" },
    "4": { first_name: "Selin", last_name: "Şahin" },
  }

  const studentName = mockStudents[studentId]
    ? `${mockStudents[studentId].first_name} ${mockStudents[studentId].last_name}`
    : "Öğrenci"

  // Pre-compiled elegant Turkish messages based on selected topic
  const predefinedTemplates: Record<string, string> = {
    deneme: `Değerli Velimiz, ${studentName}'nin son girmiş olduğu deneme sınavı sonuçları sistemimize yüklenmiştir. Öğrencimizin konu eksiklerini tespit edip bireysel ders programına ekledik. Genel durum değerlendirmesi için müsait olduğunuzda görüşmek isterim. İyi günler dilerim.`,
    program: `Değerli Velimiz, ${studentName} için hazırladığımız bu haftaki akıllı ders çalışma programını tamamladık. Öğrencimizin günlük soru hedeflerine ve konu tekrarlarına evde de hassasiyet göstermesini rica ederiz. Birlikte başaracağız. Saygılarımla.`,
    absent: `Değerli Velimiz, ${studentName} bugün planladığımız koçluk seansına/grup etüt çalışmasına katılım sağlayamamıştır. Bilginiz dahilinde olup olmadığını teyit etmek için dönüş yapmanızı rica ederim. İyi çalışmalar.`,
    motivation: `Değerli Velimiz, ${studentName} ile bugün gerçekleştirdiğimiz seans son derece verimli geçti. Öğrencimizin motivasyonunu yüksek tutmak adına evde de destekleyici bir tutum sergilemeniz, çabasını takdir etmeniz çok kıymetlidir. İyi günler.`,
    appointment: `Değerli Velimiz, önümüzdeki hafta yapacağımız öğrenci durum değerlendirme toplantısı için randevu planlamak istiyorum. Sizin için en uygun gün ve saatleri bana iletebilirseniz takvimimize kaydedelim. İyi çalışmalar.`
  }

  useEffect(() => {
    if (selectedTopic) {
      setMessageContent(predefinedTemplates[selectedTopic])
    }
  }, [selectedTopic, studentId])

  // Communication logs
  const initialLogs = [
    { id: "l1", date: "Bugün", topic: "Deneme Sonuç Paylaşımı", status: "sent", content: predefinedTemplates.deneme },
    { id: "l2", date: "05 Temmuz 2026", topic: "Ders Programı Bilgilendirmesi", status: "sent", content: predefinedTemplates.program }
  ]

  useEffect(() => {
    setMessageLogs(initialLogs)
  }, [studentId])

  const handleDraftMessage = () => {
    setIsDrafting(true)
    setTimeout(() => {
      if (!selectedTopic) return
      // High-fidelity mock generator simulating OpenAI GPT drafting
      const promptDrafts: Record<string, string> = {
        deneme: `Sayın Velimiz, ${studentName} son denemesinde Türkçe ve Fen netlerini gözle görülür ölçüde artırdı. Tebrik ederiz! Matematik'teki ufak eksikleri için yeni bir çalışma programı kurduk. Destekleriniz için teşekkürler.`,
        program: `Değerli Velimiz, ${studentName} için LGS yolculuğunda bu hafta en kritik eksiklere odaklanan yoğunlaştırılmış bir program tasarladık. Program takibine evde de eşlik etmeniz süreci hızlandıracaktır.`,
        absent: `Değerli Velimiz, ${studentName} bugünkü görüşmemize katılamadı. Sürecin aksamaması adına durumdan haberdar olmak isterim. Müsait olduğunuzda görüşmek üzere.`,
        motivation: `Sayın Velimiz, ${studentName}'nin ders çalışma disiplini harika gidiyor. Gösterdiği çabayı evde de takdir ederek motivasyonunu tazeleyebilirsiniz. Emekleriniz için teşekkürler.`,
        appointment: `Sayın Velimiz, ${studentName}'nin akademik ve psikolojik gelişimini yüz yüze değerlendirmek üzere bu hafta içi bir veli görüşmesi planlayalım. Uygun zamanınızı bekliyorum.`
      }
      setMessageContent(promptDrafts[selectedTopic])
      setIsDrafting(false)
      toast.success("AI Mesajı başarıyla optimize edildi ve yeniden taslaklandı!")
    }, 1200)
  }

  const handleSendWhatsApp = () => {
    if (!parentPhone) {
      toast.error("Lütfen veli telefon numarasını girin.")
      return
    }

    // Generate wa.me link
    const cleanPhone = parentPhone.replace(/\D/g, "")
    // Turkish country code prefix if not present
    const phoneWithPrefix = cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`
    const waUrl = `https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(messageContent)}`

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank")

    // Log the message
    const newLog = {
      id: Math.random().toString(),
      date: "Şimdi",
      topic: selectedTopic === "deneme" ? "Deneme Sınavı" : selectedTopic === "program" ? "Ders Programı" : selectedTopic === "absent" ? "Devamsızlık" : selectedTopic === "motivation" ? "Motivasyon" : "Görüşme Randevusu",
      status: "sent",
      content: messageContent
    }

    setMessageLogs([newLog, ...messageLogs])
    toast.success("Mesaj WhatsApp'a aktarıldı ve gönderim geçmişine kaydedildi.")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 animate-in fade-in duration-300">
      {/* Veli Bilgileri & WhatsApp Mesaj Hazırlama Paneli (Col 2) */}
      <div className="md:col-span-2 space-y-6">
        {/* Veli Bilgi Formu Card */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-violet-600" />
              Veli İletişim Bilgileri
            </CardTitle>
            <CardDescription>Öğrencinin birincil veli irtibat detayları</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="parentName">Veli Ad Soyad</Label>
              <Input
                id="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="relation">Yakınlık Derecesi</Label>
              <Input
                id="relation"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parentPhone">Telefon (WhatsApp)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="parentPhone"
                  className="pl-9"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Mesaj Sihirbazı */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">💬 Tek Tuşla WhatsApp İletişim Sihirbazı</CardTitle>
                <CardDescription>Veliye göndermek istediğiniz konuyu seçin, mesajınız anında hazır olsun.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="topic">İletişim Kurulacak Konu</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger id="topic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deneme">📈 Deneme Sınav Sonucu ve Analiz Paylaşımı</SelectItem>
                  <SelectItem value="program">📚 Yeni Ders Programı Bilgilendirmesi</SelectItem>
                  <SelectItem value="absent">⚠️ Seansa/Ders Çalışmasına Katılmama Uyarısı</SelectItem>
                  <SelectItem value="motivation">😊 Motivasyon ve Süreç Destek Talebi</SelectItem>
                  <SelectItem value="appointment">📅 Değerlendirme Görüşmesi Randevusu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="messageContent">WhatsApp İleti Taslağı</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDraftMessage}
                  className="text-violet-600 hover:text-violet-700 h-7 text-xs font-bold gap-1 p-0 hover:bg-transparent"
                  disabled={isDrafting}
                >
                  {isDrafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Yapay Zeka ile Optimize Et
                </Button>
              </div>
              <Textarea
                id="messageContent"
                rows={6}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="font-medium text-xs leading-relaxed"
              />
            </div>

            <Button
              onClick={handleSendWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-5 gap-2"
            >
              <Send className="h-4 w-4" />
              WhatsApp Web Üzerinden Tek Tıkla Gönder
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* İletişim Geçmişi Logları (Right Column) */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">📅 İletişim Geçmişi</CardTitle>
          <CardDescription>Veliye gönderilen son mesaj logları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {messageLogs.map((log) => (
              <div key={log.id} className="pt-3 first:pt-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">{log.date}</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] py-0.5 px-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Gönderildi
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{log.topic}</h4>
                  <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3">
                    {log.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}