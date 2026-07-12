"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  User,
  GraduationCap,
  Phone,
  School,
  Mail,
  MessageSquare,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function StudentFolderLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const pathname = usePathname()
  const studentId = params.id

  const [student, setStudent] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mockStudents: Record<string, any> = {
    "1": { id: "1", first_name: "Ali", last_name: "Yılmaz", class_number: "8-A", school: "Atatürk Ortaokulu", phone: "0555 123 4567", email: "ali@okul.com" },
    "2": { id: "2", first_name: "Zeynep", last_name: "Kaya", class_number: "8-A", school: "Cumhuriyet Ortaokulu", phone: "0544 987 6543", email: "zeynep@okul.com" },
    "3": { id: "3", first_name: "Mehmet", last_name: "Demir", class_number: "8-B", school: "Fatih Ortaokulu", phone: "0532 456 7890", email: "mehmet@okul.com" },
    "4": { id: "4", first_name: "Selin", last_name: "Şahin", class_number: "12-A", school: "Atatürk Anadolu Lisesi", phone: "0505 111 2233", email: "selin@okul.com" },
  }

  useEffect(() => {
    async function fetchStudentDetails() {
      setIsLoading(true)
      try {
        // Check if mock
        if (mockStudents[studentId]) {
          setStudent(mockStudents[studentId])
          setIsLoading(false)
          return
        }

        // Fetch from Supabase
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId)
          .single()

        if (error) throw error
        setStudent(data)
      } catch (err: any) {
        console.error(err)
        toast.error("Öğrenci bilgileri yüklenemedi.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentDetails()
  }, [studentId])

  const tabs = [
    { label: "📋 Özet", segment: "ozet" },
    { label: "📚 Akademik", segment: "akademik" },
    { label: "🧠 PDR", segment: "pdr" },
    { label: "💬 Veli İletişimi", segment: "veli" },
    { label: "📌 Notlar", segment: "notlar" },
  ]

  const handleDelete = async () => {
    if (!confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) return

    try {
      if (mockStudents[studentId]) {
        toast.info("Mock öğrenci silinemez.")
        return
      }

      const { error } = await supabase
        .from("students")
        .update({ is_deleted: true })
        .eq("id", studentId)

      if (error) throw error
      toast.success("Öğrenci silindi.")
      router.push("/ogrenciler")
    } catch (err: any) {
      console.error(err)
      toast.error("İşlem başarısız.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <p className="text-zinc-500 font-medium">Öğrenci bulunamadı.</p>
        <Button onClick={() => router.push("/ogrenciler")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Öğrencilere Dön
        </Button>
      </div>
    )
  }

  const activeTab = pathname.split("/").pop()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back navigation & Quick controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/ogrenciler")}
          className="gap-1.5 hover:bg-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Öğrencilerime Dön
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-rose-600 hover:bg-rose-50 border-rose-200">
            <Trash2 className="h-4 w-4" />
            Öğrenciyi Sil
          </Button>
        </div>
      </div>

      {/* Student Folder Header Card */}
      <Card className="border-zinc-200/80 shadow-sm overflow-hidden dark:border-zinc-800">
        <CardContent className="p-6 md:p-8 bg-white dark:bg-zinc-950">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-bold text-2xl md:text-3xl">
                {student.first_name[0] + student.last_name[0]}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {student.first_name} {student.last_name}
                  </h1>
                  <Badge className="bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950 dark:text-violet-300 hover:bg-violet-50/80">
                    {student.class_number} Sınıfı
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5" />
                    <span>{student.school}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{student.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Whatsapp Link directly in layout */}
            {student.phone && (
              <a
                href={`https://wa.me/90${student.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <MessageSquare className="h-4 w-4" />
                Hızlı Veli WhatsApp Mesajı
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.segment
          return (
            <Link
              key={tab.segment}
              href={`/ogrenciler/${studentId}/${tab.segment}`}
              className={cn(
                "whitespace-nowrap border-b-2 px-6 py-3 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Inner page content */}
      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  )
}