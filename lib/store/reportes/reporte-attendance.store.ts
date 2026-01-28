// stores/useAttendanceStore.ts
"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { Asistencia, Inscripcion } from "@/shared/types/supabase.types";

const supabase = createClient();

interface AttendanceStore {
  inscripciones: Inscripcion[];
  isLoading: boolean;
  fetchByStudentId: (studentId: string) => Promise<void>;
  fetchByCourseId: (courseId: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  inscripciones: [],
  isLoading: false,

  /**
   * Obtiene todas las inscripciones de un alumno específico
   * Incluye: curso, alumno, asistencias (solo admin_check === true)
   * La relación es: inscripciones -> asistencias.registration_id
   */
  fetchByStudentId: async (studentId: string) => {
    set({ isLoading: true });
    try {
      // Paso 1: Obtener inscripciones del alumno con curso y alumno
      const { data: inscripciones, error: inscError } = await supabase
        .from("inscripciones")
        .select(`
          *,
          course:cursos(*),
          student:alumnos(*)
        `)
        .eq("student_id", studentId)
        .order("date_from", { ascending: false });

      if (inscError) throw inscError;

      if (!inscripciones || inscripciones.length === 0) {
        set({ inscripciones: [], isLoading: false });
        return;
      }

      // Paso 2: Obtener asistencias de todas las inscripciones
      const inscripcionIds = inscripciones.map((insc: Inscripcion) => insc.id);

      const { data: asistencias, error: asistError } = await supabase
        .from("asistencias")
        .select("*")
        .in("registration_id", inscripcionIds)
        .eq("admin_check", true) // Solo asistencias validadas
        .order("date_time", { ascending: false });

      if (asistError) throw asistError;

      // Paso 3: Mapear asistencias a cada inscripción
      const inscripcionesConAsistencias = inscripciones.map((insc: Inscripcion) => ({
        ...insc,
        assistances: (asistencias || []).filter(
          (asist: Asistencia) => asist.registration_id === insc.id
        ),
      }));

      set({
        inscripciones: inscripcionesConAsistencias as Inscripcion[],
        isLoading: false
      });
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      set({ inscripciones: [], isLoading: false });
    }
  },

  /**
   * Obtiene todas las inscripciones de un curso específico
   * Incluye: curso, alumno, asistencias (solo admin_check === true)
   * La relación es: inscripciones -> asistencias.registration_id
   */
  fetchByCourseId: async (courseId: string) => {
    set({ isLoading: true });

    try {
      const supabase = createClient();

      // Paso 1: Obtener inscripciones del curso con alumno
      const { data: inscripciones, error: inscError } = await supabase
        .from("inscripciones")
        .select(`
          *,
          course:cursos(*),
          student:alumnos(*)
        `)
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (inscError) throw inscError;

      if (!inscripciones || inscripciones.length === 0) {
        set({ inscripciones: [], isLoading: false });
        return;
      }

      // Paso 2: Obtener asistencias de todas las inscripciones
      const inscripcionIds = inscripciones.map((insc: Inscripcion) => insc.id);

      const { data: asistencias, error: asistError } = await supabase
        .from("asistencias")
        .select("*")
        .in("registration_id", inscripcionIds)
        .eq("admin_check", true) // Solo asistencias validadas
        .order("date_time", { ascending: false });

      if (asistError) throw asistError;

      // Paso 3: Mapear asistencias a cada inscripción
      const inscripcionesConAsistencias = inscripciones.map((insc: Inscripcion) => ({
        ...insc,
        assistances: (asistencias || []).filter(
          (asist: Asistencia) => asist.registration_id === insc.id
        ),
      }));

      set({
        inscripciones: inscripcionesConAsistencias as Inscripcion[],
        isLoading: false
      });
    } catch (error) {
      console.error("Error fetching course attendance:", error);
      set({ inscripciones: [], isLoading: false });
    }
  },
}));