'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Periodo } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const periodoFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  start_date: z.coerce.date({
    required_error: 'La fecha de inicio es requerida',
    invalid_type_error: 'Fecha de inicio inválida',
  }),
  end_date: z.coerce.date({
    required_error: 'La fecha de fin es requerida',
    invalid_type_error: 'Fecha de fin inválida',
  }),
  is_active: z.boolean().default(false),
}).refine((data) => data.end_date > data.start_date, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['end_date'],
})

interface PeriodoFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Periodo | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export default function PeriodoForm({ dialogHandlers, onCreate, onEdit }: PeriodoFormProps) {
  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values as Periodo);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values as Periodo, dialogHandlers.selectedItem?.id);
    dialogHandlers.setOpenDialog(false);
  }

  // Configuración de formulario
  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      className: 'col-span-4',
      placeholder: 'Ingresa el nombre para el periodo'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: false,
      className: 'col-span-4',
      placeholder: 'Ingresa la descripción para el periodo'
    },
    {
      name: 'start_date',
      label: 'Fecha inicio',
      type: 'date',
      required: true,
      className: 'col-span-2',
      placeholder: 'Fecha inicio'
    },
    {
      name: 'end_date',
      label: 'Fecha fin',
      type: 'date',
      required: true,
      className: 'col-span-2',
      placeholder: 'Fecha fin'
    },
    {
      name: 'is_active',
      label: 'Activo',
      type: 'checkbox',
      required: false,
      className: 'col-span-4',
      placeholder: 'Activo'
    }
  ];

  return (
    <DynamicForm
      schema={periodoFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='w-full grid-cols-4'
    />
  )
}