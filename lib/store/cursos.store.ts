import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../supabase/client"
import { Curso } from "@/shared/types/supabase.types";

const supabase = createClient();

type CursosStore = {
  cursos: Curso[]
  fetchCursos: () => Promise<void>
  fetchCursoById: (id: string) => Promise<Curso | null>
  createCurso: (values: Curso) => Promise<Curso | null>
  updateCurso: (values: Curso, id: string) => Promise<void>
  deleteCurso: (id: string) => Promise<void>
}

export const useCursosStore = create<CursosStore>((set, get) => ({
  cursos: [],

  fetchCursos: async () => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          teacher:profesores (*),
          schedule:horarios (*)
        `)
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ cursos: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar los cursos');
    }
  },

  fetchCursoById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          teacher:profesores (*),
          schedule:horarios (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      toast.error('No se pudo cargar el curso');
      return null;
    }
  },

  createCurso: async (values) => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .insert(values)
        .select(`
          *,
          teacher:profesores (*),
          schedule:horarios (*)
        `)
        .single();

      if (error) {
        toast.error('El curso no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Curso creado correctamente');
        set({ cursos: [data, ...get().cursos] });
        return data;
      }
    } catch (error) {
      toast.error('El curso no se pudo crear');
      return null;
    }
  },

  updateCurso: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .update(values)
        .eq('id', id)
        .select(`
          *,
          teacher:profesores (*),
          schedule:horarios (*)
        `)
        .single();

      if (error) throw error;

      if (data) {
        set({
          cursos: get().cursos.map(
            curso => curso.id === id ? data : curso
          )
        });
        toast.success('Curso actualizado correctamente');
      }
    } catch (error) {
      toast.error('El curso no se pudo actualizar');
    }
  },

  deleteCurso: async (id) => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          cursos: get().cursos.filter(
            curso => curso.id !== id
          )
        });
        toast.success('Curso eliminado correctamente');
      }
    } catch (error) {
      toast.error('El curso no se pudo eliminar');
    }
  }
}))