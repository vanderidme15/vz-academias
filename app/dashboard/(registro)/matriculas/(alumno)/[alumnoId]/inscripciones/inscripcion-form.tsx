'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useCursosStore } from "@/lib/store/cursos.store";
import { useAuth } from "@/lib/hooks/use-auth";
import { Alumno, Inscripcion } from "@/shared/types/supabase.types";
import type { DialogHandlers, FieldConfig } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// to-do: move to config
const REGISTRATION_FEE = 20;

const inscripcionFormSchema = z.object({
  course_id: z.string().min(1, 'El curso es requerido'),
  includes_registration: z.boolean().default(false),
});

interface InscripcionFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Inscripcion) => Promise<Inscripcion | null>;
  onEdit: (data: Inscripcion, id: string) => Promise<void>;
  student: Alumno;
}

export default function InscripcionForm({ dialogHandlers, onCreate, onEdit, student }: InscripcionFormProps) {
  const { user } = useAuth();
  const { cursos, fetchCursos } = useCursosStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<{ values: Record<string, any>; message: { title: string; description: string } } | null>(null);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  const isEdit = !!dialogHandlers.selectedItem;

  // Configuración de campos del formulario
  const fields: FieldConfig[] = useMemo(() => [
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
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{curso.name}</span>
            <span className="text-muted-foreground">
              {curso.schedule?.name} • S/ {curso.price}
            </span>
          </div>
        )
      }))
    },
    {
      name: 'includes_registration',
      label: '¿Agregar precio de matrícula?',
      type: 'checkbox',
      required: false,
      className: 'col-span-4',
    },
  ], [cursos]);

  const calculatePrice = (courseId: string, includesRegistration: boolean) => {
    const course = cursos.find(c => c.id === courseId);
    const basePrice = course?.price || 0;
    return includesRegistration ? basePrice + REGISTRATION_FEE : basePrice;
  };

  const buildConfirmationMessage = (values: Record<string, any>) => {
    const selectedCourse = cursos.find(c => c.id === values.course_id);

    if (!selectedCourse) {
      return {
        title: 'Confirmar operación',
        description: 'No se pudo cargar la información del curso.'
      };
    }

    const { name: courseName, schedule, price: basePrice = 0 } = selectedCourse;
    const scheduleName = schedule?.name || 'Sin horario';
    const totalPrice = calculatePrice(values.course_id, values.includes_registration);
    const action = isEdit ? 'actualizará' : 'creará';
    const preposition = isEdit ? 'con' : 'para';

    return {
      title: `¿Confirmar ${isEdit ? 'edición' : 'nueva inscripción'}?`,
      description: `
        Se ${action} la inscripción ${preposition} ${student.name || 'el estudiante'} con los siguientes datos:
        • Curso: ${courseName}
        • Horario: ${scheduleName}
        • Precio del curso: S/ ${basePrice.toFixed(2)}
        ${values.includes_registration ? `• Matrícula: S/ ${REGISTRATION_FEE.toFixed(2)}` : '• Sin matrícula'}
        • Total${isEdit ? '' : ' a pagar'}: S/ ${totalPrice.toFixed(2)}
      `
    };
  };

  const handleFormSubmit = async (values: Record<string, any>): Promise<void> => {
    const message = buildConfirmationMessage(values);
    setPendingData({ values, message });
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;

    const { values } = pendingData;
    const inscripcionData: Inscripcion = {
      ...values,
      student_id: student.id,
      price_charged: calculatePrice(values.course_id, values.includes_registration),
      registration_price: values.includes_registration ? REGISTRATION_FEE : 0,
      course_price: values.includes_registration ? calculatePrice(values.course_id, values.includes_registration) - REGISTRATION_FEE : calculatePrice(values.course_id, values.includes_registration),
      register_by: user?.email,
    };

    try {
      if (isEdit) {
        await onEdit(inscripcionData, dialogHandlers.selectedItem.id);
      } else {
        await onCreate(inscripcionData);
      }
      dialogHandlers.setOpenDialog(false);
    } finally {
      setShowConfirmDialog(false);
      setPendingData(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingData(null);
  };

  return (
    <>
      <DynamicForm
        schema={inscripcionFormSchema}
        fields={fields}
        onSubmit={handleFormSubmit}
        selectedItem={dialogHandlers.selectedItem}
        className='w-full grid-cols-4'
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingData?.message.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {pendingData?.message.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}