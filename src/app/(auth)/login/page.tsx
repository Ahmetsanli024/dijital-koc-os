"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { GraduationCap, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Lütfen tüm alanları doldurun.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
        return
      }

      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...")
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      toast.error("Sistem hatası oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Eğitim Koçum
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Profesyonel eğitim koçluğu yönetim paneli
          </p>
        </div>

        <Card className="border-zinc-200/80 shadow-md dark:border-zinc-800">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-xl">Giriş Yap</CardTitle>
              <CardDescription>Hesabınıza erişmek için bilgilerinizi girin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hoca@egitimkocu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Şifre</Label>
                  <Link
                    href="#"
                    className="text-xs text-violet-600 hover:underline dark:text-violet-400"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
              <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Hesabınız yok mu?{" "}
                <Link href="/signup" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
                  Yeni hesap oluştur
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}