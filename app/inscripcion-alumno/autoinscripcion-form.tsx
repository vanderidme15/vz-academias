'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Button } from "@/components/ui/button";
import { isValidPeruDni } from "@/lib/utils-functions/dni-validator";
import { Precio } from "@/shared/types/supabase.types";
import type { FieldConfig } from "@/shared/types/ui.types";
import { CopyIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";

interface AutoinscripcionFormProps {
  onCreate: (data: Record<string, any>) => Promise<void>;
  defaultPrecio: Precio | null;
  setStep: (step: number) => void;
}

export function AutoinscripcionForm({ onCreate, defaultPrecio, setStep }: AutoinscripcionFormProps) {
  // Schema dentro del componente para acceder a defaultPrecio
  const autoinscripcionesFormSchema = z.object({
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
          .max(90, 'La edad no puede superar 90 años')
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
    payment_amount: z
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
          required_error: 'El monto a pagar es requerido',
          invalid_type_error: 'El monto a pagar debe ser un número válido'
        })
          .int('El monto a pagar debe ser un número entero')
          .min(50, 'El monto a pagar debe ser mayor a 50 soles')
          .max(
            defaultPrecio?.price ?? 220,
            `El monto a pagar debe ser menor o igual a ${defaultPrecio?.price ?? 220} soles`
          )
      ),
    payment_recipe_url: z
      .union([
        z.instanceof(File),
        z.string(),
        z.undefined(),
      ])
      .refine((val) => {
        if (!val) return false
        if (val instanceof File) return true
        if (typeof val === 'string') return val.trim().length > 0
        return false
      }, {
        message: 'El comprobante de pago es obligatorio',
      }),
    parent_name: z.string().optional().nullable().transform(val => val || undefined),
    parent_cellphone_number: z
      .string()
      .optional()
      .nullable()
      .transform(val => val || undefined),
    terms_accepted: z.boolean().refine(val => val === true, {
      message: 'Debes aceptar los términos y condiciones'
    }),
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
      }
    }
  });

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values);
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

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.info("Número copiado al portapapeles");
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
      required: false,
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
      label: 'Estatura',
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
      className: 'col-span-3 items-end border-none hidden',
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
      name: "payment_amount",
      label: "Selecciona el monto",
      type: "radio", // o el tipo que uses para radio
      required: true,
      className: 'col-span-3',
      options: [
        { label: "Reserva S/50", value: "50" },
        { label: `Total S/${defaultPrecio?.price ?? 220}`, value: `${defaultPrecio?.price ?? 220}` },
      ]
    },
    {
      name: 'payment_recipe_url',
      label: 'Comprobante de pago yape (imagen)',
      type: 'image',
      required: true,
      className: 'col-span-3',
      accept: 'image/*',
      helpText: 'Sube una captura de tu comprobante de pago, recuerda que el monto que seleccionaste debe ser igual al monto que aparece en tu comprobante'
    },
    {
      name: 'terms_accepted',
      label: <div className="w-full flex gap-1">
        <span>Acepto los términos y Condiciones</span>
        <Link href="/terminos-condiciones" target="_blank" className="flex items-center gap-1 hover:underline"><ExternalLink size={14} /></Link>
      </div>,
      type: 'checkbox',
      required: true,
      className: 'col-span-3',
      defaultValue: false
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <div className="flex w-full justify-center gap-2">
        <div onClick={() => handleCopyNumber("950569436")} className="flex flex-col items-center gap-px bg-slate-100 px-2 py-2 rounded border border-gray-200 cursor-pointer">
          <figure className="w-24 h-24">
            <img src="/qrs/plin.jpg" alt="" className="w-full h-auto object-contain" />
          </figure>
          <div>José Mamani - Plin</div>
          <div className="flex gap-2 items-center">950569436 <CopyIcon /></div>
        </div>
        <div onClick={() => handleCopyNumber("956890060")} className="flex flex-col items-center gap-px bg-slate-100 px-2 py-2 rounded border border-gray-200 cursor-pointer">
          <figure className="w-24 h-24">
            <img src="/qrs/yape.jpg" alt="" className="w-full h-auto object-contain" />
          </figure>
          <div>Victor Atamari - Yape</div>
          <div className="flex gap-2 items-center">956890060 <CopyIcon /></div>
        </div>
      </div>
      <DynamicForm
        buttonLabel="Inscribirse"
        buttonSize="cta"
        buttonVariant="cta"
        schema={autoinscripcionesFormSchema}
        fields={fields}
        onSubmit={handleCreate}
        selectedItem={null}
        className='grid-cols-3'
      />
      <Button onClick={() => setStep(1)} variant="outline" className="w-fit">Volver</Button>
    </div>
  )
}