'use client'

import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FieldConfig } from "@/shared/types/ui.types";
import { useState, useEffect } from "react";
import { X, Upload, File, FileText, FileSpreadsheet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldFile({ fieldConfig, formField }: FormFieldProps) {
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size?: number;
    type: string;
    url?: string;
  } | null>(null);

  // Inicializar con la URL existente si viene de la DB
  useEffect(() => {
    if (typeof formField.value === 'string' && formField.value) {
      const url = formField.value;
      const fileName = url.split('/').pop() || 'archivo';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';

      setFileInfo({
        name: fileName,
        type: getTypeFromExtension(extension),
        url: url
      });
    }
  }, [formField.value]);

  const getTypeFromExtension = (extension: string): string => {
    const types: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'csv': 'text/csv',
    };
    return types[extension] || 'application/octet-stream';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="h-8 w-8 text-red-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validar tipo de archivo si está especificado
      if (fieldConfig.accept) {
        const acceptedTypes = fieldConfig.accept.split(',').map(t => t.trim());
        const isValidType = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });

        if (!isValidType) {
          toast.error('Tipo de archivo no permitido');
          return;
        }
      }

      // Validar tamaño (máximo configurable, por defecto 10MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`El archivo debe pesar menos de ${formatFileSize(maxSize)}`);
        return;
      }

      // Guardar información del archivo
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Actualizar el valor del formulario con el File
      formField.onChange(file);
    }
  };

  const handleRemove = () => {
    setFileInfo(null);
    formField.onChange(undefined);
  };

  const handleOpenFile = () => {
    if (fileInfo?.url) {
      window.open(fileInfo.url, '_blank');
    }
  };

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      {fieldConfig.helpText && <FormDescription>{fieldConfig.helpText}</FormDescription>}

      <FormControl>
        <div className="space-y-4">
          {/* Input oculto */}
          <Input
            type="file"
            accept={fieldConfig.accept || "*"}
            onChange={handleFileChange}
            className="hidden"
            id={`file-${fieldConfig.name}`}
          />

          {/* Área de preview o botón de subida */}
          {fileInfo ? (
            <div className="relative w-full">
              <div className="relative w-full overflow-hidden rounded-lg border bg-muted p-4">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 text-muted-foreground">
                    {getFileIcon(fileInfo.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileInfo.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {fileInfo.size && <span>{formatFileSize(fileInfo.size)}</span>}
                      {fileInfo.url && (
                        <>
                          {fileInfo.size && <span>·</span>}
                          <button
                            type="button"
                            onClick={handleOpenFile}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            Ver archivo <ExternalLink className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Botón para cambiar archivo */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => document.getElementById(`file-${fieldConfig.name}`)?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Cambiar archivo
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
                <Upload className="h-8 w-8" />
                <div className="text-sm">
                  <span className="font-semibold">Click para subir</span> o arrastra aquí
                </div>
                <div className="text-xs">
                  {fieldConfig.accept
                    ? `Archivos: ${fieldConfig.accept}`
                    : 'Cualquier tipo de archivo'}
                  {' · '}Máximo {formatFileSize(5 * 1024 * 1024)}
                </div>
              </div>
            </Button>
          )}
        </div>
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}