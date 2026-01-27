import { create } from "zustand"
import { toast } from "sonner"
import { createClient } from "../supabase/client"
import { Academia } from "@/shared/types/supabase.types";
import { deleteFile, isFile, uploadFile } from "./handle-files";

const supabase = createClient();

// Primero, define el tipo de los valores
interface UpdateAcademiaValues {
  logo_url?: File | string | null;
  terms_file_url?: File | string | null;
  [key: string]: any; // Para otros campos
}

type AcademiaStore = {
  academia: Academia | null
  fetchAcademiaById: (id?: string) => Promise<Academia | null>
  fetchAcademiaByDomain: (domain?: string) => Promise<Academia | null>
  updateAcademia: (values: Academia, id: string) => Promise<void>
}

export const useAcademiaStore = create<AcademiaStore>((set, get) => ({
  academia: null,

  fetchAcademiaById: async (id?: string) => {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('academias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        set({
          academia: data
        });
      }
      return data;
    } catch (error) {
      toast.error('No se pudo cargar el horario');
      return null;
    }
  },

  fetchAcademiaByDomain: async (domain?: string) => {
    if (!domain) return null;
    try {
      const { data, error } = await supabase
        .from('academias')
        .select('*')
        .contains('main_domain_url', [domain])
        .single();

      if (error) throw error;
      if (data) {
        set({
          academia: data
        });
      }
      return data;
    } catch (error) {
      toast.error('No se pudo cargar el horario');
      return null;
    }
  },

  updateAcademia: async (values: UpdateAcademiaValues, id: string) => {
    try {
      const currentAcademia = get().academia;
      let logoUrl = values.logo_url;
      let termsFileUrl = values.terms_file_url;

      // ===== MANEJO DEL LOGO =====
      if (isFile(values.logo_url)) {
        // Caso 1: Usuario subió un nuevo archivo
        if (currentAcademia?.logo_url) {
          await deleteFile(currentAcademia.logo_url);
        }
        const uploadedLogoUrl = await uploadFile(values.logo_url);
        if (!uploadedLogoUrl) {
          toast.error('No se pudo subir el logo');
          return;
        }
        logoUrl = uploadedLogoUrl;
      } else if (typeof values.logo_url === 'string') {
        // Caso 2: Usuario mantiene el logo existente (URL string)
        logoUrl = values.logo_url;
      } else if (values.logo_url === null || values.logo_url === undefined) {
        // Caso 3: Usuario eliminó el logo
        if (currentAcademia?.logo_url) {
          await deleteFile(currentAcademia.logo_url);
        }
        logoUrl = null;
      }

      // ===== MANEJO DEL ARCHIVO DE TÉRMINOS =====
      if (isFile(values.terms_file_url)) {
        // Caso 1: Usuario subió un nuevo archivo
        if (currentAcademia?.terms_file_url) {
          await deleteFile(currentAcademia.terms_file_url);
        }
        const uploadedTermsFileUrl = await uploadFile(values.terms_file_url);
        if (!uploadedTermsFileUrl) {
          toast.error('No se pudo subir el archivo de términos y condiciones');
          // IMPORTANTE: Si ya subimos el logo, deberíamos revertir
          // o decidir si guardamos solo el logo
          return;
        }
        termsFileUrl = uploadedTermsFileUrl;
      } else if (typeof values.terms_file_url === 'string') {
        // Caso 2: Usuario mantiene el archivo existente
        termsFileUrl = values.terms_file_url;
      } else if (values.terms_file_url === null || values.terms_file_url === undefined) {
        // Caso 3: Usuario eliminó el archivo
        if (currentAcademia?.terms_file_url) {
          await deleteFile(currentAcademia.terms_file_url);
        }
        termsFileUrl = null;
      }

      const { data, error } = await supabase
        .from('academias')
        .update({
          ...values,
          logo_url: logoUrl,
          terms_file_url: termsFileUrl
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({ academia: data });
        toast.success('Academia actualizada correctamente');
      }
    } catch (error) {
      console.error('Error actualizando academia:', error);
      toast.error('La academia no se pudo actualizar');
    }
  }
}))