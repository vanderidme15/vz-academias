import { Usuario } from "@/shared/types/supabase.types"
import { toast } from "sonner"
import { create } from "zustand"
import { createClient } from "../supabase/client"

const supabase = createClient();

interface UserAuth {
  id: string
  email: string
}

interface AuthStore {
  userAuth: UserAuth | null
  user: Usuario | null // usuario de tabla custom
  loading: boolean
  setUserAuth: (userAuth: UserAuth | null) => void
  setUser: (user: Usuario | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  userAuth: null,
  user: null,
  loading: true,
  setUserAuth: (userAuth) => set({ userAuth }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ userAuth: null, user: null }),
}))

interface UsuarioStore {
  fetchUsuario: (id: string) => Promise<Usuario | null>
}

export const useUsuarioStore = create<UsuarioStore>((set) => ({
  fetchUsuario: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      toast.error('No se pudo cargar el usuario');
      return null;
    }
  }
}))
