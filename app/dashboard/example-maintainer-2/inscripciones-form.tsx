'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useAuthStore } from "@/lib/store/auth.store";
import { usePreciosStore } from "@/lib/store/precios.store";
import { isValidPeruDni } from "@/lib/utils-functions/dni-validator";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { useMemo } from "react";
import { z } from "zod";

const inscripcionesFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  dni: z
    .string()
    .trim()
    .refine(isValidPeruDni, {
      message: 'DNI inválido (debe tener 8 dígitos)',
    }),
  age: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return null;
        const numValue = parseInt(val, 10);
        return isNaN(numValue) ? null : numValue;
      }
      return val;
    })
    .pipe(
      z.number({
        required_error: 'La edad es requerida',
        invalid_type_error: 'La edad debe ser un número válido'
      })
        .int('La edad debe ser un número entero')
        .min(14, 'La edad mínima es de 14 años')
        .max(80, 'La edad no puede superar 80 años')
    ),
  height: z
    .union([z.number(), z.string(), z.bigint()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return null;
        const numValue = parseInt(val.replace(/[^\d]/g, ''), 10);
        return isNaN(numValue) ? null : numValue;
      }
      if (typeof val === 'bigint') {
        return Number(val);
      }
      return val;
    })
    .pipe(
      z.number({
        required_error: 'La estatura es requerida',
        invalid_type_error: 'La estatura debe ser un número válido'
      })
        .int('La estatura debe ser un número entero')
        .min(50, 'La estatura debe estar entre 50cm y 250cm')
        .max(250, 'La estatura debe estar entre 50cm y 250cm')
    ),
  gender: z.enum(['varon', 'mujer']),
  shirt_size: z.enum(['s', 'm', 'l', 'xl']),
  is_under_18: z.boolean().default(false),
  cellphone_number: z
    .string()
    .min(1, "El número de celular es requerido")
    .regex(/^\d{9}$/, "El número debe tener exactamente 9 dígitos numéricos"),
  parent_name: z.string().optional().nullable().transform(val => val || undefined),
  parent_cellphone_number: z
    .string()
    .optional()
    .nullable()
    .transform(val => val || undefined),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  }),
  observations: z.string().optional().nullable().transform(val => val || undefined),
  // Campos opcionales que pueden venir de la BD pero no se editan directamente
  price_id: z.string().uuid().optional().nullable(),
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
    if (!data.parent_cellphone_number || data.parent_cellphone_number.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número del padre/tutor es requerido para menores de 18 años',
        path: ['parent_cellphone_number'],
      });
    } else if (data.parent_cellphone_number.length < 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número del padre/tutor debe tener al menos 9 dígitos',
        path: ['parent_cellphone_number'],
      });
    }
  }

  // Validar cellphone_number si está presente
  if (data.cellphone_number && data.cellphone_number.length > 0 && data.cellphone_number.length < 9) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El número de celular debe tener al menos 9 dígitos',
      path: ['cellphone_number'],
    });
  }
});

interface InscripcionesFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Inscripcion | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export function InscripcionesForm({ dialogHandlers, onCreate, onEdit }: InscripcionesFormProps) {
  const { user } = useAuthStore();
  const { precios } = usePreciosStore();

  const preciosOptions = useMemo(() => {
    return precios.map((precio) => ({
      label: `${precio.name} - S/ ${precio.price}` || '',
      value: precio.id || '',
    }));
  }, [precios]);

  const precioDefault = useMemo(() => {
    return precios.find((precio) => precio.default);
  }, [precios]);

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    const valuesToCreate = {
      ...values,
      register_by: user?.email
    }
    const result = await onCreate(valuesToCreate);
    if (result) {
      dialogHandlers.setSelectedItem(result);
    }
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values, dialogHandlers.selectedItem.id);
  }

  // 🎯 Función para manejar cambio de edad
  const handleAgeChange = (age: number, setValue: any, getValues: any) => {
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
      label: 'Nombre completo',
      type: 'text',
      required: true,
      className: 'col-span-3',
      placeholder: 'Ingresa tu nombre completo'
    },
    {
      name: 'gender',
      label: 'Género',
      type: 'radio',
      required: true,
      className: 'col-span-3',
      placeholder: 'Selecciona el género',
      options: [
        { label: 'Varón', value: 'varon' },
        { label: 'Mujer', value: 'mujer' },
      ],
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: true,
      className: 'col-span-3 md:col-span-2',
      placeholder: 'Ingresa tu DNI',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 8,
    },
    {
      name: 'cellphone_number',
      label: 'Número de celular',
      type: 'text',
      required: true,
      className: 'col-span-3 md:col-span-1',
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
      className: 'col-span-3 md:col-span-1',
      placeholder: 'Ej: 25',
      onChange: handleAgeChange
    },
    {
      name: 'height',
      label: 'Estatura (cm)',
      type: 'height',
      required: true,
      className: 'col-span-3 md:col-span-1',
      placeholder: 'Ej: 170',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 3,
    },
    {
      name: 'shirt_size',
      label: 'Talla de polo',
      type: 'select',
      required: true,
      className: 'col-span-3 md:col-span-1',
      placeholder: 'Selecciona la talla',
      options: [
        { label: 'S', value: 's' },
        { label: 'M', value: 'm' },
        { label: 'L', value: 'l' },
        { label: 'XL', value: 'xl' },
      ],
    },
    {
      name: 'is_under_18',
      label: '¿Es menor de 18 años?',
      type: 'checkbox',
      required: false,
      className: 'col-span-2 md:col-span-1 items-end border-none hidden',
      defaultValue: false,
      disabled: true
    },
    {
      name: 'parent_name',
      label: 'Nombre del padre/tutor',
      type: 'text',
      required: true,
      className: 'col-span-3 md:col-span-2',
      placeholder: 'Requerido si es menor de 18 años',
      dependsOn: { field: 'is_under_18', value: true }
    },
    {
      name: 'parent_cellphone_number',
      label: 'Celular del padre/tutor',
      type: 'text',
      required: true,
      className: 'col-span-3 md:col-span-1',
      placeholder: '987654321',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 9,
      dependsOn: { field: 'is_under_18', value: true },
    },
    {
      name: 'price_id',
      label: 'Precio',
      type: 'select',
      required: false,
      className: 'col-span-3',
      options: preciosOptions,
      defaultValue: precioDefault?.id,
    },
    {
      name: 'terms_accepted',
      label: 'Acepto los términos y condiciones',
      type: 'checkbox',
      required: true,
      className: 'col-span-3',
      defaultValue: false
    },
    {
      name: 'observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      className: 'col-span-3',
      placeholder: 'Anotar aqui incidencias',
    }
  ];

  return (
    <DynamicForm
      schema={inscripcionesFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='w-full grid-cols-3'
    />
  )
}