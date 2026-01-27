'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { isValidPeruDni } from "@/lib/utils-functions/dni-validator";
import { Alumno } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const alumnoFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  dni: z
    .string()
    .trim()
    .refine(isValidPeruDni, {
      message: 'DNI inválido (debe tener 8 dígitos)',
    }),
  address: z.string().optional().nullable().transform(val => val || undefined),
  school_name: z.string().optional().nullable().transform(val => val || undefined),
  age: z
    .union([z.number(), z.string()])
    .transform((val) => {
      // Si es string, convertir a número
      if (typeof val === 'string') {
        // Si está vacío, lanzar error
        if (val.trim() === '') {
          return NaN; // Esto fallará en la validación del pipe
        }
        const numValue = parseInt(val, 10);
        return numValue;
      }
      return val;
    })
    .pipe(
      z.number({
        required_error: 'La edad es requerida',
        invalid_type_error: 'La edad debe ser un número válido'
      })
        .min(1, 'La edad mínima es de 1 año')
        .max(120, 'La edad no puede superar 120 años')
    ),
  is_under_18: z.boolean().default(false),
  gender: z.enum(['varon', 'dama'], {
    errorMap: () => ({ message: 'Debes seleccionar un género' })
  }),
  cellphone: z
    .string()
    .min(1, "El número de celular es requerido")
    .regex(/^\d{9}$/, "El número debe tener exactamente 9 dígitos numéricos"),
  parent_name: z.string().optional().nullable().transform(val => val || undefined),
  parent_cellphone: z
    .string()
    .optional()
    .nullable()
    .transform(val => val || undefined),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  }),
  observations: z.string().optional().nullable().transform(val => val || undefined),
}).superRefine((data, ctx) => {
  // Validar campos del padre si es menor de 18
  if (data.is_under_18) {
    if (!data.parent_name || data.parent_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre del padre/tutor es requerido para menores de 18 años',
        path: ['parent_name'],
      });
    }
    if (!data.parent_cellphone || data.parent_cellphone.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número del padre/tutor es requerido para menores de 18 años',
        path: ['parent_cellphone'],
      });
    }
  }
});

interface AlumnoFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Alumno | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export default function AlumnoForm({ dialogHandlers, onCreate, onEdit }: AlumnoFormProps) {
  const { user } = useAuth();

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    values.register_by = user?.email;
    await onCreate(values as Alumno);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values as Alumno, dialogHandlers.selectedItem?.id);
    dialogHandlers.setOpenDialog(false);
  }

  const handleAgeChange = (age: number, setValue: any) => {
    const isUnder18 = age < 18;
    setValue('is_under_18', isUnder18, { shouldValidate: true });

    // Si pasa a ser mayor de 18, limpiar campos del padre
    if (!isUnder18) {
      setValue('parent_name', '', { shouldValidate: true });
      setValue('parent_cellphone_number', '', { shouldValidate: true });
    }
  }

  // Configuración de formulario
  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      className: 'col-span-4',
      placeholder: 'Ingresa el nombre para el precio'
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: true,
      className: 'col-span-2',
      placeholder: 'Ingresa tu DNI',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 8,
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'text',
      required: false,
      className: 'col-span-2',
      placeholder: 'Ingresa tu dirección',
    },
    {
      name: 'school_name',
      label: 'Institución educativa',
      type: 'text',
      required: false,
      className: 'col-span-4',
      placeholder: 'Ingresa el nombre de la institución educativa',
    },
    {
      name: 'cellphone',
      label: 'Celular',
      type: 'text',
      required: true,
      className: 'col-span-2',
      placeholder: '987654321',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 9,
    },
    {
      name: 'age',
      label: 'Edad',
      type: 'integer',
      required: true,
      className: 'col-span-2',
      placeholder: 'Ej: 25',
      onChange: handleAgeChange // 🎯 Añadir handler
    },
    {
      name: 'is_under_18',
      label: '¿Es menor de 18 años?',
      type: 'checkbox',
      required: false,
      className: 'col-span-4 items-end border-none hidden', //oculto
      defaultValue: false,
      disabled: true
    },
    {
      name: 'gender',
      label: 'Género',
      type: 'radio',
      required: true,
      className: 'col-span-4',
      options: [
        { label: 'Varon', value: 'varon' },
        { label: 'Dama', value: 'dama' }
      ]
    },
    {
      name: 'parent_name',
      label: 'Nombre del padre ó tutor',
      type: 'text',
      required: true,
      className: 'col-span-2',
      placeholder: 'Requerido si es menor de 18 años',
      dependsOn: { field: 'is_under_18', value: true } // 👁️ Solo visible si es menor
    },
    {
      name: 'parent_cellphone',
      label: 'Número del padre ó tutor',
      type: 'text',
      required: true,
      className: 'col-span-2',
      placeholder: 'Requerido si es menor de 18 años',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 9,
      dependsOn: { field: 'is_under_18', value: true } // 👁️ Solo visible si es menor
    },
    {
      name: 'terms_accepted',
      label: 'Acepto los términos y condiciones',
      type: 'checkbox',
      required: true,
      className: 'col-span-4',
      defaultValue: false
    },
    {
      name: 'observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      className: 'col-span-4',
      placeholder: 'Anotar aqui incidencias',
    }
  ];

  return (
    <DynamicForm
      schema={alumnoFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='w-full grid-cols-4'
    />
  )
}