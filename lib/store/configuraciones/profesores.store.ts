import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client";
import { Profesor } from "@/shared/types/supabase.types";

const supabase = createClient();

type ProfesoresStore = {
  profesores: Profesor[]
  fetchProfesores: () => Promise<void>
  fetchProfesorById: (id: string) => Promise<Profesor | null>
  createProfesor: (values: Profesor) => Promise<Profesor | null>
  updateProfesor: (values: Profesor, id: string) => Promise<void>
  deleteProfesor: (id: string) => Promise<void>
}

export const useProfesoresStore = create<ProfesoresStore>((set, get) => ({
  profesores: [],

  fetchProfesores: async () => {
    try {
      const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ profesores: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar los profesores');
    }
  },

  fetchProfesorById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      toast.error('No se pudo cargar el profesor');
      return null;
    }
  },

  createProfesor: async (values) => {
    try {
      const { data, error } = await supabase
        .from('profesores')
        .insert(values)
        .select()
        .single();

      if (error) {
        toast.error('El profesor no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Profesor creado correctamente');
        set({ profesores: [data, ...get().profesores] });
        return data;
      }
    } catch (error) {
      toast.error('El profesor no se pudo crear');
      return null;
    }
  },

  updateProfesor: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('profesores')
        .update(values)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          profesores: get().profesores.map(
            profesor => profesor.id === id ? data : profesor
          )
        });
        toast.success('Profesor actualizado correctamente');
      }
    } catch (error) {
      toast.error('El profesor no se pudo actualizar');
    }
  },

  deleteProfesor: async (id) => {
    try {
      const { data, error } = await supabase
        .from('profesores')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          profesores: get().profesores.filter(
            profesor => profesor.id !== id
          )
        });
        toast.success('Profesor eliminado correctamente');
      }
    } catch (error) {
      toast.error('El profesor no se pudo eliminar');
    }
  }
}))