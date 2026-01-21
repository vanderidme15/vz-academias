'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useAlumnosStore } from "@/lib/store/alumnos.store";
import { useCursosStore } from "@/lib/store/cursos.store";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { useEffect } from "react";
import { z } from "zod";

const inscripcionFormSchema = z.object({
  student_id: z.string().min(1, 'El alumno es requerido'),
  course_id: z.string().min(1, 'El curso es requerido'),
  price_charged: z.string().min(1, 'El precio es requerido'),
  includes_registration: z.boolean().default(false),
})

interface InscripcionFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Record<string, any>) => Promise<Inscripcion | null>;
  onEdit: (data: Record<string, any>, id: string) => Promise<void>;
}

export default function InscripcionForm({ dialogHandlers, onCreate, onEdit }: InscripcionFormProps) {
  const { alumnos, fetchAlumnos } = useAlumnosStore();
  const { cursos, fetchCursos } = useCursosStore();

  useEffect(() => {
    fetchAlumnos();
    fetchCursos();
  }, [fetchAlumnos, fetchCursos]);

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    await onCreate(values as Inscripcion);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    await onEdit(values as Inscripcion, dialogHandlers.selectedItem?.id);
    dialogHandlers.setOpenDialog(false);
  }

  // Configuración de formulario
  const fields: FieldConfig[] = [
    {
      name: 'student_id',
      label: 'Alumno',
      type: 'select',
      required: true,
      className: 'col-span-4',
      placeholder: 'Selecciona un alumno',
      options: alumnos.map(alumno => ({
        value: alumno.id!,
        label: alumno.name!
      }))
    },
    {
      name: 'course_id',
      label: 'Curso',
      type: 'select',
      required: true,
      className: 'col-span-4',
      placeholder: 'Selecciona un curso',
      options: cursos.map(curso => ({
        value: curso.id!,
        label: (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{curso.name}</span>
            <span className="text-xs text-muted-foreground">
              {curso.teacher?.name} • {curso.schedule?.name}
            </span>
          </div>
        )
      }))
    },
    {
      name: 'price_charged',
      label: 'Precio a Cobrar (S/)',
      type: 'text',
      required: true,
      className: 'col-span-2',
      placeholder: 'Ej: 150.00',
    },
    {
      name: 'includes_registration',
      label: 'Incluye Matrícula',
      type: 'checkbox',
      required: false,
      className: 'col-span-2',
    },
  ];

  return (
    <DynamicForm
      schema={inscripcionFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='w-full grid-cols-4'
    />
  )
}