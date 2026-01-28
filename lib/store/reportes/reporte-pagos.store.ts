import { create } from 'zustand';
import type { Pago } from '@/shared/types/supabase.types';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient()


interface PaymentByDay {
  date: string; // formato: 'YYYY-MM-DD'
  total: number;
  count: number;
  payments: Array<{
    amount: number;
    method: 'yape' | 'efectivo';
    code?: string;
    register_by?: string;
  }>;
}

interface ReportePagosState {
  paymentsByDay: PaymentByDay[];
  isLoading: boolean;
  error: string | null;
  dateFrom: string | null;
  dateTo: string | null;

  // Acciones
  fetchPaymentsByDay: (dateFrom?: string, dateTo?: string) => Promise<void>;
  setDateRange: (dateFrom: string | null, dateTo: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useReportePagosStore = create<ReportePagosState>((set, get) => ({
  paymentsByDay: [],
  isLoading: false,
  error: null,
  dateFrom: null,
  dateTo: null,

  setDateRange: (dateFrom, dateTo) => {
    set({ dateFrom, dateTo });
  },

  fetchPaymentsByDay: async (dateFrom?: string, dateTo?: string) => {
    set({ isLoading: true, error: null });

    try {
      // Construir query
      let query = supabase
        .from('inscripciones')
        .select('id, created_at, payments');

      // Filtrar por rango de fechas si se proporcionan
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Procesar los datos para agrupar pagos por día
      const paymentsMap = new Map<string, {
        total: number;
        count: number;
        payments: Array<{
          amount: number;
          method: 'yape' | 'efectivo';
          code?: string;
          register_by?: string;
        }>;
      }>();

      // Tipar correctamente el data de Supabase
      const inscripciones = data as Array<{
        id: string;
        created_at: string;
        payments: Pago[] | null;
      }>;

      inscripciones?.forEach((inscripcion) => {
        if (inscripcion.payments && Array.isArray(inscripcion.payments)) {
          inscripcion.payments.forEach((payment: Pago) => {
            // Usar la fecha de creación del pago o de la inscripción
            const paymentDate = payment.created_at
              ? new Date(payment.created_at).toISOString().split('T')[0]
              : new Date(inscripcion.created_at).toISOString().split('T')[0];

            const amount = payment.payment_amount || 0;

            const paymentDetail = {
              amount,
              method: payment.payment_method || 'efectivo' as const,
              code: payment.payment_code,
              register_by: payment.register_by,
            };

            if (paymentsMap.has(paymentDate)) {
              const existing = paymentsMap.get(paymentDate)!;
              paymentsMap.set(paymentDate, {
                total: existing.total + amount,
                count: existing.count + 1,
                payments: [...existing.payments, paymentDetail],
              });
            } else {
              paymentsMap.set(paymentDate, {
                total: amount,
                count: 1,
                payments: [paymentDetail],
              });
            }
          });
        }
      });

      // Convertir el Map a array y ordenar por fecha
      const paymentsByDay: PaymentByDay[] = Array.from(paymentsMap.entries())
        .map(([date, data]) => ({
          date,
          total: data.total,
          count: data.count,
          payments: data.payments,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      set({
        paymentsByDay,
        isLoading: false,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    paymentsByDay: [],
    isLoading: false,
    error: null,
    dateFrom: null,
    dateTo: null,
  }),
}));