"use client"

import type React from "react"
import { useEffect } from "react"
import { useAuthStore, useUsuarioStore } from "@/lib/store/auth.store"
import { createClient } from "@/lib/supabase/client"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUserAuth, setLoading, setUser } = useAuthStore()
  const { fetchUsuario } = useUsuarioStore()

  useEffect(() => {
    const supabase = createClient()

    // Función auxiliar para normalizar el usuario
    const normalizeUserAuth = (user: User | null) => {
      return user ? { id: user.id, email: user.email || "" } : null
    }

    const getUsuario = async (id?: string) => {
      if (!id) return
      const usuario = await fetchUsuario(id)
      setUser(usuario);
    }

    // Inicializar sesión actual
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUserAuth(normalizeUserAuth(user));
        getUsuario(user?.id)
      } catch (error) {
        setUserAuth(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setUserAuth(normalizeUserAuth(session?.user ?? null))
        getUsuario(session?.user?.id)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUserAuth, setLoading])

  return children
}