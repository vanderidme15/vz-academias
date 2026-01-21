"use client"

import { useAuthStore } from "@/lib/store/auth.store"

export function useAuth() {
  const { user, loading } = useAuthStore()

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
  }
}
