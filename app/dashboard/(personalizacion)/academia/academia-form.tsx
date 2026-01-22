'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Academia } from "@/shared/types/supabase.types";
import type { FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";
import { useMemo, useCallback } from "react";

const academiaFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').trim(),
  description: z.string().trim().optional().or(z.literal('')),
  has_registration: z.boolean().default(false),
  registration_price: z.union([
    z.string(),
    z.number()
  ]).transform((val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().nonnegative('El precio debe ser mayor o igual a 0')),
}).superRefine((data, ctx) => {
  if (data.has_registration && (!data.registration_price || data.registration_price <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El precio de la matrícula debe ser mayor a 0',
      path: ['registration_price'],
    });
  }
});


interface AcademiaFormProps {
  academia: Academia | null;
  onEdit: (data: Academia, id: string) => Promise<void>;
}

export default function AcademiaForm({ academia, onEdit }: AcademiaFormProps) {

  const handleEdit = useCallback(async (values: Record<string, any>): Promise<void> => {
    if (!academia?.id) {
      console.error('No se puede editar: ID de academia no disponible');
      return;
    }
    await onEdit(values as Academia, academia.id);
  }, [academia?.id, onEdit]);

  const handleHasRegistrationChange = useCallback((value: boolean, setValue: any) => {
    if (!value) {
      setValue('registration_price', 0, { shouldValidate: true });
    }
  }, []);

  // Configuración de formulario memoizada
  const fields: FieldConfig[] = useMemo(() => [
    {
      name: 'name',
      label: 'Nombre del Curso',
      type: 'text',
      required: true,
      className: 'col-span-4',
      placeholder: 'Ingresa el nombre del curso',
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: false,
      className: 'col-span-4',
      placeholder: 'Describe el curso (opcional)',
    },
    {
      name: 'has_registration',
      label: '¿Tiene matrícula?',
      type: 'checkbox',
      required: false,
      className: 'col-span-4',
      onChange: handleHasRegistrationChange,
    },
    {
      name: 'registration_price',
      label: 'Precio de la matrícula',
      type: 'price',
      required: false,
      className: 'col-span-4',
      dependsOn: { field: 'has_registration', value: true },
      placeholder: '0.00',
    }
  ], [handleHasRegistrationChange]);

  return (
    <DynamicForm
      schema={academiaFormSchema}
      fields={fields}
      onSubmit={handleEdit}
      selectedItem={academia}
      className='w-full grid-cols-4'
    />
  );
}