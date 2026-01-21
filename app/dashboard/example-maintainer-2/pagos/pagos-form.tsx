'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const pagosFormSchema = z.object({
  payment_amount: z.number().min(0, 'El precio es requerido'),
  payment_method: z.enum(['yape', 'efectivo']),
  payment_recipe_url: z.union([
    z.instanceof(File),
    z.string(),
    z.null(),
    z.undefined()
  ]).optional().nullable(),
  payment_checked: z.boolean().default(false),
});

interface PagosFormProps {
  dialogHandlers: DialogHandlers;
  selectedInscripcion: Inscripcion | null;
  onCreate: (data: Record<string, any>, inscripcionId?: string) => Promise<void>;
  onEdit: (data: Record<string, any>, paymentId: string, inscripcionId?: string) => Promise<void>;
}

export function PagosForm({ dialogHandlers, selectedInscripcion, onCreate, onEdit }: PagosFormProps) {
  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values, selectedInscripcion?.id);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values, dialogHandlers.selectedItem.id, selectedInscripcion?.id);
    dialogHandlers.setOpenDialog(false);
  }

  // Configuración de formulario
  const fields: FieldConfig[] = [
    {
      name: 'payment_amount',
      label: 'Monto',
      type: 'integer',
      required: true,
      placeholder: 'Ingresa el monto del pago',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 8,
    },
    {
      name: 'payment_method',
      label: 'Método de pago',
      type: 'select',
      required: true,
      className: 'col-span-2',
      options: [
        { label: 'Yape', value: 'yape' },
        { label: 'Efectivo', value: 'efectivo' }
      ]
    },
    {
      name: 'payment_recipe_url',
      label: 'Comprobante de pago (imagen)',
      type: 'image',
      required: false,
      className: 'col-span-2',
      accept: 'image/*',
      helpText: 'Sube una captura de tu comprobante de pago'
    },
    {
      name: 'payment_checked',
      label: 'Pago verificado (solo admin)',
      type: 'checkbox',
      required: false,
      className: 'col-span-2',
      defaultValue: false
    }
  ];

  return (
    <DynamicForm
      schema={pagosFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='px-2 h-fit'
    />
  )
}