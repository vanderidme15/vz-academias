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
import { useAcademiaStore } from "@/lib/store/academia.store";

const inscripcionFormSchema = z.object({
  course_id: z.string().min(1, 'El curso es requerido'),
  includes_registration: z.boolean().default(false),
});

interface InscripcionFormProps {
  dialogHandlers: DialogHandlers;
  onCreate: (data: Inscripcion) => Promise<Inscripcion | null>;
  onEdit: (data: Inscripcion, id: string) => Promise<Inscripcion | null>;
  student: Alumno;
}

export default function InscripcionForm({
  dialogHandlers,
  onCreate,
  onEdit,
  student
}: InscripcionFormProps) {
  const { user } = useAuth();
  const { cursos, fetchCursos } = useCursosStore();
  const { academia } = useAcademiaStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, any> | null>(null);

  const isEdit = !!dialogHandlers.selectedItem;
  const hasRegistration = academia?.has_registration ?? false;
  const registrationPrice = academia?.registration_price ?? 0;

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  // Campos del formulario
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
      label: `¿Agregar precio de matrícula? S/ ${registrationPrice}`,
      type: 'checkbox',
      required: false,
      className: hasRegistration ? 'col-span-4' : 'hidden',
    },
  ], [cursos, hasRegistration, registrationPrice]);

  // Obtener curso seleccionado
  const getSelectedCourse = (courseId: string) => {
    return cursos.find(c => c.id === courseId);
  };

  // Calcular precios
  const calculatePrices = (courseId: string, includesRegistration: boolean) => {
    const course = getSelectedCourse(courseId);
    const coursePrice = course?.price ?? 0;
    const registrationFee = includesRegistration ? registrationPrice : 0;
    const totalPrice = coursePrice + registrationFee;

    return {
      coursePrice,
      registrationFee,
      totalPrice
    };
  };

  // Generar mensaje de confirmación
  const getConfirmationMessage = (values: Record<string, any>) => {
    const course = getSelectedCourse(values.course_id);

    if (!course) {
      return {
        title: 'Error',
        description: 'No se pudo encontrar el curso seleccionado.'
      };
    }

    const prices = calculatePrices(values.course_id, values.includes_registration);
    const action = isEdit ? 'actualizará' : 'creará';

    return {
      title: `¿Confirmar ${isEdit ? 'edición' : 'nueva inscripción'}?`,
      description:
        `
        Se ${action} la inscripción para ${student.name} con:

        • Curso: ${course.name}
        • Horario: ${course.schedule?.name ?? 'Sin horario'}
        • Precio del curso: S/ ${prices.coursePrice.toFixed(2)}
        ${values.includes_registration ? `• Matrícula: S/ ${prices.registrationFee.toFixed(2)}` : ''}
        • Total: S/ ${prices.totalPrice.toFixed(2)}
      `.trim()
    };
  };

  // Construir datos de inscripción
  const buildInscripcionData = (values: Record<string, any>): Inscripcion => {
    const prices = calculatePrices(values.course_id, values.includes_registration);

    return {
      student_id: student.id,
      course_id: values.course_id,
      includes_registration: values.includes_registration,
      price_charged: prices.totalPrice,
      registration_price: prices.registrationFee,
      course_price: prices.coursePrice,
      register_by: user?.email,
    };
  };

  // Handlers
  const handleFormSubmit = async (values: Record<string, any>): Promise<void> => {
    setPendingData(values);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;

    const inscripcionData = buildInscripcionData(pendingData);

    try {
      if (isEdit) {
        const result = await onEdit(inscripcionData, dialogHandlers.selectedItem.id);
        if (result) {
          dialogHandlers.setSelectedItem(result);
        }
      } else {
        const result = await onCreate(inscripcionData);
        if (result) {
          dialogHandlers.setSelectedItem(result);
        }
      }
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
            <AlertDialogTitle>
              {pendingData && getConfirmationMessage(pendingData).title}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {pendingData && getConfirmationMessage(pendingData).description}
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