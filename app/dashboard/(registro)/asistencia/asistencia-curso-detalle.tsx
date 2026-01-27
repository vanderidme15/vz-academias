"use client";

import { useEffect, useState } from "react";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { Curso, InscripcionWithRelations } from "@/shared/types/supabase.types";
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store";
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store";
import { useAsistenciasStore } from "@/lib/store/registro/asistencias.store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AsistenciasCursoDetalleProps {
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
  curso: Curso | null;
}

interface AsistenciaState {
  teacher_id: string;
  own_check: boolean;
  admin_check: boolean;
}

export default function AsistenciaCursoDetalle({
  openDialog,
  setOpenDialog,
  curso,
}: AsistenciasCursoDetalleProps) {
  const [loading, setLoading] = useState(false);
  const [inscripciones, setInscripciones] = useState<InscripcionWithRelations[]>([]);
  const [asistenciaStates, setAsistenciaStates] = useState<Record<string, AsistenciaState>>({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});

  const { fetchInscripcionesByCursoId, handleConfirmMarkAttendanceByAdmin } = useInscripcionesStore();
  const { profesores } = useProfesoresStore();

  // Cargar inscripciones
  useEffect(() => {
    if (!curso?.id) return;

    const loadInscripciones = async () => {
      try {
        setLoading(true);
        const data = await fetchInscripcionesByCursoId(curso.id);
        setInscripciones(data);

        // Inicializar estados de asistencia
        const initialStates = data.reduce((acc, inscripcion) => {
          if (inscripcion.id) {
            acc[inscripcion.id] = {
              teacher_id: inscripcion.attendance?.teacher_id ?? curso.teacher_id ?? "",
              own_check: inscripcion.attendance?.own_check ?? false,
              admin_check: inscripcion.attendance?.admin_check ?? false,
            };
          }
          return acc;
        }, {} as Record<string, AsistenciaState>);

        setAsistenciaStates(initialStates);
        setHasChanges({});
      } catch (error) {
        console.error("Error cargando inscripciones:", error);
        setInscripciones([]);
      } finally {
        setLoading(false);
      }
    };

    loadInscripciones();
  }, [curso?.id, curso?.teacher_id, fetchInscripcionesByCursoId]);

  // Actualizar un campo específico de la asistencia
  const updateAsistenciaField = <K extends keyof AsistenciaState>(
    inscripcionId: string,
    field: K,
    value: AsistenciaState[K]
  ) => {
    setAsistenciaStates((prev) => ({
      ...prev,
      [inscripcionId]: {
        ...prev[inscripcionId],
        [field]: value,
      },
    }));

    // Marcar que hay cambios pendientes
    setHasChanges((prev) => ({
      ...prev,
      [inscripcionId]: true,
    }));
  };

  // Guardar cambios de asistencia
  const handleSaveAsistencia = async (inscripcion: InscripcionWithRelations) => {
    if (!curso?.id || !inscripcion.id) return;

    const inscripcionId = inscripcion.id; // Extraer el ID primero
    const state = asistenciaStates[inscripcionId];

    if (!state?.teacher_id) {
      console.error("No hay profesor seleccionado");
      return;
    }

    try {
      setLoading(true);
      await handleConfirmMarkAttendanceByAdmin(
        inscripcionId,
        state.teacher_id,
        state.own_check,
        state.admin_check
      );

      // Recargar inscripciones
      const updated = await fetchInscripcionesByCursoId(curso.id);
      setInscripciones(updated ?? []);

      // Limpiar el flag de cambios
      setHasChanges((prev) => ({
        ...prev,
        [inscripcionId]: false, // Ahora usa la variable local que TypeScript sabe que es string
      }));
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si hay asistencia registrada
  const hasAttendanceRecord = (inscripcion: InscripcionWithRelations) => {
    return !!inscripcion.attendance?.attendance_id;
  };

  if (!curso) return null;

  return (
    <GenericDialog
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
      title="Asistencia del curso"
    >
      {/* Header del curso */}
      <div className="flex justify-between items-center border px-3 py-2 rounded border-dashed mb-4">
        <div>
          <p className="text-lg font-medium">{curso.name}</p>
          <p className="text-xs text-muted-foreground">
            Profesor: {curso.teacher?.name ?? "Sin asignar"}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="text-xs">{curso.schedule?.days?.join(", ")}</p>
          <p>
            {curso.schedule?.start_time} - {curso.schedule?.end_time}
          </p>
        </div>
      </div>

      {/* Estados de carga */}
      {loading && (
        <p className="text-sm text-muted-foreground">Cargando asistencias...</p>
      )}

      {!loading && inscripciones.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay inscripciones para este curso
        </p>
      )}

      {/* Lista de inscripciones */}
      {!loading && inscripciones.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Alumnos inscriptos ({inscripciones.length})
          </p>
          {/* encabezados */}
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-medium">
            <div className="col-span-4">Alumno</div>
            <div className="col-span-3">Profesor</div>
            <div className="col-span-2">Asistencia</div>
            <div className="col-span-3">Acciones</div>
          </div>
          <ul className="space-y-2">
            {inscripciones.map((inscripcion) => {
              const inscripcionId = inscripcion.id || "";
              const state = asistenciaStates[inscripcionId];
              const pendingChanges = hasChanges[inscripcionId];
              const hasRecord = hasAttendanceRecord(inscripcion);

              if (!state) return null;

              return (
                <li
                  key={inscripcionId}
                  className={`border rounded p-3 ${pendingChanges ? "border-yellow-500 bg-yellow-50/50" : ""
                    }`}
                >
                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* Información del estudiante */}
                    <div className="col-span-4 space-y-1">
                      <p className="font-medium">{inscripcion.student?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        DNI: {inscripcion.student?.dni}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Clases: {inscripcion.class_count || 0}/
                        {inscripcion.total_classes}
                      </p>
                      {hasRecord && (
                        <p className="text-xs text-green-600">
                          ✓ Asistencia registrada
                        </p>
                      )}
                    </div>

                    {/* Selector de profesor */}
                    <div className="col-span-3">
                      <Select
                        value={state.teacher_id}
                        onValueChange={(value) =>
                          updateAsistenciaField(inscripcionId, "teacher_id", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar profesor" />
                        </SelectTrigger>
                        <SelectContent>
                          {profesores.map((profesor) => (
                            <SelectItem
                              key={profesor.id}
                              value={profesor.id || ""}
                            >
                              {profesor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Check propio */}
                    <div
                      className="col-span-1 flex justify-center items-center"
                      title="Check propio del alumno"
                    >
                      <Checkbox
                        checked={state.own_check}
                        onCheckedChange={(checked) =>
                          updateAsistenciaField(
                            inscripcionId,
                            "own_check",
                            !!checked
                          )
                        }
                        disabled={loading}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                    </div>

                    {/* Check admin */}
                    <div
                      className="col-span-1 flex justify-center items-center"
                      title="Check administrativo"
                    >
                      <Checkbox
                        checked={state.admin_check}
                        onCheckedChange={(checked) =>
                          updateAsistenciaField(
                            inscripcionId,
                            "admin_check",
                            !!checked
                          )
                        }
                        disabled={loading}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </div>

                    {/* Botón de acción */}
                    <div className="col-span-3">
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={loading || !state.teacher_id}
                        onClick={() => handleSaveAsistencia(inscripcion)}
                      >
                        {pendingChanges ? "Guardar cambios" : "Actualizar"}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </GenericDialog>
  );
}