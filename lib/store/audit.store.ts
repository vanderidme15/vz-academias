// lib/stores/audit.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "../supabase/client";
import { InscripcionAudit, AuditLogView, AuditFilters, AuditAction, VoluntarioAudit } from "@/shared/types/supabase.types";

const supabase = createClient();

type AuditStore = {
  logs: InscripcionAudit[];
  logsView: AuditLogView[];
  loading: boolean;

  // Consultas básicas
  fetchAllLogs: (limit?: number) => Promise<void>;
  fetchLogsByInscripcion: (inscripcionId: string) => Promise<void>;
  fetchLogsByUser: (userId: string) => Promise<void>;

  // Consulta avanzada con filtros
  fetchLogsWithFilters: (filters: AuditFilters) => Promise<void>;

  // Vista formateada
  fetchLogsView: (limit?: number) => Promise<void>;

  // Obtener historial detallado de una inscripción específica
  getInscripcionHistory: (inscripcionId: string) => Promise<InscripcionAudit[]>;

  // Obtener historial detallado de un voluntario específico
  getVoluntarioHistory: (voluntarioId: string) => Promise<VoluntarioAudit[]>;

  // Obtener actividad reciente de un usuario
  getUserActivity: (userId: string, limit?: number) => Promise<InscripcionAudit[]>;

  // Estadísticas
  getAuditStats: () => Promise<{
    totalChanges: number;
    byAction: Record<AuditAction, number>;
    byUser: Record<string, number>;
    recentActivity: number;
  } | null>;

  // Limpiar estado
  clearLogs: () => void;
};

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],
  logsView: [],
  loading: false,

  // 📋 Obtener todos los logs
  fetchAllLogs: async (limit = 100) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('inscripciones_audit')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      set({ logs: data ?? [], loading: false });
    } catch (error) {
      console.error('Error al obtener logs:', error);
      toast.error('No se pudieron cargar los logs');
      set({ loading: false });
    }
  },

  // 📄 Obtener logs de una inscripción específica
  fetchLogsByInscripcion: async (inscripcionId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('inscripciones_audit')
        .select('*')
        .eq('inscripcion_id', inscripcionId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      set({ logs: data ?? [], loading: false });
    } catch (error) {
      console.error('Error al obtener logs de inscripción:', error);
      toast.error('No se pudieron cargar los logs de esta inscripción');
      set({ loading: false });
    }
  },

  // 👤 Obtener logs de un usuario específico
  fetchLogsByUser: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('inscripciones_audit')
        .select('*')
        .eq('user_id', userId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      set({ logs: data ?? [], loading: false });
    } catch (error) {
      console.error('Error al obtener logs de usuario:', error);
      toast.error('No se pudieron cargar los logs del usuario');
      set({ loading: false });
    }
  },

  // 🔍 Consulta avanzada con múltiples filtros
  fetchLogsWithFilters: async (filters: AuditFilters) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('inscripciones_audit')
        .select('*');

      // Aplicar filtros dinámicamente
      if (filters.inscripcionId) {
        query = query.eq('inscripcion_id', filters.inscripcionId);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.dateFrom) {
        query = query.gte('changed_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('changed_at', filters.dateTo);
      }

      query = query.order('changed_at', { ascending: false });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ logs: data ?? [], loading: false });
    } catch (error) {
      console.error('Error al obtener logs con filtros:', error);
      toast.error('No se pudieron cargar los logs filtrados');
      set({ loading: false });
    }
  },

  // 🎨 Obtener vista formateada de logs
  fetchLogsView: async (limit = 100) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('inscripciones_audit_view')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      set({ logsView: data ?? [], loading: false });
    } catch (error) {
      console.error('Error al obtener vista de logs:', error);
      toast.error('No se pudo cargar la vista de logs');
      set({ loading: false });
    }
  },

  // 📖 Historial completo de una inscripción
  getInscripcionHistory: async (inscripcionId: string) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones_audit')
        .select('*')
        .eq('inscripcion_id', inscripcionId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      return data ?? [];
    } catch (error) {
      console.error('Error al obtener historial:', error);
      toast.error('No se pudo cargar el historial');
      return [];
    }
  },

  // 📖 Historial completo de una inscripción
  getVoluntarioHistory: async (voluntarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('voluntarios_audit')
        .select('*')
        .eq('voluntario_id', voluntarioId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      return data ?? [];
    } catch (error) {
      console.error('Error al obtener historial:', error);
      toast.error('No se pudo cargar el historial');
      return [];
    }
  },

  // 📊 Actividad reciente de un usuario
  getUserActivity: async (userId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones_audit')
        .select('*')
        .eq('user_id', userId)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data ?? [];
    } catch (error) {
      console.error('Error al obtener actividad:', error);
      toast.error('No se pudo cargar la actividad del usuario');
      return [];
    }
  },

  // 📈 Estadísticas de auditoría
  getAuditStats: async () => {
    try {
      // Total de cambios
      const { count: totalChanges } = await supabase
        .from('inscripciones_audit')
        .select('*', { count: 'exact', head: true });

      // Por acción
      const { data: actionsData } = await supabase
        .from('inscripciones_audit')
        .select('action');

      const byAction = (actionsData ?? []).reduce((acc: Record<AuditAction, number>, item: { action: AuditAction }) => {
        acc[item.action] = (acc[item.action] || 0) + 1;
        return acc;
      }, {} as Record<AuditAction, number>);

      // Por usuario
      const { data: usersData } = await supabase
        .from('inscripciones_audit')
        .select('user_email');

      const byUser = (usersData ?? []).reduce((acc: Record<string, number>, item: { user_email: string }) => {
        const email = item.user_email || 'Sistema';
        acc[email] = (acc[email] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Actividad reciente (últimas 24 horas)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: recentActivity } = await supabase
        .from('inscripciones_audit')
        .select('*', { count: 'exact', head: true })
        .gte('changed_at', yesterday.toISOString());

      return {
        totalChanges: totalChanges ?? 0,
        byAction,
        byUser,
        recentActivity: recentActivity ?? 0,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      toast.error('No se pudieron cargar las estadísticas');
      return null;
    }
  },

  // 🗑️ Limpiar estado
  clearLogs: () => {
    set({ logs: [], logsView: [] });
  },
}));