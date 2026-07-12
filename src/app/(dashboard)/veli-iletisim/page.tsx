"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Phone,
  ArrowRight,
  Plus
} from "lucide-react"

export default function VeliIletisimPage() {
  const mockParents = [
    { id: "1", parentName: "Fatma Yılmaz", studentName: "Ali Yılmaz", phone: "5551234567", relation: "Anne", messageCount: 4, lastContact: "Bugün" },
    { id: "2", parentName: "Hasan Kaya", studentName: "Zeynep Kaya", phone: "5449876543", relation: "Baba", messageCount: 2, lastContact: "Dün" },
    { id: "3", parentName: "Ayşe Demir", studentName: "Mehmet Demir", phone: "5324567890", relation: "Anne", messageCount: 1, lastContact: "3 gün önce" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Veli İletişim Yönetimi</h1>
        <p className="text-sm text-zinc-500 mt-1">Tüm velilerin iletişim bilgileri, mesajlaşma geçmişi ve hızlı WhatsApp erişimi</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-zinc-500 uppercase uppercase tracking-wide">Toplam Veli</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{mockParents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-zinc-500 uppercase uppercase tracking-wide">Bu Hafta Gönderilen</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">7 Mesaj</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-zinc-500 uppercase uppercase tracking-wide">İletişim Oranı</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">%92</p>
          </CardContent>
        </Card>
      </div>

      {/* Veliler Tablosu */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-600" />
              Veli Listesi
            </CardTitle>
            <CardDescription>Tüm öğrencilerin velileri ve iletişim durumları</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs">
            <Plus className="h-4 w-4" /> Yeni Veli Ekle
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Veli</TableHead>
                <TableHead className="font-bold">Öğrenci</TableHead>
                <TableHead className="font-bold">Yakınlık</TableHead>
                <TableHead className="font-bold">Telefon</TableHead>
                <TableHead className="font-bold">Mesaj Sayısı</TableHead>
                <TableHead className="font-bold">Son İletişim</TableHead>
                <TableHead className="text-right font-bold">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockParents.map((p) => (
                <TableRow key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                  <TableCell className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{p.parentName}</TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{p.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold">{p.relation}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-zinc-400" />
                      {p.phone}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-violet-600">{p.messageCount}</TableCell>
                  <TableCell className="text-xs text-zinc-500">{p.lastContact}</TableCell>
                  <TableCell className="text-right">
                    <a
                      href={`https://wa.me/90${p.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      <Send className="h-3 w-3" />
                      WhatsApp
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}