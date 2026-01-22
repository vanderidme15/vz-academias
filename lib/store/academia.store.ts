import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../supabase/client"
import { Academia } from "@/shared/types/supabase.types";

const supabase = createClient();

type AcademiaStore = {
  academia: Academia | null
  fetchAcademiaById: (id?: string) => Promise<Academia | null>
  updateAcademia: (values: Academia, id: string) => Promise<void>
}

export const useAcademiaStore = create<AcademiaStore>((set, get) => ({
  academia: null,

  fetchAcademiaById: async (id?: string) => {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('academias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        set({
          academia: data
        });
      }
      return data;
    } catch (error) {
      toast.error('No se pudo cargar el horario');
      return null;
    }
  },

  updateAcademia: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('academias')
        .update(values)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          academia: data
        });
        toast.success('Academia actualizada correctamente');
      }
    } catch (error) {
      toast.error('La academia no se pudo actualizar');
    }
  }
}))