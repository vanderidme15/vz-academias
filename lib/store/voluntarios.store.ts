import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../supabase/client"
import { Voluntario } from "@/shared/types/supabase.types";

let voluntariosChannel: ReturnType<typeof supabase.channel> | null = null
const supabase = createClient();

// 🔧 Función helper para subir imágenes a Supabase Storage
const uploadPaymentRecipe = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `payment-recipes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('inscripciones') // 📦 Nombre de tu bucket en Supabase Storage
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error al subir imagen:', uploadError);
      toast.error('No se pudo subir el comprobante');
      return null;
    }

    // 🔗 Obtener URL pública
    const { data } = supabase.storage
      .from('inscripciones')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error en uploadPaymentRecipe:', error);
    toast.error('Error al procesar la imagen');
    return null;
  }
};

// 🗑️ Función helper para eliminar imagen anterior
const deletePaymentRecipe = async (url: string): Promise<void> => {
  try {
    // Extraer el path del URL público
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // El path generalmente es: /storage/v1/object/public/inscripciones/payment-recipes/filename.jpg
    const bucketIndex = pathParts.indexOf('inscripciones');
    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      await supabase.storage
        .from('inscripciones')
        .remove([filePath]);
    }
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    // No mostramos toast aquí porque es una operación silenciosa
  }
};

type VoluntariosStore = {
  voluntarios: Voluntario[]

  fetchVoluntarios: () => Promise<void>
  fetchVoluntarioById: (id: string) => Promise<Voluntario | null>
  createVoluntario: (values: any) => Promise<Voluntario | null>
  updateVoluntario: (values: any, id: string) => Promise<void>
  deleteVoluntario: (id: string) => Promise<void>
  deleteSoftVoluntario: (id: string) => Promise<void>

  handleCheckInVoluntario: (id: string) => Promise<void>

  subscribeToVoluntarios: () => void
  unsubscribeFromVoluntarios: () => void
}

export const useVoluntariosStore = create<VoluntariosStore>((set, get) => ({
  voluntarios: [],

  fetchVoluntarios: async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por más reciente

      if (error) throw error;

      set({ voluntarios: data ?? [] });
    } catch (error) {
      console.error('Error al obtener voluntarios:', error);
      toast.error('No se pudieron cargar los voluntarios');
    }
  },

  fetchVoluntarioById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error al obtener voluntario por ID:', error);
      toast.error('No se pudo cargar el voluntario');
      return null;
    }
  },

  createVoluntario: async (values) => {
    try {
      let paymentRecipeUrl = values.payment_recipe_url;

      // 📤 Si hay un archivo File, subirlo primero
      if (values.payment_recipe_url instanceof File) {
        paymentRecipeUrl = await uploadPaymentRecipe(values.payment_recipe_url);
        if (!paymentRecipeUrl) {
          return null; // Ya se mostró el error en uploadPaymentRecipe
        }
      }

      // 📝 Preparar datos para insertar
      const voluntarioData: Partial<Voluntario> = {
        name: values.name,
        dni: values.dni,
        cellphone_number: values.cellphone_number || null,
        commission: values.commission,
        age: values.age,
        is_under_18: values.is_under_18 || false,
        payment_method: values.payment_method,
        payment_recipe_url: paymentRecipeUrl || null,
        payment_checked: values.payment_checked || false,
        parent_name: values.parent_name || null,
        parent_cellphone_number: values.parent_cellphone_number || null,
        terms_accepted: values.terms_accepted || false,
        shirt_size: values.shirt_size || null,
        gender: values.gender || null,
        observations: values.observations || null,
        register_by: values.register_by || null
      };

      const { data, error } = await supabase
        .from('voluntarios')
        .insert(voluntarioData)
        .select()
        .single();

      if (error) {
        if (error.code == '23505') {
          toast.error('Ya existe una inscripción con el mismo DNI');
          return null;
        }
        toast.error('La inscripción no se pudo registrar, verifica que los datos sean correctos');
        return null;
      };

      // El realtime se encargará de actualizar el estado
      // Pero mantenemos esto por si acaso el realtime no está activo
      if (data && !voluntariosChannel) {
        toast.success('Voluntario creado correctamente');
        set({ voluntarios: [data, ...get().voluntarios] });
        return data;
      }
    } catch (error) {
      toast.error('El voluntario no se pudo crear');
      return null;
    }
  },

  updateVoluntario: async (values, id) => {
    try {
      let paymentRecipeUrl = values.payment_recipe_url;

      // 📤 Si hay un nuevo archivo File, subirlo
      if (values.payment_recipe_url instanceof File) {
        // 🗑️ Obtener la inscripción actual para eliminar la imagen anterior
        const currentVoluntario = get().voluntarios.find(i => i.id === id);
        if (currentVoluntario?.payment_recipe_url) {
          await deletePaymentRecipe(currentVoluntario.payment_recipe_url);
        }

        paymentRecipeUrl = await uploadPaymentRecipe(values.payment_recipe_url);
        if (!paymentRecipeUrl) {
          return; // Ya se mostró el error en uploadPaymentRecipe
        }
      }

      // 📝 Preparar datos para actualizar
      const voluntarioData: Partial<Voluntario> = {
        name: values.name,
        dni: values.dni,
        cellphone_number: values.cellphone_number || null,
        commission: values.commission,
        age: values.age,
        is_under_18: values.is_under_18 || false,
        payment_method: values.payment_method,
        payment_recipe_url: paymentRecipeUrl || null,
        payment_checked: values.payment_checked || false,
        parent_name: values.parent_name || null,
        parent_cellphone_number: values.parent_cellphone_number || null,
        shirt_size: values.shirt_size || null,
        gender: values.gender || null,
        observations: values.observations || null,
        terms_accepted: values.terms_accepted || false,
      };

      const { data, error } = await supabase
        .from('voluntarios')
        .update(voluntarioData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast.success('Voluntario actualizado correctamente');
      }

      // El realtime se encargará de actualizar el estado
      if (data && !voluntariosChannel) {
        set({
          voluntarios: get().voluntarios.map(
            voluntario => voluntario.id === id ? data : voluntario
          )
        });
      }
    } catch (error) {
      console.error('Error al actualizar voluntario:', error);
      toast.error('El voluntario no se pudo actualizar');
    }
  },

  deleteVoluntario: async (id) => {
    try {
      // 🗑️ Obtener la inscripción para eliminar su imagen si existe
      const voluntarioToDelete = get().voluntarios.find(i => i.id === id);

      const { data, error } = await supabase
        .from('voluntarios')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 🗑️ Eliminar imagen asociada si existe
      if (voluntarioToDelete?.payment_recipe_url) {
        await deletePaymentRecipe(voluntarioToDelete.payment_recipe_url);
      }

      if (data) {
        toast.success('Voluntario eliminado correctamente');
      }

      // El realtime se encargará de actualizar el estado
      if (data && !voluntariosChannel) {
        set({
          voluntarios: get().voluntarios.filter(
            voluntario => voluntario.id !== id
          )
        });
      }
    } catch (error) {
      console.error('Error al eliminar voluntario:', error);
      toast.error('El voluntario no se pudo eliminar');
    }
  },

  deleteSoftVoluntario: async (id) => {
    const voluntarioToDelete = get().voluntarios.find(i => i.id === id);
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .update({ is_active: voluntarioToDelete?.is_active ? false : true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast.success('Voluntario cancelado correctamente');
      }

      // El realtime se encargará de actualizar el estado
      if (data && !voluntariosChannel) {
        set({
          voluntarios: get().voluntarios.map(
            voluntario => voluntario.id === id ? data : voluntario
          )
        });
      }
    } catch (error) {
      console.error('Error al cancelar voluntario:', error);
      toast.error('El voluntario no se pudo cancelar');
    }
  },

  handleCheckInVoluntario: async (id) => {
    try {
      // Verificar que el ID sea válido
      if (!id) {
        toast.error('ID de voluntario no válido');
        return;
      }

      // Intentar buscar el voluntario en el estado local
      let voluntarioToCheckIn = get().voluntarios.find(v => v.id === id);

      // Si no está en el estado local, buscarlo en la base de datos
      if (!voluntarioToCheckIn) {
        const { data: voluntarioDb, error: fetchError } = await supabase
          .from('voluntarios')
          .select()
          .eq('id', id)
          .single();

        if (fetchError || !voluntarioDb) {
          toast.error('Voluntario no encontrado');
          console.error('Error al buscar voluntario:', fetchError);
          return;
        }

        voluntarioToCheckIn = voluntarioDb;
      }

      // Realizar la actualización
      const { data, error } = await supabase
        .from('voluntarios')
        .update({ is_active: !voluntarioToCheckIn?.is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error de Supabase al checkear voluntario:', error);
        throw error;
      }

      // Verificar que se recuperó el voluntario actualizado
      if (!data) {
        throw new Error('No se recibieron datos del voluntario actualizado');
      }

      toast.success(`Voluntario ${data.is_active ? 'activado' : 'desactivado'} correctamente`);

      // Actualizar el estado local solo si no hay canal de realtime activo
      if (!voluntariosChannel) {
        const voluntarioExisteEnEstado = get().voluntarios.some(v => v.id === id);

        if (voluntarioExisteEnEstado) {
          // Actualizar voluntario existente
          set({
            voluntarios: get().voluntarios.map(
              voluntario => voluntario.id === id ? data : voluntario
            )
          });
        } else {
          // Agregar voluntario nuevo al estado
          set({
            voluntarios: [...get().voluntarios, data]
          });
        }
      }

      return data;

    } catch (error) {
      console.error('Error al checkear voluntario:', error);
      toast.error(
        error instanceof Error
          ? `Error: ${error.message}`
          : 'El voluntario no se pudo checkear'
      );
      throw error;
    }
  },

  subscribeToVoluntarios: () => {
    voluntariosChannel = supabase
      .channel('voluntarios-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'voluntarios',
      }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          set({ voluntarios: [payload.new, ...get().voluntarios] });
        } else if (payload.eventType === 'UPDATE') {
          set({
            voluntarios: get().voluntarios.map(
              voluntario => voluntario.id === payload.new.id ? payload.new : voluntario
            )
          });
        } else if (payload.eventType === 'DELETE') {
          set({
            voluntarios: get().voluntarios.filter(
              voluntario => voluntario.id !== payload.old.id
            )
          });
        }
      })
      .subscribe();
  },

  unsubscribeFromVoluntarios: () => {
    if (voluntariosChannel) {
      voluntariosChannel.unsubscribe();
      voluntariosChannel = null;
    }
  },
}))