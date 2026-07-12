"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as zod from "zod"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const studentFormSchema = zod.object({
  first_name: zod.string().min(2, "Ad en az 2 karakter olmalıdır"),
  last_name: zod.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  class_number: zod.string().min(1, "Sınıf/Şube gereklidir"),
  school: zod.string().min(2, "Okul adı en az 2 karakter olmalıdır"),
  phone: zod.string().optional(),
  email: zod.string().email("Geçersiz e-posta adresi").or(zod.literal("")).optional(),
  birth_date: zod.string().optional(),
})

type StudentFormValues = zod.infer<typeof studentFormSchema>

interface StudentFormProps {
  onSuccess: () => void
  initialData?: any
  studentId?: string
}

export function StudentForm({ onSuccess, initialData, studentId }: StudentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      class_number: "",
      school: "",
      phone: "",
      email: "",
      birth_date: "",
    },
  })

  const classNumberValue = watch("class_number")

  const onSubmit = async (values: StudentFormValues) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Oturum açmış kullanıcı bulunamadı.")
        return
      }

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        class_number: values.class_number,
        school: values.school,
        phone: values.phone || null,
        email: values.email || null,
        birth_date: values.birth_date || null,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (studentId) {
        // Update
        const { error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", studentId)

        if (error) throw error
        toast.success("Öğrenci başarıyla güncellendi.")
      } else {
        // Create
        const { error } = await supabase
          .from("students")
          .insert([payload])

        if (error) throw error
        toast.success("Öğrenci başarıyla eklendi.")
      }

      onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "İşlem yapılırken hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-[480px] border-zinc-200 dark:border-zinc-800">
      <DialogHeader>
        <DialogTitle>{studentId ? "Öğrenci Bilgilerini Düzenle" : "Yeni Öğrenci Ekle"}</DialogTitle>
        <DialogDescription>
          Öğrencinin kişisel ve akademik takip dosyası için temel bilgilerini girin.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Ad</Label>
            <Input
              id="first_name"
              placeholder="Ahmet"
              disabled={isLoading}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-xs font-semibold text-rose-500">{errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Soyad</Label>
            <Input
              id="last_name"
              placeholder="Yılmaz"
              disabled={isLoading}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-xs font-semibold text-rose-500">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class_number">Sınıf / Şube</Label>
            <Select
              disabled={isLoading}
              value={classNumberValue}
              onValueChange={(value) => value && setValue("class_number", value)}
            >
              <SelectTrigger id="class_number">
                <SelectValue placeholder="Sınıf Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8-A">8-A Sınıfı</SelectItem>
                <SelectItem value="8-B">8-B Sınıfı</SelectItem>
                <SelectItem value="12-A">12-A Sınıfı</SelectItem>
                <SelectItem value="12-B">12-B Sınıfı</SelectItem>
                <SelectItem value="Mezun">Mezun</SelectItem>
              </SelectContent>
            </Select>
            {errors.class_number && (
              <p className="text-xs font-semibold text-rose-500">{errors.class_number.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Doğum Tarihi</Label>
            <Input
              id="birth_date"
              type="date"
              disabled={isLoading}
              {...register("birth_date")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">Okul</Label>
          <Input
            id="school"
            placeholder="Atatürk Anadolu Lisesi"
            disabled={isLoading}
            {...register("school")}
          />
          {errors.school && (
            <p className="text-xs font-semibold text-rose-500">{errors.school.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              placeholder="0555 123 4567"
              disabled={isLoading}
              {...register("phone")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ogrenci@okul.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-rose-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}