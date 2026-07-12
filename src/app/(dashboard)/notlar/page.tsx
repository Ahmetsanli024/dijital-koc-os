"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
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
  Pin,
  Search
} from "lucide-react"

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([
    { id: "n1", color: "yellow", content: "Ali Y. sınav kaygısı arttı, veli ile görüşüldü.", tags: ["#kaygı", "#veli"], date: "Bugün", scope: "Ali Y." },
    { id: "n2", color: "blue", content: "9-A sınıfı genel motivasyon düşük. Toplu seans planlanacak.", tags: ["#sınıf", "#motivasyon"], date: "Dün", scope: "9-A Sınıfı" },
    { id: "n3", color: "green", content: "Zeynep K. fen neti +4 arttı. Tebrik edildi.", tags: ["#başarı", "#tebrik"], date: "9 Tem 2026", scope: "Zeynep K." },
    { id: "n4", color: "orange", content: "Matematik hocası için: Sınıfta kareköklü ifadeler konusunda sorun var.", tags: ["#matematik", "#ders"], date: "8 Tem 2026", scope: "9-A Sınıfı" },
    { id: "n5", color: "red", content: "Mehmet D. devamsızlık artışı. Aile durumu hakkında bilgi lazım.", tags: ["#devamsızlık", "#acil"], date: "7 Tem 2026", scope: "Mehmet D." },
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [colorFilter, setColorFilter] = useState<string>("all")

  // Form
  const [content, setContent] = useState("")
  const [color, setColor] = useState("yellow")
  const [tagInput, setTagInput] = useState("")
  const [scope, setScope] = useState("")

  const filteredNotes = notes.filter((n) => {
    if (search) {
      const q = search.toLowerCase()
      if (!n.content.toLowerCase().includes(q) && !n.tags.some((t: string) => t.toLowerCase().includes(q))) return false
    }
    if (colorFilter !== "all" && n.color !== colorFilter) return false
    return true
  })

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) {
      toast.error("Lütfen içerik girin.")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const parsedTags = tagInput.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`))
      const newNote = {
        id: Math.random().toString(),
        color,
        content,
        tags: parsedTags.length > 0 ? parsedTags : ["#not"],
        date: "Bugün",
        scope: scope || "Genel"
      }
      setNotes([newNote, ...notes])
      setIsOpen(false)
      setContent("")
      setTagInput("")
      setScope("")
      setColor("yellow")
      setIsLoading(false)
      toast.success("Sticker not eklendi.")
    }, 500)
  }

  const handleDelete = (id: string) => {
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
  const colorBtnClasses: Record<string, string> = {
    yellow: "bg-amber-300 border-amber-400",
    blue: "bg-blue-300 border-blue-400",
    green: "bg-emerald-300 border-emerald-400",
    orange: "bg-orange-300 border-orange-400",
    red: "bg-rose-300 border-rose-400"
  }
  const colorDotClasses: Record<string, string> = {
    yellow: "bg-amber-400",
    blue: "bg-blue-400",
    green: "bg-emerald-400",
    orange: "bg-orange-400",
    red: "bg-rose-400"
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Rehberlik Notları</h1>
          <p className="text-sm text-zinc-500 mt-1">Öğrenci, sınıf ve denemelere iliştirilmiş tüm hızlı sticker notlarınız</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold text-xs">
              <Plus className="h-4 w-4" /> Yeni Not Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] border-zinc-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle>Yeni Sticker Not Ekle</DialogTitle>
              <DialogDescription>Hızlı bir rehberlik notu oluşturun. Öğrenci, sınıf veya denemeye bağlayabilirsiniz.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddNote} className="space-y-4 py-3">
              <Textarea rows={4} placeholder="Not içeriği..." value={content} onChange={(e) => setContent(e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Bağla (Ali Y. / 9-A / TYT-3)" value={scope} onChange={(e) => setScope(e.target.value)} />
                <Input placeholder="etiket1, etiket2" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
              </div>
              <div className="flex gap-2.5">
                {Object.keys(noteColorClasses).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all shadow-sm",
                      colorBtnClasses[col],
                      color === col ? "scale-110 ring-2 ring-violet-600 ring-offset-2" : "opacity-80 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Not Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtreleme */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardContent className="p-4 flex gap-3 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Not içeriği veya etiket ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1.5">
            <Button
              variant={colorFilter === "all" ? "default" : "outline"}
              onClick={() => setColorFilter("all")}
              className={colorFilter === "all" ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}
              size="sm"
            >
              Tümü
            </Button>
            {Object.keys(noteColorClasses).map((col) => (
              <button
                key={col}
                onClick={() => setColorFilter(col)}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition shadow-sm",
                  colorBtnClasses[col],
                  colorFilter === col ? "scale-110 ring-2 ring-violet-600" : "opacity-70 hover:opacity-100"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Not Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group",
              noteColorClasses[note.color]
            )}
          >
            <Pin className="absolute top-3 right-3 h-4 w-4 rotate-45 opacity-60 group-hover:opacity-100 text-zinc-400" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", colorDotClasses[note.color])} />
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wide py-0.5">
                  {note.scope}
                </Badge>
              </div>
              <p className="text-xs leading-relaxed font-semibold pr-4">{note.content}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900/10 dark:border-zinc-100/10">
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className={cn("text-[9px] font-bold uppercase py-0.5 px-2 rounded-full", tagBadgeClasses[note.color])}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-60">{note.date}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-500 rounded-full"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}