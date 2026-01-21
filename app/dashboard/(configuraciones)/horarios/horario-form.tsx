'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Horario } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const horarioFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  days: z.array(z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'])).min(1, 'Debes seleccionar al menos un día'),
  start_time: z.string().min(1, 'La hora de inicio es requerida'),
  end_time: z.string().min(1, 'La hora de inicio es requerida'),
})

interface HorarioFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Horario | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export default function HorarioForm({ dialogHandlers, onCreate, onEdit }: HorarioFormProps) {
  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values as Horario);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values as Horario, dialogHandlers.selectedItem?.id);
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
      placeholder: 'Ingresa el nombre para el precio'
    },
    {
      name: 'days',
      label: 'Días',
      type: 'multiple-select',
      required: true,
      className: 'col-span-4',
      options: [
        { label: 'Lunes', value: 'lunes' },
        { label: 'Martes', value: 'martes' },
        { label: 'Miercoles', value: 'miercoles' },
        { label: 'Jueves', value: 'jueves' },
        { label: 'Viernes', value: 'viernes' },
        { label: 'Sabado', value: 'sabado' },
        { label: 'Domingo', value: 'domingo' },
      ]
    },
    {
      name: 'start_time',
      label: 'Hora inicio',
      type: 'time',
      required: true,
      className: 'col-span-2',
      placeholder: 'Hora inicio'
    },
    {
      name: 'end_time',
      label: 'Hora fin',
      type: 'time',
      required: true,
      className: 'col-span-2',
      placeholder: 'Hora fin'
    }
  ];

  return (
    <DynamicForm
      schema={horarioFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='w-full grid-cols-4'
    />
  )
}