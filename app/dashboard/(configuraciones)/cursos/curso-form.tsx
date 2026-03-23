'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store";
import { Curso } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { useEffect } from "react";
import { z } from "zod";

const cursoFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  total_classes: z.coerce.number().min(1, 'Debe haber al menos 1 clase'),
  price: z.union([
    z.string().min(1, 'El precio es requerido'),
    z.number()
  ]).transform((val) => {
    if (val === '' || val === null || val === undefined) return NaN;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? NaN : num;
  }).pipe(z.number({ invalid_type_error: 'El precio es requerido' }).nonnegative('El precio debe ser mayor o igual a 0')),
  teacher_id: z.string().min(1, 'El profesor es requerido'),
  schedule_days: z.array(z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'])).min(1, 'Debes seleccionar al menos un día'),
  schedule_start_time: z.string().min(1, 'La hora de inicio es requerida'),
  schedule_end_time: z.string().min(1, 'La hora de fin es requerida'),
  // schedule_id: z.string().min(1, 'El horario es requerido'),
  color: z.string().optional(),
})

interface CursoFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Curso | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export default function CursoForm({ dialogHandlers, onCreate, onEdit }: CursoFormProps) {
  const { profesores, fetchProfesores } = useProfesoresStore();

  useEffect(() => {
    fetchProfesores();
  }, [fetchProfesores]);

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values as Curso);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values as Curso, dialogHandlers.selectedItem?.id);
    dialogHandlers.setOpenDialog(false);
  }

  // Configuración de formulario
  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre del Curso',
      type: 'text',
      required: true,
      className: 'col-span-4',
    },
    {
      name: 'teacher_id',
      label: 'Profesor',
      type: 'select',
      required: true,
      className: 'col-span-4',
      placeholder: 'Selecciona un profesor',
      options: profesores.map(profesor => ({
        value: profesor.id!,
        label: profesor.name!
      }))
    },
    {
      name: 'schedule_days',
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
      name: 'schedule_start_time',
      label: 'Hora de Inicio',
      type: 'time',
      required: true,
      className: 'col-span-2',
    },
    {
      name: 'schedule_end_time',
      label: 'Hora de Fin',
      type: 'time',
      required: true,
      className: 'col-span-2',
    },
    {
      name: 'total_classes',
      label: 'Número de Clases Base',
      type: 'integer',
      required: true,
      className: 'col-span-2',
      placeholder: 'Ej: 12'
    },
    {
      name: 'price',
      label: 'Precio (S/) Base',
      type: 'price',
      required: true,
      className: 'col-span-2',
      placeholder: 'Ej: 150.00'
    },
    {
      name: 'color',
      label: 'Color del curso',
      type: 'color',
      required: false,
      className: 'col-span-4',
      placeholder: 'Selecciona un color'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: false,
      className: 'col-span-4',
    },
  ];

  return (
    <DynamicForm
      schema={cursoFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='w-full grid-cols-4'
    />
  )
}