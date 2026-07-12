"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { StudentForm } from "@/components/students/StudentForm"
import {
  Search,
  Filter,
  Plus,
  User,
  GraduationCap,
  Phone,
  School,
  FolderOpen,
  Edit2,
  Trash2,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("is_deleted", false)
        .order("first_name", { ascending: true })

      if (error) throw error

      setStudents(data || [])
    } catch (err: any) {
      console.error(err)
      toast.error("Öğrenci listesi alınırken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Beautiful mock data as fallback if there are no students yet
  const mockStudents = [
    { id: "1", first_name: "Ali", last_name: "Yılmaz", class_number: "8-A", school: "Atatürk Ortaokulu", phone: "0555 123 4567", email: "ali@okul.com" },
    { id: "2", first_name: "Zeynep", last_name: "Kaya", class_number: "8-A", school: "Cumhuriyet Ortaokulu", phone: "0544 987 6543", email: "zeynep@okul.com" },
    { id: "3", first_name: "Mehmet", last_name: "Demir", class_number: "8-B", school: "Fatih Ortaokulu", phone: "0532 456 7890", email: "mehmet@okul.com" },
    { id: "4", first_name: "Selin", last_name: "Şahin", class_number: "12-A", school: "Atatürk Anadolu Lisesi", phone: "0505 111 2233", email: "selin@okul.com" },
  ]

  const displayStudents = students.length > 0 ? students : mockStudents

  useEffect(() => {
    let result = displayStudents

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.first_name.toLowerCase().includes(query) ||
          s.last_name.toLowerCase().includes(query) ||
          s.school.toLowerCase().includes(query)
      )
    }

    if (selectedClass !== "all") {
      result = result.filter((s) => s.class_number === selectedClass)
    }

    setFilteredStudents(result)
  }, [search, selectedClass, students])

  const handleDelete = async (id: string) => {
    if (!confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) return

    try {
      // Check if it's mock
      const isMock = !students.some((s) => s.id === id)
      if (isMock) {
        toast.info("Mock öğrenci silinemez.")
        return
      }

      const { error } = await supabase
        .from("students")
        .update({ is_deleted: true })
        .eq("id", id)

      if (error) throw error
      toast.success("Öğrenci soft-delete yapıldı.")
      fetchStudents()
    } catch (err: any) {
      console.error(err)
      toast.error("Silme işlemi başarısız oldu.")
    }
  }

  const handleEditClick = (student: any) => {
    const isMock = !students.some((s) => s.id === student.id)
    if (isMock) {
      toast.info("Mock öğrenci düzenlenemez. Lütfen yeni bir öğrenci ekleyerek test edin.")
      return
    }
    setEditingStudent(student)
    setIsEditOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Öğrencilerim</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Koçluk yaptığınız öğrencilerin listesi ve genel durumları
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Yeni Öğrenci Ekle
            </Button>
          </DialogTrigger>
          <StudentForm onSuccess={() => {
            setIsCreateOpen(false)
            fetchStudents()
          }} />
        </Dialog>
      </div>

      {/* Filters & Search */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Öğrenci ismi veya okul ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-50 dark:bg-zinc-900"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedClass === "all" ? "default" : "outline"}
              onClick={() => setSelectedClass("all")}
              className={selectedClass === "all" ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}
              size="sm"
            >
              Tümü
            </Button>
            <Button
              variant={selectedClass === "8-A" ? "default" : "outline"}
              onClick={() => setSelectedClass("8-A")}
              className={selectedClass === "8-A" ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}
              size="sm"
            >
              8-A
            </Button>
            <Button
              variant={selectedClass === "8-B" ? "default" : "outline"}
              onClick={() => setSelectedClass("8-B")}
              className={selectedClass === "8-B" ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}
              size="sm"
            >
              8-B
            </Button>
            <Button
              variant={selectedClass === "12-A" ? "default" : "outline"}
              onClick={() => setSelectedClass("12-A")}
              className={selectedClass === "12-A" ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}
              size="sm"
            >
              12-A
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && students.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : (
        /* Students Grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border-zinc-200/80 hover:border-violet-200 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between dark:border-zinc-800 dark:hover:border-violet-950">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-bold text-lg">
                      {student.first_name[0] + student.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-base leading-snug">
                        {student.first_name} {student.last_name}
                      </h3>
                      <Badge className="bg-zinc-100 text-zinc-800 border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/80 mt-1">
                        {student.class_number} Sınıfı
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditClick(student)}
                      className="text-zinc-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(student.id)}
                      className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 pb-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <School className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="truncate">{student.school}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                <Button
                  onClick={() => router.push(`/ogrenciler/${student.id}`)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold text-xs"
                  size="sm"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Öğrenci Klasörünü Aç
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        {editingStudent && (
          <StudentForm
            studentId={editingStudent.id}
            initialData={editingStudent}
            onSuccess={() => {
              setIsEditOpen(false)
              setEditingStudent(null)
              fetchStudents()
            }}
          />
        )}
      </Dialog>
    </div>
  )
}