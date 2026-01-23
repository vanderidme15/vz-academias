import { create } from "zustand"
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "../supabase/client"
import { Inscripcion } from "@/shared/types/supabase.types";

const supabase = createClient();

type InscripcionesStore = {
  inscripciones: Inscripcion[]

  selectedInscripcion: Inscripcion | null
  setSelectedInscripcion: (inscripcion: Inscripcion | null) => void

  fetchInscripciones: () => Promise<void>
  fetchInscripcionById: (id: string) => Promise<Inscripcion | null>
  createInscripcion: (values: Inscripcion) => Promise<Inscripcion | null>
  updateInscripcion: (values: Inscripcion, id: string) => Promise<Inscripcion | null>
  deleteInscripcion: (id: string) => Promise<void>

  //payments actions
  createPayment: (values: Record<string, any>, inscripcionId?: string) => Promise<void>
  updatePayment: (values: Record<string, any>, paymentId: string, inscripcionId?: string) => Promise<void>
  deletePayment: (paymentId: string, inscripcionId?: string) => Promise<void>

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

  fetchInscripcionById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select(`*, course:cursos (*)`)
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
        console.log(data);
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
  }
}))