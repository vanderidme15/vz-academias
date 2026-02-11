import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../../supabase/client"
import { Asistencia } from "@/shared/types/supabase.types";

const supabase = createClient();

type AsistenciasStore = {
  asistencias: Asistencia[]
  asistenciasByRegistrationId: Asistencia[]

  //mantenedores basicos
  fetchAsistencias: () => Promise<void>
  fetchAsistenciasByRegistrationId: (registrationId?: string) => Promise<void>
  fetchAsistenciaById: (id: string) => Promise<Asistencia | null>
  createAsistencia: (values: Asistencia) => Promise<Asistencia | null>
  updateAsistencia: (values: Asistencia, id: string) => Promise<Asistencia | null>
  deleteAsistencia: (id: string) => Promise<void>

  //actions
  markAsistenciaByStudent: (registrationId: string) => Promise<Asistencia | null>
  markAsistenciaByAdmin: (registrationId?: string, teacherId?: string, ownCheck?: boolean, adminCheck?: boolean, showToast?: boolean) => Promise<Asistencia | null>
  getAsistenciaByInscripcionIdToday: (registrationId: string) => Promise<Asistencia | null>

  // accion para actualizar y crear asistencia pasada
  regularizeAttendance: (registrationId: string, date: string, teacherId: string, ownCheck: boolean, adminCheck: boolean) => Promise<Asistencia | null>
}

export const useAsistenciasStore = create<AsistenciasStore>((set, get) => ({
  asistencias: [],
  asistenciasByRegistrationId: [],

  fetchAsistencias: async () => {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .select(`*, course:cursos (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ asistencias: data ?? [] });
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      toast.error('No se pudieron cargar las asistencias');
    }
  },

  fetchAsistenciasByRegistrationId: async (registrationId?: string) => {
    try {
      if (!registrationId) {
        toast.error('No se proporcionó un ID de registro');
        return;
      }
      const { data, error } = await supabase
        .from('asistencias')
        .select(`*`)
        .eq('registration_id', registrationId)
        .order('date_time', { ascending: true });

      if (error) throw error;
      set({ asistenciasByRegistrationId: data ?? [] });
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      toast.error('No se pudieron cargar las asistencias');
    }
  },

  fetchAsistenciaById: async (id: string) => {
    try {
      if (!id) {
        toast.error('No se proporcionó un ID de asistencia');
        return null;
      }
      const { data, error } = await supabase
        .from('asistencias')
        .select(`*, course:cursos (*)`)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al cargar asistencia:', error);
      toast.error('No se pudo cargar la asistencia');
      return null;
    }
  },

  createAsistencia: async (values) => {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .insert(values)
        .select(`*, course:cursos (*)`)
        .single();

      if (error) {
        console.error('Error al crear asistencia:', error);
        toast.error('La asistencia no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Asistencia creada correctamente');
        set({ asistencias: [data, ...get().asistencias] });
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error al crear asistencia:', error);
      toast.error('La asistencia no se pudo crear');
      return null;
    }
  },

  updateAsistencia: async (values, id) => {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .update(values)
        .eq('id', id)
        .select(`*, course:cursos (*)`)
        .single();

      if (error) {
        console.error('Error al actualizar asistencia:', error);
        toast.error('La asistencia no se pudo actualizar, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        set({
          asistencias: get().asistencias.map(
            asistencia => asistencia.id === id ? data : asistencia
          )
        });
        toast.success('Asistencia actualizada correctamente');
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      toast.error('La asistencia no se pudo actualizar');
      return null;
    }
  },

  deleteAsistencia: async (id) => {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          asistencias: get().asistencias.filter(
            asistencia => asistencia.id !== id
          )
        });
        toast.success('Asistencia eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar asistencia:', error);
      toast.error('La asistencia no se pudo eliminar');
    }
  },

  // actions
  markAsistenciaByStudent: async (registrationId: string) => {
    try {
      if (!registrationId) {
        toast.error('No se proporcionó un ID de registro');
        return null;
      }

      // Obtener la fecha de hoy sin la hora (solo YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];

      const { data: todayAttendance, error: todayAttendanceError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('registration_id', registrationId)
        .gte('date_time', `${today}T00:00:00.000Z`)
        .lt('date_time', `${today}T23:59:59.999Z`)
        .maybeSingle();

      if (todayAttendanceError) {
        console.error('Error al verificar asistencia:', todayAttendanceError);
        toast.error('Error al verificar la asistencia');
        return null;
      }

      if (todayAttendance) {
        // Ya existe asistencia, actualizarla
        const { data: attendanceUpdated, error: attendanceUpdatedError } = await supabase
          .from('asistencias')
          .update({ own_check: true })
          .eq('id', todayAttendance.id)
          .select('*')
          .single();

        if (attendanceUpdatedError) {
          console.error('Error al actualizar asistencia:', attendanceUpdatedError);
          toast.error('La asistencia no se pudo marcar');
          return null;
        }

        toast.success('Asistencia marcada correctamente');
        return attendanceUpdated;
      } else {
        // No existe asistencia, crearla
        const { data: attendanceCreated, error: attendanceCreatedError } = await supabase
          .from('asistencias')
          .insert({
            registration_id: registrationId,
            date_time: new Date().toISOString(),
            own_check: true
          })
          .select('*')
          .single();

        if (attendanceCreatedError) {
          console.error('Error al crear asistencia:', attendanceCreatedError);
          toast.error('La asistencia no se pudo crear');
          return null;
        }

        toast.success('Asistencia marcada correctamente');
        return attendanceCreated;
      }
    } catch (error) {
      console.error('Error en markAsistenciaByStudent:', error);
      toast.error('La asistencia no se pudo marcar');
      return null;
    }
  },

  markAsistenciaByAdmin: async (
    registrationId?: string,
    teacherId?: string,
    ownCheck?: boolean,
    adminCheck?: boolean,
    showToast: boolean = true // Nuevo parámetro para controlar toasts
  ) => {
    try {
      if (!registrationId || !teacherId) {
        if (showToast) toast.error('No se proporcionó un ID de registro o un ID de profesor');
        return null;
      }

      const todayAttendance = await get().getAsistenciaByInscripcionIdToday(registrationId);

      if (todayAttendance) {
        // Actualizar asistencia existente
        const { data: attendanceUpdated, error } = await supabase
          .from('asistencias')
          .update({
            teacher_id: teacherId,
            own_check: ownCheck ?? todayAttendance.own_check,
            admin_check: adminCheck ?? todayAttendance.admin_check,
          })
          .eq('id', todayAttendance.id)
          .select('*')
          .single();

        if (error) {
          console.error('Error al actualizar asistencia:', error);
          if (showToast) toast.error('La asistencia no se pudo actualizar');
          throw error;
        }

        if (showToast) toast.success('Asistencia actualizada correctamente');
        return attendanceUpdated;
      } else {
        // Crear nueva asistencia
        const { data: attendanceCreated, error } = await supabase
          .from('asistencias')
          .insert({
            registration_id: registrationId,
            date_time: new Date().toISOString(),
            teacher_id: teacherId,
            own_check: ownCheck ?? false,
            admin_check: adminCheck ?? false,
          })
          .select('*')
          .single();

        if (error) {
          console.error('Error al crear asistencia:', error);
          if (showToast) toast.error('La asistencia no se pudo crear');
          throw error;
        }

        if (showToast) toast.success('Asistencia creada correctamente');
        return attendanceCreated;
      }
    } catch (error) {
      console.error('Error en markAsistenciaByAdmin:', error);
      if (showToast) toast.error('La asistencia no se pudo marcar');
      throw error;
    }
  },

  getAsistenciaByInscripcionIdToday: async (registrationId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: attendance, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('registration_id', registrationId)
        .gte('date_time', `${today}T00:00:00.000Z`)
        .lt('date_time', `${today}T23:59:59.999Z`)
        .maybeSingle();

      if (error) throw error;

      return attendance;
    } catch (error) {
      console.error('Error al obtener asistencia:', error);
      toast.error('Error al obtener la asistencia');
      return null;
    }
  },

  regularizeAttendance: async (
    registrationId: string,
    date: string,
    teacherId: string,
    ownCheck: boolean,
    adminCheck: boolean
  ) => {
    try {
      // 1. Primero verificar si la asistencia existe
      const { data: existingAttendance, error: fetchError } = await supabase
        .from('asistencias')
        .select()
        .eq('registration_id', registrationId)
        .eq('date_time', date)
        .maybeSingle(); // Usar maybeSingle() en lugar de single() para evitar error si no existe

      if (fetchError) throw fetchError;

      // 2. Preparar los datos a guardar
      const attendanceData = {
        registration_id: registrationId,
        date_time: date,
        teacher_id: teacherId,
        own_check: ownCheck,
        admin_check: adminCheck,
        // Agregar otros campos necesarios como status si lo requieres
      };

      let result;

      if (existingAttendance) {
        // 3. Si existe, actualizar
        const { data, error } = await supabase
          .from('asistencias')
          .update(attendanceData)
          .eq('id', existingAttendance.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        // Actualizar en el estado
        set({
          asistenciasByRegistrationId: get().asistenciasByRegistrationId.map(
            asistencia => asistencia.id === data.id ? data : asistencia
          )
        });
      } else {
        // 4. Si no existe, crear
        console.log('Creando asistencia:', attendanceData);
        const { data, error } = await supabase
          .from('asistencias')
          .insert(attendanceData)
          .select()
          .single();

        if (error) throw error;
        result = data;

        // Agregar al estado
        set({
          asistenciasByRegistrationId: [...get().asistenciasByRegistrationId, data]
        });
      }

      return result;

    } catch (error) {
      console.error('Error al regularizar asistencia:', error);
      return null;
    }
  }
}))