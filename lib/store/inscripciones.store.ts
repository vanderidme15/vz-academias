import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../supabase/client"
import { Inscripcion } from "@/shared/types/supabase.types";

const supabase = createClient();

type InscripcionesStore = {
  inscripciones: Inscripcion[]
  fetchInscripciones: () => Promise<void>
  fetchInscripcionById: (id: string) => Promise<Inscripcion | null>
  createInscripcion: (values: Inscripcion) => Promise<Inscripcion | null>
  updateInscripcion: (values: Inscripcion, id: string) => Promise<void>
  deleteInscripcion: (id: string) => Promise<void>
}

export const useInscripcionesStore = create<InscripcionesStore>((set, get) => ({
  inscripciones: [],

  fetchInscripciones: async () => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ inscripciones: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar las inscripciones');
    }
  },

  fetchInscripcionById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      toast.error('No se pudo cargar el curso');
      return null;
    }
  },

  createInscripcion: async (values) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .insert(values)
        .select('*')
        .single();

      if (error) {
        toast.error('La inscripcion no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Inscripcion creada correctamente');
        set({ inscripciones: [data, ...get().inscripciones] });
        return data;
      }
    } catch (error) {
      toast.error('La inscripcion no se pudo crear');
      return null;
    }
  },

  updateInscripcion: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .update(values)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        set({
          inscripciones: get().inscripciones.map(
            inscripcion => inscripcion.id === id ? data : inscripcion
          )
        });
        toast.success('Inscripcion actualizada correctamente');
      }
    } catch (error) {
      toast.error('La inscripcion no se pudo actualizar');
    }
  },

  deleteInscripcion: async (id) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          inscripciones: get().inscripciones.filter(
            inscripcion => inscripcion.id !== id
          )
        });
        toast.success('Inscripcion eliminada correctamente');
      }
    } catch (error) {
      toast.error('La inscripcion no se pudo eliminar');
    }
  }
}))