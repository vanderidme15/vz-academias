import { create } from "zustand"
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "../../supabase/client"
import { Inscripcion, InscripcionWithRelations } from "@/shared/types/supabase.types";
import { useAsistenciasStore } from "./asistencias.store";

const supabase = createClient();

type InscripcionesStore = {
  inscripciones: Inscripcion[]

  selectedInscripcion: Inscripcion | null
  setSelectedInscripcion: (inscripcion: Inscripcion | null) => void

  fetchInscripciones: () => Promise<void>
  fetchAllInscripciones: () => Promise<Inscripcion[]>
  fetchInscripcionesByAlumnoId: (alumnoId?: string) => Promise<void>
  // fetch a vistas para traer inscripciones con asistencia
  fetchInscripcionesByCursoId: (cursoId?: string) => Promise<InscripcionWithRelations[]>
  fetchInscripcionesByCursoIdYFecha: (cursoId?: string, fecha?: string) => Promise<InscripcionWithRelations[]>

  fetchInscripcionById: (id?: string) => Promise<Inscripcion | null>
  createInscripcion: (values: Inscripcion) => Promise<Inscripcion | null>
  updateInscripcion: (values: Inscripcion, id: string) => Promise<Inscripcion | null>
  deleteInscripcion: (id: string) => Promise<void>

  //payments actions
  createPayment: (values: Record<string, any>, inscripcionId?: string) => Promise<void>
  updatePayment: (values: Record<string, any>, paymentId: string, inscripcionId?: string) => Promise<void>
  deletePayment: (paymentId: string, inscripcionId?: string) => Promise<void>

  handleConfirmMarkAttendanceByStudent: (inscripcionId: string) => Promise<void>
  handleConfirmMarkAttendanceByAdmin: (registrationId: string, teacherId?: string, ownCheck?: boolean, adminCheck?: boolean, classCountDelta?: number) => Promise<void>
}

export const useInscripcionesStore = create<InscripcionesStore>((set, get) => ({
  inscripciones: [],

  selectedInscripcion: null,
  setSelectedInscripcion: (inscripcion: Inscripcion | null) => set({ selectedInscripcion: inscripcion }),

  fetchInscripciones: async () => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select(`*, course:cursos (*)`)
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ inscripciones: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar las inscripciones');
    }
  },

  // cosa rara
  // Agregar este método a tu useInscripcionesStore
  fetchAllInscripciones: async () => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select(`
        *,
        student:alumnos(*),
        course:cursos(
          *,
          schedule:horarios(*),
          teacher:profesores(*)
        )
      `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching inscripciones:', error)
      return []
    }
  },

  fetchInscripcionesByAlumnoId: async (alumnoId?: string) => {
    try {
      if (!alumnoId) {
        toast.error('No se proporciono un ID de alumno');
        return;
      }
      const { data, error } = await supabase
        .from('inscripciones')
        .select(`*, course:cursos (*), student:alumnos (*)`)
        .eq('student_id', alumnoId)
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ inscripciones: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar las inscripciones');
    }
  },

  // Función para HOY (más simple y eficiente)
  fetchInscripcionesByCursoId: async (cursoId?: string) => {
    if (!cursoId) {
      toast.error('No se proporcionó un ID de curso');
      return [];
    }

    try {
      const { data, error } = await supabase
        .rpc('get_inscripciones_activas_por_curso', {
          p_course_id: cursoId
        });

      if (error) throw error;

      // Transformar para mantener la estructura original con "student"
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        course_id: item.course_id,
        student_id: item.student_id,
        class_count: item.class_count,
        total_classes: item.total_classes,
        created_at: item.created_at,
        attendance: {
          id: item.attendance_id,
          date_time: item.attendance_date_time,
          own_check: item.own_check,
          admin_check: item.admin_check,
          rescheduled: item.rescheduled,
          teacher_id: item.teacher_id,
          has_attendance: item.has_attendance,
        },
        student: {
          id: item.student_id,
          name: item.student_name,
          dni: item.student_dni
        }
      }));

      return transformedData;
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar las inscripciones');
      return [];
    }
  },

  // Función para FECHA ESPECÍFICA
  fetchInscripcionesByCursoIdYFecha: async (cursoId?: string, fecha?: string) => {
    if (!cursoId) {
      toast.error('No se proporcionó un ID de curso');
      return [];
    }

    try {
      const { data, error } = await supabase
        .rpc('get_inscripciones_activas_por_curso_fecha', {
          p_course_id: cursoId,
          p_fecha: fecha || new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Transformar para mantener la estructura original
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        course_id: item.course_id,
        student_id: item.student_id,
        class_count: item.class_count,
        total_classes: item.total_classes,
        created_at: item.created_at,
        attendance: {
          id: item.attendance_id,
          date_time: item.attendance_date_time,
          own_check: item.own_check,
          admin_check: item.admin_check,
          rescheduled: item.rescheduled,
          teacher_id: item.teacher_id,
          has_attendance: item.has_attendance,
        },
        student: {
          id: item.student_id,
          name: item.student_name,
          dni: item.student_dni
        }
      }));

      return transformedData;
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar las inscripciones');
      return [];
    }
  },

  fetchInscripcionById: async (id?: string) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select(`*, course:cursos (*), student:alumnos (*)`)
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
        .select(`*, course:cursos (*)`)
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
        .select(`*, course:cursos (*)`)
        .single();

      if (error) {
        toast.error('La inscripcion no se pudo actualizar, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        set({
          inscripciones: get().inscripciones.map(
            inscripcion => inscripcion.id === id ? data : inscripcion
          )
        });
        toast.success('Inscripcion actualizada correctamente');
        return data;
      }
    } catch (error) {
      toast.error('La inscripcion no se pudo actualizar');
      return null;
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
  },

  createPayment: async (values, inscripcionId) => {
    try {
      if (!inscripcionId) {
        throw new Error('No se proporciono una inscripción');
      }

      const inscripcion = get().inscripciones.find(i => i.id === inscripcionId);
      if (!inscripcion) {
        toast.error('Inscripción no encontrada');
        return;
      }

      const payments = inscripcion.payments || [];
      const newPayment = {
        id: uuidv4(),
        ...values,
      };

      const newPayments = [...payments, newPayment];

      const { data, error } = await supabase
        .from('inscripciones')
        .update({ payments: newPayments })
        .eq('id', inscripcionId)
        .select(`*, course:cursos (*)`)
        .single();

      if (error) {
        toast.error('El pago no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Pago creado correctamente');
        set({
          inscripciones: get().inscripciones.map(
            inscripcion => inscripcion.id === inscripcionId ? data : inscripcion
          ),
          selectedInscripcion: data
        });
        return data;
      }
    } catch (error) {
      toast.error('El pago no se pudo crear');
      return null;
    }
  },

  updatePayment: async (values, paymentId, inscripcionId) => {
    try {
      if (!inscripcionId) {
        throw new Error('No se proporciono una inscripción');
      }

      const inscripcion = get().inscripciones.find(i => i.id === inscripcionId);
      if (!inscripcion) {
        toast.error('Inscripción no encontrada');
        return;
      }

      const payments = inscripcion.payments || [];
      const updatedPayments = payments.map(payment => payment.id === paymentId ? { ...payment, ...values } : payment);

      const { data, error } = await supabase
        .from('inscripciones')
        .update({ payments: updatedPayments })
        .eq('id', inscripcionId)
        .select(`*, course:cursos (*)`)
        .single();

      if (error) throw error;

      if (data) {
        set({
          inscripciones: get().inscripciones.map(
            inscripcion => inscripcion.id === inscripcionId ? data : inscripcion
          ),
          selectedInscripcion: data
        });
        toast.success('Pago actualizado correctamente');
      }
    } catch (error) {
      toast.error('El pago no se pudo actualizar');
    }
  },

  deletePayment: async (paymentId, inscripcionId) => {
    try {
      if (!inscripcionId) {
        throw new Error('No se proporciono una inscripción');
      }

      const inscripcion = get().inscripciones.find(i => i.id === inscripcionId);
      if (!inscripcion) {
        toast.error('Inscripción no encontrada');
        return;
      }

      const payments = inscripcion.payments || [];
      const updatedPayments = payments.filter(payment => payment.id !== paymentId);

      const { data, error } = await supabase
        .from('inscripciones')
        .update({ payments: updatedPayments })
        .eq('id', inscripcionId)
        .select(`*, course:cursos (*)`)
        .single();

      if (error) throw error;

      if (data) {
        set({
          inscripciones: get().inscripciones.map(
            inscripcion => inscripcion.id === inscripcionId ? data : inscripcion
          ),
          selectedInscripcion: data
        });
        toast.success('Pago eliminado correctamente');
      }
    } catch (error) {
      toast.error('El pago no se pudo eliminar');
    }
  },

  handleConfirmMarkAttendanceByStudent: async (inscripcionId: string) => {
    try {
      const attendance = useAsistenciasStore.getState().markAsistenciaByStudent(inscripcionId);

      if (!attendance) {
        toast.error('No se pudo marcar la asistencia');
        return;
      } else {
        toast.success('Asistencia confirmada correctamente');
        return
      }
    } catch (error) {
      toast.error('La asistencia no se pudo confirmar');
    }
  },
  handleConfirmMarkAttendanceByAdmin: async (
    registrationId: string,
    teacherId?: string,
    ownCheck?: boolean,
    adminCheck?: boolean,
    classCountDelta?: number // Nuevo parámetro opcional
  ) => {
    try {
      // Si no se proporciona classCountDelta, calcularlo (compatibilidad con llamadas antiguas)
      if (classCountDelta === undefined) {
        const attendance = await useAsistenciasStore.getState().getAsistenciaByInscripcionIdToday(registrationId);
        const wasChecked = attendance?.admin_check === true;
        const willBeChecked = adminCheck === true;

        if (!wasChecked && willBeChecked) {
          classCountDelta = 1;
        } else if (wasChecked && !willBeChecked) {
          classCountDelta = -1;
        } else {
          classCountDelta = 0;
        }
      }

      // Solo actualizar class_count si hay cambio
      if (classCountDelta !== 0) {
        const { error } = await supabase.rpc('increment_class_count', {
          p_registration_id: registrationId,
          p_increment: classCountDelta
        });

        if (error) throw error;
      }

      // Marcar asistencia (sin toasts duplicados)
      await useAsistenciasStore.getState().markAsistenciaByAdmin(
        registrationId,
        teacherId,
        ownCheck,
        adminCheck,
        false // Nuevo parámetro para no mostrar toast
      );

      // Toast único aquí
      toast.success('Asistencia guardada correctamente');

    } catch (error) {
      console.error('Error en handleConfirmMarkAttendanceByAdmin:', error);
      toast.error('La asistencia no se pudo confirmar');
      throw error; // Re-lanzar para que handleSaveAsistencia pueda hacer rollback
    }
  },
}))