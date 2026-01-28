// stores/useCursosStore.ts
import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client";
import { Curso, Inscripcion } from "@/shared/types/supabase.types";

const supabase = createClient();

type CourseStats = {
  totalInscripciones: number;
  totalAsistencias: number;
}

type CursosStore = {
  cursos: Curso[]
  courseStats: Record<string, CourseStats> // Cache de estadísticas por curso
  fetchCursos: () => Promise<void>
  fetchCursoById: (id: string) => Promise<Curso | null>
  fetchCourseStats: (courseId: string) => Promise<CourseStats>
  createCurso: (values: Curso) => Promise<Curso | null>
  updateCurso: (values: Curso, id: string) => Promise<void>
  deleteCurso: (id: string) => Promise<void>
}

export const useCursosStore = create<CursosStore>((set, get) => ({
  cursos: [],
  courseStats: {},

  fetchCursos: async () => {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          teacher:profesores (*),
          schedule:horarios (*)
        `)
        .order('created_at', { ascending: false });

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

  /**
   * Obtiene estadísticas de un curso específico
   * - Total de inscripciones
   * - Total de asistencias validadas (admin_check = true)
   * Guarda en cache para evitar múltiples llamadas
   */
  fetchCourseStats: async (courseId: string) => {
    try {
      // Si ya está en cache, retornar
      const cached = get().courseStats[courseId];
      if (cached) return cached;

      // Paso 1: Obtener inscripciones del curso
      const { data: inscripciones, error: inscError } = await supabase
        .from("inscripciones")
        .select("id")
        .eq("course_id", courseId);

      if (inscError) throw inscError;

      const inscripcionIds = (inscripciones || []).map((i: Inscripcion) => i.id);

      // Si no hay inscripciones, retornar ceros
      if (inscripcionIds.length === 0) {
        const stats = { totalInscripciones: 0, totalAsistencias: 0 };

        // Guardar en cache
        set({
          courseStats: {
            ...get().courseStats,
            [courseId]: stats
          }
        });

        return stats;
      }

      // Paso 2: Contar asistencias validadas
      const { count, error: asistError } = await supabase
        .from("asistencias")
        .select("id", { count: "exact", head: true })
        .in("registration_id", inscripcionIds)
        .eq("admin_check", true);

      if (asistError) throw asistError;

      const stats = {
        totalInscripciones: inscripciones.length,
        totalAsistencias: count || 0,
      };

      // Guardar en cache
      set({
        courseStats: {
          ...get().courseStats,
          [courseId]: stats
        }
      });

      return stats;
    } catch (error) {
      console.error("Error fetching course stats:", error);

      // En caso de error, retornar ceros pero no guardar en cache
      return { totalInscripciones: 0, totalAsistencias: 0 };
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
        // Limpiar stats del cache al eliminar
        const { [id]: _, ...restStats } = get().courseStats;

        set({
          cursos: get().cursos.filter(curso => curso.id !== id),
          courseStats: restStats
        });

        toast.success('Curso eliminado correctamente');
      }
    } catch (error) {
      toast.error('El curso no se pudo eliminar');
    }
  }
}))
