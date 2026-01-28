// stores/useAlumnosStore.ts
import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client";
import { Alumno } from "@/shared/types/supabase.types";

const supabase = createClient();

type StudentStats = {
  inscripcionesCount: number;
}

type AlumnosStore = {
  alumnos: Alumno[]
  countAlumnos: number
  studentStats: Record<string, StudentStats> // Cache de estadísticas por alumno
  fetchAlumnos: () => Promise<void>
  fetchCountAlumnos: () => Promise<void>
  fetchAlumnoById: (id: string) => Promise<Alumno | null>
  fetchStudentStats: (studentId: string) => Promise<StudentStats>
  createAlumno: (values: Alumno) => Promise<Alumno | null>
  updateAlumno: (values: Alumno, id: string) => Promise<void>
  deleteAlumno: (id: string) => Promise<void>
}

export const useAlumnosStore = create<AlumnosStore>((set, get) => ({
  alumnos: [],
  countAlumnos: 0,
  studentStats: {},

  fetchAlumnos: async () => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('created_at', { ascending: false });

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

      set({ countAlumnos: count ?? 0 });
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

  /**
   * Obtiene estadísticas de un alumno específico
   * - Total de inscripciones
   * Guarda en cache para evitar múltiples llamadas
   */
  fetchStudentStats: async (studentId: string) => {
    try {
      // Si ya está en cache, retornar
      const cached = get().studentStats[studentId];
      if (cached) return cached;

      // Contar inscripciones del alumno
      const { count, error } = await supabase
        .from("inscripciones")
        .select("*", { count: "exact", head: true })
        .eq("student_id", studentId);

      if (error) throw error;

      const stats = {
        inscripcionesCount: count || 0,
      };

      // Guardar en cache
      set({
        studentStats: {
          ...get().studentStats,
          [studentId]: stats
        }
      });

      return stats;
    } catch (error) {
      console.error("Error fetching student stats:", error);

      // En caso de error, retornar cero pero no guardar en cache
      return { inscripcionesCount: 0 };
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
      toast.error('El alumno no se pudo crear');
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
        // Limpiar stats del cache al eliminar
        const { [id]: _, ...restStats } = get().studentStats;

        set({
          alumnos: get().alumnos.filter(alumno => alumno.id !== id),
          studentStats: restStats
        });

        toast.success('Alumno eliminado correctamente');
      }
    } catch (error) {
      toast.error('El alumno no se pudo eliminar');
    }
  }
}))
