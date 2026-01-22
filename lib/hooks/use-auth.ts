"use client"

import { useAuthStore } from "@/lib/store/auth.store"

export function useAuth() {
  const { userAuth, user, loading } = useAuthStore()

  return {
    userAuth,
    user,
    isLoading: loading,
    isAuthenticated: !!userAuth,
  }
}
