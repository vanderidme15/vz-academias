'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useAuthStore } from "@/lib/store/auth.store";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const pagoFormSchema = z.object({
  payment_amount: z.number().min(0, 'El precio es requerido'),
  payment_method: z.enum(['yape', 'efectivo']),
  payment_code: z.string().optional(),
});

interface PagoFormProps {
  dialogHandlers: DialogHandlers;
  selectedInscripcion: Inscripcion | null;
  onCreate: (data: Record<string, any>, inscripcionId?: string) => Promise<void>;
  onEdit: (data: Record<string, any>, paymentId: string, inscripcionId?: string) => Promise<void>;
}

export function PagoForm({ dialogHandlers, selectedInscripcion, onCreate, onEdit }: PagoFormProps) {
  const { user } = useAuthStore();

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    values.register_by = user?.email;
    await onCreate(values, selectedInscripcion?.id);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    values.register_by = user?.email;
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
      name: 'payment_code',
      label: 'N° de recibo o código de yape',
      type: 'text',
      required: false,
      className: 'col-span-2',
    }
  ];

  return (
    <DynamicForm
      schema={pagoFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='px-2 h-fit'
    />
  )
}