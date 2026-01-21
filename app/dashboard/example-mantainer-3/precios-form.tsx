'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Precio } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const preciosFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  price: z.number().min(0, 'El precio es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  default: z.boolean().default(false),
});

interface PreciosFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Precio | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export function PreciosForm({ dialogHandlers, onCreate, onEdit }: PreciosFormProps) {
  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values, dialogHandlers.selectedItem.id);
    dialogHandlers.setOpenDialog(false);
  }

  // Configuración de formulario
  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el nombre para el precio'
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'integer',
      required: true,
      placeholder: 'Ingresa el precio',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 8,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: false,
      placeholder: 'Ingresa la descripción del precio',
    },
    {
      name: 'default',
      label: '¿Es el precio por defecto?',
      type: 'checkbox',
      required: true,
      placeholder: 'Ej: 25',
    }
  ];

  return (
    <DynamicForm
      schema={preciosFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='px-2 h-fit'
    />
  )
}