'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";

const studentAttendanceFormSchema = z.object({
  date_time: z.date({
    required_error: 'La fecha es obligatoria',
  }).transform(date => date.toISOString()), // Convierte a ISO
  own_check: z.boolean().optional(),
  admin_check: z.boolean().optional(),
});

interface StudentAttendanceFormProps {
  dialogHandlers: DialogHandlers;
  selectedInscripcion: Inscripcion | null;
  teacherId?: string;
  onHandle: (registrationId: string, date: string, teacherId: string, ownCheck: boolean, adminCheck: boolean) => Promise<void>;
}

export function StudentAttendanceForm({ dialogHandlers, selectedInscripcion, teacherId, onHandle }: StudentAttendanceFormProps) {
  console.log(teacherId)

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    if (!teacherId) return;
    await onHandle(selectedInscripcion?.id || '', values.date_time, teacherId, values.own_check, values.admin_check);
    dialogHandlers.setOpenDialog(false);
  }

  const handleEdit = async (values: Record<string, any>): Promise<void> => {
    if (!teacherId) return;
    await onHandle(selectedInscripcion?.id || '', values.date_time, teacherId, values.own_check, values.admin_check);
    dialogHandlers.setOpenDialog(false);
  }

  // Configuración de formulario
  const fields: FieldConfig[] = [
    {
      name: 'date_time',
      label: 'Fecha',
      type: 'date',
      required: true,
      placeholder: 'Ingresa la fecha',
    },
    {
      name: 'own_check',
      label: '¿Propio?',
      type: 'checkbox',
      required: false,
      className: 'col-span-2',
    },
    {
      name: 'admin_check',
      label: '¿Administrador?',
      type: 'checkbox',
      required: false,
      className: 'col-span-2',
    }
  ];

  return (
    <DynamicForm
      schema={studentAttendanceFormSchema}
      fields={fields}
      onSubmit={dialogHandlers.selectedItem ? handleEdit : handleCreate}
      selectedItem={dialogHandlers.selectedItem}
      className='px-2 h-fit'
    />
  )
}
