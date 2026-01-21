import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

let supabaseServer: ReturnType<typeof createServerClient> | null = null

export async function createServerSupabaseClient() {
  if (supabaseServer) return supabaseServer

  const cookieStore = await cookies()

  supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  return supabaseServer
}
