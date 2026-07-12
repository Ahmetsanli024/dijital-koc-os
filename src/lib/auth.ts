import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    }
  )
  const { data, error } = await supabase.auth.getSession()
  if (error) console.error("Session error:", error.message)
  return data.session
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}