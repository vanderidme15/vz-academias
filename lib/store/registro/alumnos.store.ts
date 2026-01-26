import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client";
import { Alumno } from "@/shared/types/supabase.types";

const supabase = createClient();

type AlumnosStore = {
  alumnos: Alumno[]
  countAlumnos: number
  fetchAlumnos: () => Promise<void>
  fetchCountAlumnos: () => Promise<void>
  fetchAlumnoById: (id: string) => Promise<Alumno | null>
  createAlumno: (values: Alumno) => Promise<Alumno | null>
  updateAlumno: (values: Alumno, id: string) => Promise<void>
  deleteAlumno: (id: string) => Promise<void>
}

export const useAlumnosStore = create<AlumnosStore>((set, get) => ({
  alumnos: [],
  countAlumnos: 0,

  fetchAlumnos: async () => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ alumnos: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar los alumnos');
    }
  },

  fetchCountAlumnos: async () => {
    try {
      const { count, error } = await supabase
        .from('alumnos')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      set({ countAlumnos: count });
    } catch (error) {
      toast.error('No se pudo cargar el conteo de alumnos');
    }
  },

  fetchAlumnoById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      toast.error('No se pudo cargar el alumno');
      return null;
    }
  },

  createAlumno: async (values) => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .insert(values)
        .select()
        .single();

      if (error) {
        toast.error('El alumno no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Alumno creado correctamente');
        set({ alumnos: [data, ...get().alumnos] });
        return data;
      }
    } catch (error) {
      toast.error('El precio no se pudo crear');
      return null;
    }
  },

  updateAlumno: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .update(values)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          alumnos: get().alumnos.map(
            alumno => alumno.id === id ? data : alumno
          )
        });
        toast.success('Alumno actualizado correctamente');
      }
    } catch (error) {
      toast.error('El alumno no se pudo actualizar');
    }
  },

  deleteAlumno: async (id) => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          alumnos: get().alumnos.filter(
            alumno => alumno.id !== id
          )
        });
        toast.success('Alumno eliminado correctamente');
      }
    } catch (error) {
      toast.error('El alumno no se pudo eliminar');
    }
  }
}))