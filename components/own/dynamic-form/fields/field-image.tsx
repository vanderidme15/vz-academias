'use client'

import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FieldConfig } from "@/shared/types/ui.types";
import { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldImage({ fieldConfig, formField }: FormFieldProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof formField.value === 'string' ? formField.value : null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo debe pesar menos de 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Actualizar el valor del formulario con el File
      formField.onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    formField.onChange(undefined);
  };

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      {fieldConfig.helpText && <FormDescription>{fieldConfig.helpText}</FormDescription>}

      <FormControl>
        <div className="space-y-4 h-fit">
          {/* Input oculto */}
          <Input
            type="file"
            accept={fieldConfig.accept || "image/*"}
            onChange={handleFileChange}
            className="hidden"
            id={`file-${fieldConfig.name}`}
          />

          {/* Área de preview o botón de subida */}
          {preview ? (
            <div className="relative w-full">
              <div className="relative aspect-video w-full max-h-44 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-4 top-4 h-8 w-8 rounded-full"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Botón para cambiar imagen */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => document.getElementById(`file-${fieldConfig.name}`)?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Cambiar imagen
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full h-32 border-dashed"
              onClick={() => document.getElementById(`file-${fieldConfig.name}`)?.click()}
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
                <div className="text-sm">
                  <span className="font-semibold">Click para subir</span> o arrastra aquí
                </div>
                <div className="text-xs">PNG, JPG hasta 5MB</div>
              </div>
            </Button>
          )}
        </div>
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}