"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Calendar as CalendarIcon,
  MessageSquare,
  Brain,
  StickyNote,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: LayoutDashboard, label: "Panel", href: "/" },
    { icon: Users, label: "Öğrenciler", href: "/ogrenciler" },
    { icon: BookOpen, label: "Ders Programı", href: "/ders-programi" },
    { icon: FileText, label: "Denemeler", href: "/denemeler" },
    { icon: CalendarIcon, label: "Takvim & Ajanda", href: "/takvim" },
    { icon: MessageSquare, label: "Veli İletişim", href: "/veli-iletisim" },
    { icon: Brain, label: "PDR Paneli", href: "/pdr-paneli" },
    { icon: StickyNote, label: "Rehberlik Notları", href: "/notlar" },
    { icon: BarChart3, label: "Raporlar", href: "/raporlar" },
    { icon: Settings, label: "Ayarlar", href: "/ayarlar" },
  ]

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error("Çıkış yapılırken bir hata oluştu: " + error.message)
        return
      }
      toast.success("Çıkış yapıldı.")
      router.push("/login")
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      toast.error("Çıkış yapılırken hata oluştu.")
    }
  }

  return (
    <div className={cn("flex h-full w-64 flex-col border-r border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50", className)} {...props}>
      <div className="flex h-16 items-center px-6 border-b border-zinc-100 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-zinc-950 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span>Eğitim Koçum</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 group",
                  isActive
                    ? "bg-violet-50 text-violet-600 hover:bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400"
                    : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 px-3.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>Çıkış Yap</span>
        </Button>
      </div>
    </div>
  )
}