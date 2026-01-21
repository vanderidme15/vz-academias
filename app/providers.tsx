"use client"

import type React from "react"
import { useEffect } from "react"
import { useAuthStore } from "@/lib/store/auth.store"
import { createClient } from "@/lib/supabase/client"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setUser(
          user
            ? {
              id: user.id,
              email: user.email || "",
            }
            : null,
        )
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [setUser, setLoading])

  return children
}
