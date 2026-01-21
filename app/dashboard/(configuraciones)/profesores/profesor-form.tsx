'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Profesor } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const profesorFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
})

interface ProfesorFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Profesor | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export default function ProfesorForm({ dialogHandlers, onCreate, onEdit }: ProfesorFormProps) {
  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values as Profesor);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values as Profesor, dialogHandlers.selectedItem?.id);
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
    }
  ];

  return (
    <DynamicForm
      schema={profesorFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='w-full grid-cols-4'
    />
  )
}