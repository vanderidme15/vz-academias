'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useHorariosStore } from "@/lib/store/configuraciones/horarios.store";
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store";
import { Curso } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { useEffect } from "react";
import { z } from "zod";

const cursoFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  total_classes: z.coerce.number().min(1, 'Debe haber al menos 1 clase').optional(),
  price: z.union([
    z.string(),
    z.number()
  ]).transform((val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().nonnegative('El precio debe ser mayor o igual a 0')),
  teacher_id: z.string().min(1, 'El profesor es requerido'),
  schedule_id: z.string().min(1, 'El horario es requerido'),
})

interface CursoFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Curso | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export default function CursoForm({ dialogHandlers, onCreate, onEdit }: CursoFormProps) {
  const { profesores, fetchProfesores } = useProfesoresStore();
  const { horarios, fetchHorarios } = useHorariosStore();

  useEffect(() => {
    fetchProfesores();
    fetchHorarios();
  }, [fetchProfesores, fetchHorarios]);

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
      name: 'schedule_id',
      label: 'Horario',
      type: 'select',
      required: true,
      className: 'col-span-4',
      placeholder: 'Selecciona un horario',
      options: horarios.map(horario => ({
        value: horario.id!,
        label: (
          <div className="flex flex-col">
            <span className="text-xs">{horario.name}</span>
            <span className="text-xs text-muted-foreground">{horario.days?.join(', ')} {horario.start_time}-{horario.end_time}</span>
          </div>
        )
      }))
    },
    {
      name: 'total_classes',
      label: 'Número de Clases Base',
      type: 'integer',
      required: false,
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