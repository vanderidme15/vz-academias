import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../supabase/client"
import { Horario } from "@/shared/types/supabase.types";

const supabase = createClient();

type HorariosStore = {
  horarios: Horario[]
  fetchHorarios: () => Promise<void>
  fetchHorarioById: (id: string) => Promise<Horario | null>
  createHorario: (values: Horario) => Promise<Horario | null>
  updateHorario: (values: Horario, id: string) => Promise<void>
  deleteHorario: (id: string) => Promise<void>
}

export const useHorariosStore = create<HorariosStore>((set, get) => ({
  horarios: [],

  fetchHorarios: async () => {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ horarios: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar los horarios');
    }
  },

  fetchHorarioById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      toast.error('No se pudo cargar el horario');
      return null;
    }
  },

  createHorario: async (values) => {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .insert(values)
        .select()
        .single();

      if (error) {
        toast.error('El horario no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Horario creado correctamente');
        set({ horarios: [data, ...get().horarios] });
        return data;
      }
    } catch (error) {
      toast.error('El horario no se pudo crear');
      return null;
    }
  },

  updateHorario: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .update(values)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          horarios: get().horarios.map(
            horario => horario.id === id ? data : horario
          )
        });
        toast.success('Horario actualizado correctamente');
      }
    } catch (error) {
      toast.error('El horario no se pudo actualizar');
    }
  },

  deleteHorario: async (id) => {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          horarios: get().horarios.filter(
            horario => horario.id !== id
          )
        });
        toast.success('Horario eliminado correctamente');
      }
    } catch (error) {
      toast.error('El horario no se pudo eliminar');
    }
  }
}))