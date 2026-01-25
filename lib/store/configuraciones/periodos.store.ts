import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client";
import { Periodo } from "@/shared/types/supabase.types";

const supabase = createClient();

type PeriodosStore = {
  periodos: Periodo[]
  fetchPeriodos: () => Promise<void>
  fetchPeriodoById: (id: string) => Promise<Periodo | null>
  createPeriodo: (values: Periodo) => Promise<Periodo | null>
  updatePeriodo: (values: Periodo, id: string) => Promise<void>
  deletePeriodo: (id: string) => Promise<void>
}

export const usePeriodosStore = create<PeriodosStore>((set, get) => ({
  periodos: [],

  fetchPeriodos: async () => {
    try {
      const { data, error } = await supabase
        .from('periodos')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ periodos: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar los periodos');
    }
  },

  fetchPeriodoById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('periodos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      toast.error('No se pudo cargar el periodo');
      return null;
    }
  },

  createPeriodo: async (values) => {
    try {
      const { data, error } = await supabase
        .from('periodos')
        .insert(values)
        .select()
        .single();

      if (error) {
        toast.error('El periodo no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Periodo creado correctamente');
        set({ periodos: [data, ...get().periodos] });
        return data;
      }
    } catch (error) {
      toast.error('El periodo no se pudo crear');
      return null;
    }
  },

  updatePeriodo: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('periodos')
        .update(values)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          periodos: get().periodos.map(
            periodo => periodo.id === id ? data : periodo
          )
        });
        toast.success('Periodo actualizado correctamente');
      }
    } catch (error) {
      toast.error('El periodo no se pudo actualizar');
    }
  },

  deletePeriodo: async (id) => {
    try {
      const { data, error } = await supabase
        .from('periodos')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          periodos: get().periodos.filter(
            periodo => periodo.id !== id
          )
        });
        toast.success('Periodo eliminado correctamente');
      }
    } catch (error) {
      toast.error('El periodo no se pudo eliminar');
    }
  }
}))