'use client'

import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store";
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
  class_count: z.number().optional(),
  price_charged: z.union([
    z.string(),
    z.number()
  ]).transform((val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().nonnegative('El precio debe ser mayor o igual a 0')),
  is_personalized: z.boolean().default(false),
  includes_registration: z.boolean().default(false),
  observations: z.string().optional(),
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
      })),
      onChange: (value: string, setValue: any, getValues: any) => {
        // Buscar el curso seleccionado
        const selectedCourse = cursos.find(c => c.id === value);

        if (selectedCourse) {
          // Auto-rellenar los campos con los datos del curso
          setValue('class_count', selectedCourse.class_count || 0);
          setValue('price_charged', selectedCourse.price || 0);

          // Si no está personalizado, mantener deshabilitados los campos
          const isPersonalized = getValues('is_personalized');
          if (!isPersonalized) {
            // Los campos se actualizan pero permanecen deshabilitados
            setValue('is_personalized', false);
          }
        }
      }
    },
    {
      name: 'is_personalized',
      label: '¿Personalizar clases y precio?',
      type: 'checkbox',
      required: false,
      className: 'col-span-4',
      dependsOn: {
        field: 'course_id',
        value: undefined
      },
      helpText: 'Habilita esta opción para modificar el número de clases y el precio del curso',
      onChange: (value: boolean, setValue: any, getValues: any) => {
        // Si se deshabilita la personalización, restaurar valores del curso
        if (!value) {
          const courseId = getValues('course_id');
          const selectedCourse = cursos.find(c => c.id === courseId);

          if (selectedCourse) {
            setValue('class_count', selectedCourse.class_count || 0);
            setValue('price_charged', selectedCourse.price || 0);
          }
        }
      }
    },
    {
      name: 'class_count',
      label: 'Número de Clases',
      type: 'integer',
      required: false,
      className: 'col-span-2',
      placeholder: 'Ej: 12',
      dependsOn: {
        field: 'course_id',
        value: undefined
      },
      helpText: 'Cantidad de clases del curso',
      // Deshabilitar si no está personalizado
      disabled: false, // Se manejará dinámicamente
    },
    {
      name: 'price_charged',
      label: 'Monto del Curso (S/)',
      type: 'price',
      required: false,
      className: 'col-span-2',
      placeholder: 'Ej: 150.00',
      dependsOn: {
        field: 'course_id',
        value: undefined
      },
      helpText: 'Precio base del curso (sin matrícula)',
      // Deshabilitar si no está personalizado
      disabled: false, // Se manejará dinámicamente
    },
    {
      name: 'includes_registration',
      label: `¿Agregar precio de matrícula? S/ ${registrationPrice}`,
      type: 'checkbox',
      required: false,
      className: hasRegistration ? 'col-span-4' : 'hidden',
    },
    {
      name: 'observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      className: 'col-span-4',
    }
  ], [cursos, hasRegistration, registrationPrice]);

  // Ajustar disabled dinámicamente basado en is_personalized
  const fieldsWithDynamicDisabled = useMemo(() => {
    return fields.map(field => {
      if (field.name === 'class_count' || field.name === 'price_charged') {
        return {
          ...field,
          // Estos campos estarán deshabilitados a menos que is_personalized sea true
          dependsOn: {
            field: 'course_id',
            value: undefined
          },
          // Usamos un truco: agregamos una segunda condición
          onChange: field.onChange || ((value: any, setValue: any, getValues: any) => {
            // Este onChange se ejecutará normalmente
          })
        };
      }
      return field;
    });
  }, [fields]);

  // Obtener curso seleccionado
  const getSelectedCourse = (courseId: string) => {
    return cursos.find(c => c.id === courseId);
  };

  // Calcular precios
  const calculatePrices = (courseId: string, includesRegistration: boolean, customPrice?: number) => {
    const course = getSelectedCourse(courseId);
    const coursePrice = customPrice ?? course?.price ?? 0;
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

    const prices = calculatePrices(
      values.course_id,
      values.includes_registration,
      values.price_charged
    );
    const action = isEdit ? 'actualizará' : 'creará';
    const isPersonalized = values.is_personalized ? ' (Personalizado)' : '';

    return {
      title: `¿Confirmar ${isEdit ? 'edición' : 'nueva inscripción'}?`,
      description:
        `
        Se ${action} la inscripción para ${student.name} con:

        • Curso: ${course.name}${isPersonalized}
        • Horario: ${course.schedule?.name ?? 'Sin horario'}
        • Número de clases: ${values.class_count || 'No especificado'}
        • Precio del curso: S/ ${(values.price_charged || 0).toFixed(2)}
        ${values.includes_registration ? `• Matrícula: S/ ${prices.registrationFee.toFixed(2)}` : ''}
        • Total a cobrar: S/ ${prices.totalPrice.toFixed(2)}
        ${values.observations ? `• Observaciones: ${values.observations}` : ''}
      `.trim()
    };
  };

  // Construir datos de inscripción
  const buildInscripcionData = (values: Record<string, any>): Inscripcion => {
    const prices = calculatePrices(
      values.course_id,
      values.includes_registration,
      values.price_charged
    );

    return {
      student_id: student.id,
      course_id: values.course_id,
      class_count: values.class_count || 0,
      is_personalized: values.is_personalized || false,
      includes_registration: values.includes_registration,
      price_charged: prices.totalPrice,
      registration_price: prices.registrationFee,
      course_price: values.price_charged || 0,
      register_by: user?.email,
      observations: values.observations,
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
        fields={fieldsWithDynamicDisabled}
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