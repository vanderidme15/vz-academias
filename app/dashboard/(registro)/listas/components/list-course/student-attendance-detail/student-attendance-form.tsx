'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { z } from "zod";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const studentAttendanceFormSchema = z.object({
  date_time: z.coerce.date({
    required_error: 'La fecha es obligatoria',
    invalid_type_error: 'Fecha inválida'
  }),
  teacher_id: z.string().optional().default(''),
  own_check: z.boolean().optional().default(false),
  admin_check: z.boolean().optional().default(false),
  observations: z.string().optional().default(''),
});

interface StudentAttendanceFormProps {
  dialogHandlers: DialogHandlers;
  selectedInscripcion: Inscripcion | null;
  teacherId?: string;
  onCreate: (
    values: Record<string, any>
  ) => Promise<void>;
  onUpdate: (
    values: Record<string, any>,
    id: string
  ) => Promise<void>;
}

export function StudentAttendanceForm({
  dialogHandlers,
  selectedInscripcion,
  teacherId,
  onCreate,
  onUpdate,
}: StudentAttendanceFormProps) {
  const { profesores } = useProfesoresStore();
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const profesoresOptions = profesores.map((profesor) => ({
    value: profesor.id || '',
    label: profesor.name || '',
  }));

  const checkDateWarning = (date: Date) => {
    if (!selectedInscripcion?.date_to) {
      setDateWarning(null);
      return;
    }

    const maxDate = new Date(selectedInscripcion.date_to);
    if (date > maxDate) {
      setDateWarning('La fecha seleccionada supera la fecha de fin de la inscripción');
    } else {
      setDateWarning(null);
    }
  };

  const handleCreate = async (values: Record<string, any>): Promise<void> => {
    if (!teacherId || !selectedInscripcion?.id) {
      console.error('Faltan teacherId o inscripción');
      return;
    }
    const valuesToCreate = {
      registration_id: selectedInscripcion.id,
      date_time: values.date_time.toISOString(),
      teacher_id: values.teacher_id,
      own_check: values.own_check,
      admin_check: values.admin_check,
      observations: values.observations,
    }

    await onCreate(valuesToCreate);

    dialogHandlers.setOpenDialog(false);
  };

  const handleUpdate = async (values: Record<string, any>): Promise<void> => {
    if (!teacherId || !selectedInscripcion?.id) {
      console.error('Faltan teacherId o inscripción');
      return;
    }
    const valuesToUpdate = {
      registration_id: selectedInscripcion.id,
      date_time: values.date_time.toISOString(),
      teacher_id: values.teacher_id,
      own_check: values.own_check,
      admin_check: values.admin_check,
      observations: values.observations,
    }

    await onUpdate(valuesToUpdate, dialogHandlers.selectedItem?.id || '');

    dialogHandlers.setOpenDialog(false);
  };

  const fields: FieldConfig[] = [
    {
      name: 'date_time',
      label: 'Fecha',
      type: 'date',
      required: true,
      placeholder: 'Selecciona la fecha',
      className: 'col-span-2',
      onChange: (value: Date) => checkDateWarning(value), // Agrega esta propiedad si tu DynamicForm lo soporta
    },
    {
      name: 'teacher_id',
      label: 'Profesor',
      type: 'select',
      required: true,
      placeholder: 'Selecciona el profesor',
      options: profesoresOptions,
      defaultValue: teacherId,
      className: 'col-span-2',
    },
    {
      name: 'own_check',
      label: 'Asistencia confirmada por el alumno',
      type: 'checkbox',
      required: false,
      className: 'col-span-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600',
    },
    {
      name: 'admin_check',
      label: 'Asistencia confirmada por el administrador',
      type: 'checkbox',
      required: false,
      className: 'col-span-2',
    },
    {
      name: 'observations',
      label: 'Observaciones (opcional)',
      type: 'textarea',
      required: false,
      placeholder: 'Observaciones',
      className: 'col-span-2',
    }
  ];

  return (
    <div className="w-md space-y-4">
      {dateWarning && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {dateWarning}
          </AlertDescription>
        </Alert>
      )}
      <DynamicForm
        schema={studentAttendanceFormSchema}
        fields={fields}
        onSubmit={dialogHandlers.selectedItem ? handleUpdate : handleCreate}
        selectedItem={dialogHandlers.selectedItem}
        className='grid grid-cols-2 px-2 h-fit'
      />
    </div>
  );
}