import { DynamicForm } from "@/components/own/dynamic-form/dynamic-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store";
import { Curso, Inscripcion } from "@/shared/types/supabase.types";
import { FieldConfig } from "@/shared/types/ui.types";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useMemo } from "react";

interface StudentAttendanceForceProps {
  inscripcion: Inscripcion | null;
  course: Curso | null;
  setOpenDialog: (open: boolean) => void;
}

export default function StudentAttendanceForce({ inscripcion, course, setOpenDialog }: StudentAttendanceForceProps) {
  const { handleForceAttendance } = useInscripcionesStore();

  // Schema dinámico basado en total_classes de la inscripción
  const studentAttendanceForceFormSchema = useMemo(() => {
    const maxClasses = inscripcion?.total_classes || 0;

    return z.object({
      class_count: z
        .union([z.number(), z.string()])
        .pipe(z.coerce.number())
        .refine((val) => val >= 1, { message: 'Debe ser mayor a 0' })
        .refine((val) => val <= maxClasses, {
          message: `No puede ser mayor a ${maxClasses} clases totales`
        }),
      observations: z.string().optional().default(''),
    });
  }, [inscripcion?.total_classes]);

  const handleUpdate = async (values: Record<string, any>): Promise<void> => {
    if (!inscripcion?.id) {
      toast.error('Falta la inscripción asociada');
      return;
    }

    // Validación adicional por seguridad
    if (values.class_count > (inscripcion.total_classes || 0)) {
      toast.error(`Las clases tomadas no pueden ser mayores a ${inscripcion.total_classes} clases totales`);
      return;
    }

    const valuesToUpdate = {
      class_count: values.class_count,
      observations: values.observations,
    };

    await handleForceAttendance(
      inscripcion.id,
      valuesToUpdate.class_count,
      valuesToUpdate.observations
    );

    setOpenDialog(false);
  };

  const fields: FieldConfig[] = [
    {
      name: 'class_count',
      label: 'Total de clases tomadas',
      type: 'integer',
      required: true,
      className: 'col-span-2',
      placeholder: 'Ej: 12',
      helpText: `Cantidad de clases tomadas por el alumno (máximo: ${inscripcion?.total_classes || 0})`,
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
    <div className="w-full space-y-4">
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Al modificar las clases tomadas, se actualizará el progreso del alumno en el curso y no se tomarán en cuenta las asistencias diarias registradas
        </AlertDescription>
      </Alert>
      <DynamicForm
        schema={studentAttendanceForceFormSchema}
        fields={fields}
        onSubmit={handleUpdate}
        selectedItem={inscripcion}
        className='grid grid-cols-2 px-2 h-fit'
      />
    </div>
  );
}
