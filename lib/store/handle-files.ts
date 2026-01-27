import { createClient } from "../supabase/client";
import { toast } from "sonner";

const supabase = createClient();


// 🔧 Función helper para subir imágenes a Supabase Storage
export const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${file.name.split('.')[0].trim().replace(/\s/g, '-')}-${Date.now()}.${fileExt}`;
    const filePath = `assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('academia') // 📦 Nombre de tu bucket en Supabase Storage
      .upload(filePath, file);

    if (uploadError) {
      toast.error('No se pudo subir el comprobante');
      return null;
    }

    // 🔗 Obtener URL pública
    const { data } = supabase.storage
      .from('academia')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error en asset file:', error);
    toast.error('Error al procesar el archivo');
    return null;
  }
};

// 🗑️ Función helper para eliminar imagen anterior
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extraer el path del URL público
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // El path generalmente es: /storage/v1/object/public/inscripciones/payment-recipes/filename.jpg
    const bucketIndex = pathParts.indexOf('academia');
    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      await supabase.storage
        .from('academia')
        .remove([filePath]);
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
  }
};

// Helper para verificar si es un File (reutilizable)
export const isFile = (value: any): value is File => {
  return value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'name' in value &&
    'size' in value &&
    'type' in value;
};