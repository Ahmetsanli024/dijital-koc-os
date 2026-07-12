"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Search, Bell, User, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser({
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0]
          })
        }
      } catch (err: unknown) {
        console.error("Error fetching user in navbar:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error("Hata: " + error.message)
        return
      }
      toast.success("Çıkış yapıldı.")
      router.push("/login")
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      toast.error("Çıkış hatası")
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "H"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-1 max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <Input
            type="search"
            placeholder="Öğrenci, veli, not veya sınıf ara..."
            className="w-full bg-zinc-50 pl-10 border-zinc-200 focus:bg-white dark:bg-zinc-900 dark:border-zinc-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-950"></span>
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                  <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold text-sm dark:bg-violet-950 dark:text-violet-300">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {user?.full_name || "Ahmet Hoca"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Eğitim Koçu</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 border-zinc-200 dark:border-zinc-800">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
              <DropdownMenuItem onClick={() => router.push("/ayarlar")} className="cursor-pointer gap-2">
                <User className="h-4 w-4" />
                <span>Profil Ayarları</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-rose-600 focus:text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/20 gap-2">
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}