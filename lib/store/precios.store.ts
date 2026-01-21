import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../supabase/client"
import { Precio } from "@/shared/types/supabase.types";

const supabase = createClient();


type PreciosStore = {
  precios: Precio[]
  fetchPrecios: () => Promise<void>
  fetchPrecioById: (id: string) => Promise<Precio | null>
  fetchDefaultPrecio: () => Promise<Precio | null>
  createPrecio: (values: any) => Promise<Precio | null>
  updatePrecio: (values: any, id: string) => Promise<void>
  deletePrecio: (id: string) => Promise<void>
}

export const usePreciosStore = create<PreciosStore>((set, get) => ({
  precios: [],

  fetchPrecios: async () => {
    try {
      const { data, error } = await supabase
        .from('precios')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;
      set({ precios: data ?? [] });
    } catch (error) {
      toast.error('No se pudieron cargar los precios');
    }
  },

  fetchPrecioById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('precios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error al obtener precio por ID:', error);
      toast.error('No se pudo cargar el precio');
      return null;
    }
  },

  fetchDefaultPrecio: async () => {
    try {
      const { data, error } = await supabase
        .from('precios')
        .select('*')
        .eq('default', true)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error al obtener precio por ID:', error);
      toast.error('No se pudo cargar el precio');
      return null;
    }
  },

  createPrecio: async (values) => {
    try {
      const precioData: Partial<Precio> = {
        name: values.name,
        price: values.price,
        description: values.description,
        default: values.default || false
      };

      // Si el nuevo precio será default, primero removemos el default de los demás
      if (precioData.default) {
        const { error: updateError } = await supabase
          .from('precios')
          .update({ default: false })
          .eq('default', true);

        if (updateError) {
          toast.error('Error al actualizar precios existentes');
          return null;
        }
      }

      const { data, error } = await supabase
        .from('precios')
        .insert(precioData)
        .select()
        .single();

      if (error) {
        toast.error('El precio no se pudo crear, verifica que los datos sean correctos');
        return null;
      }

      if (data) {
        toast.success('Precio creado correctamente');

        // Actualizar el estado local: si el nuevo precio es default, quitar default de los demás
        if (data.default) {
          const updatedPrecios = get().precios.map(p => ({
            ...p,
            default: false
          }));
          set({ precios: [data, ...updatedPrecios] });
        } else {
          set({ precios: [data, ...get().precios] });
        }

        return data;
      }
    } catch (error) {
      toast.error('El precio no se pudo crear');
      return null;
    }
  },

  updatePrecio: async (values, id) => {
    try {
      const precioData: Partial<Precio> = {
        name: values.name,
        price: values.price,
        description: values.description,
        default: values.default || false
      };

      // Si el precio actualizado será default, primero removemos el default de los demás
      if (precioData.default) {
        const { error: updateError } = await supabase
          .from('precios')
          .update({ default: false })
          .eq('default', true)
          .neq('id', id); // Excluir el precio que estamos actualizando

        if (updateError) {
          toast.error('Error al actualizar precios existentes');
          return;
        }
      }

      const { data, error } = await supabase
        .from('precios')
        .update(precioData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Actualizar el estado local: si el precio actualizado es default, quitar default de los demás
        if (data.default) {
          const updatedPrecios = get().precios.map(p =>
            p.id === id ? data : { ...p, default: false }
          );
          set({ precios: updatedPrecios });
        } else {
          set({
            precios: get().precios.map(
              precio => precio.id === id ? data : precio
            )
          });
        }

        toast.success('Precio actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar precio:', error);
      toast.error('El precio no se pudo actualizar');
    }
  },

  deletePrecio: async (id) => {
    try {
      const { data, error } = await supabase
        .from('precios')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast.success('Precio eliminado correctamente');
        set({
          precios: get().precios.filter(
            precio => precio.id !== id
          )
        });
      }
    } catch (error) {
      console.error('Error al eliminar precio:', error);
      toast.error('El precio no se pudo eliminar');
    }
  }
}))