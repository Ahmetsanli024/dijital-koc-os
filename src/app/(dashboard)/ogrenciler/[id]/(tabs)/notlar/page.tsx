"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { cn } from "@/lib/utils"
import {
  Plus,
  StickyNote,
  Trash2,
  Tag,
  Loader2,
  Pin
} from "lucide-react"

export default function StudentNotesPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const studentId = params.id

  const [notes, setNotes] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [content, setContent] = useState("")
  const [color, setColor] = useState("yellow")
  const [tagInput, setTagInput] = useState("")

  const initialNotes = [
    { id: "n1", color: "yellow", content: "Son yapılan bireysel görüşmede LGS sınav süresi yetiştirememe kaygısı olduğunu iletti. Takvime süre yönetimli deneme sınavı eklenecek.", tags: ["#kaygı", "#süre"], date: "Bugün" },
    { id: "n2", color: "blue", content: "Matematik hocasından alınan bilgiye göre dersteki odaklanma süresi oldukça yüksek. Ancak ev ödevlerinde boş bıraktığı soruların çözüm videolarını izlemiyor.", tags: ["#matematik", "#ödev"], date: "Dün" },
    { id: "n3", color: "green", content: "Veli ile yapılan görüşmede evde sessiz çalışma ortamı sağlandığı ve ailenin beklentiyi makul düzeyde tuttuğu teyit edildi.", tags: ["#veli", "#ev-ortamı"], date: "09 Temmuz 2026" }
  ]

  useEffect(() => {
    setNotes(initialNotes)
  }, [studentId])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) {
      toast.error("Lütfen not içeriğini yazın.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const parsedTags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`))

      const newNote = {
        id: Math.random().toString(),
        color,
        content,
        tags: parsedTags.length > 0 ? parsedTags : ["#not"],
        date: "Bugün"
      }

      setNotes([newNote, ...notes])
      setIsOpen(false)
      setContent("")
      setTagInput("")
      setColor("yellow")
      setIsLoading(false)
      toast.success("Rehber öğretmen sticker notu eklendi.")
    }, 800)
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    toast.success("Not silindi.")
  }

  const noteColorClasses: Record<string, string> = {
    yellow: "bg-amber-100/70 border-amber-300 text-amber-900 shadow-amber-100/40 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300",
    blue: "bg-blue-100/70 border-blue-300 text-blue-900 shadow-blue-100/40 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-300",
    green: "bg-emerald-100/70 border-emerald-300 text-emerald-900 shadow-emerald-100/40 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300",
    orange: "bg-orange-100/70 border-orange-300 text-orange-900 shadow-orange-100/40 dark:bg-orange-950/30 dark:border-orange-900/40 dark:text-orange-300",
    red: "bg-rose-100/70 border-rose-300 text-rose-900 shadow-rose-100/40 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300"
  }

  const tagBadgeClasses: Record<string, string> = {
    yellow: "bg-amber-200/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    blue: "bg-blue-200/50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-emerald-200/50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    orange: "bg-orange-200/50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    red: "bg-rose-200/50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Tab Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <StickyNote className="h-5.5 w-5.5 text-violet-600" />
            Öğrenci Sticker Rehberlik Notları
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Öğrenciye iliştirilmiş hızlı rehberlik, ders ve gözlem notları</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold text-xs">
              <Plus className="h-4 w-4" /> Yeni Not Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-zinc-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle>Yeni Sticker Not Ekle</DialogTitle>
              <DialogDescription>Öğrenci klasörüne sonradan incelemek üzere hızlı bir sticker not iliştirin.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddNote} className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="content">Not İçeriği</Label>
                <Textarea
                  id="content"
                  rows={4}
                  placeholder="Rehberlik gözleminiz, ders veya deneme sınavı notlarınız..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tagInput">Etiketler (Virgülle ayırın)</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="tagInput"
                    placeholder="kaygı, matematik, ödev"
                    className="pl-9"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sticker Rengi</Label>
                <div className="flex gap-2.5 pt-1">
                  {Object.keys(noteColorClasses).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all duration-200 shadow-sm",
                        col === "yellow" ? "bg-amber-300 border-amber-400" :
                        col === "blue" ? "bg-blue-300 border-blue-400" :
                        col === "green" ? "bg-emerald-300 border-emerald-400" :
                        col === "orange" ? "bg-orange-300 border-orange-400" : "bg-rose-300 border-rose-400",
                        color === col ? "scale-110 ring-2 ring-violet-600 ring-offset-2" : "opacity-80 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Not Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid of Sticky Notes */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group",
              noteColorClasses[note.color]
            )}
          >
            {/* Pin graphic top-right */}
            <div className="absolute top-3 right-3 text-zinc-400 opacity-60 group-hover:opacity-100 transition-opacity">
              <Pin className="h-4 w-4 rotate-45" />
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold tracking-wide opacity-60">{note.date}</span>
              <p className="text-xs leading-relaxed font-semibold pr-2">{note.content}</p>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900/10 dark:border-zinc-100/10 pt-3 mt-1">
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn("text-[9px] font-bold uppercase py-0.5 px-2 rounded-full", tagBadgeClasses[note.color])}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDeleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-500 rounded-full transition-all duration-200 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}