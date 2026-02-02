"use client";

import { useEffect, useState } from "react";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { Asistencia, Curso, InscripcionWithRelations } from "@/shared/types/supabase.types";
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store";
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, ClockIcon, SaveIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";
import { Progress } from "@/components/ui/progress";

interface AsistenciasCursoDetalleProps {
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
  curso: Curso | null;
}

export default function AsistenciaCursoDetalle({
  openDialog,
  setOpenDialog,
  curso,
}: AsistenciasCursoDetalleProps) {
  const [loading, setLoading] = useState(false);
  const [inscripciones, setInscripciones] = useState<InscripcionWithRelations[]>([]);
  const [asistenciaStates, setAsistenciaStates] = useState<Record<string, Asistencia>>({});
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
        }, {} as Record<string, Asistencia>);

        setAsistenciaStates(initialStates);
        setHasChanges({});
      } catch (error) {
        setInscripciones([]);
      } finally {
        setLoading(false);
      }
    };

    loadInscripciones();
  }, [curso?.id, curso?.teacher_id]);

  // Actualizar un campo específico de la asistencia
  const updateAsistenciaField = <K extends keyof Asistencia>(
    inscripcionId: string,
    field: K,
    value: Asistencia[K]
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

    const inscripcionId = inscripcion.id;
    const state = asistenciaStates[inscripcionId];

    if (!state?.teacher_id) {
      console.error("No hay profesor seleccionado");
      return;
    }

    try {
      // Actualización optimista del estado local
      setInscripciones((prev) =>
        prev.map((ins) => {
          if (ins.id === inscripcionId) {
            // Verificar si el estado de admin_check está cambiando
            const wasChecked = ins.attendance?.admin_check === true;
            const willBeChecked = state.admin_check === true;

            // Calcular el cambio en el contador de clases
            let classCountDelta = 0;
            if (!wasChecked && willBeChecked) {
              classCountDelta = 1; // Incrementar
            } else if (wasChecked && !willBeChecked) {
              classCountDelta = -1; // Decrementar
            }

            return {
              ...ins,
              class_count: Math.max((ins.class_count || 0) + classCountDelta, 0),
              attendance: {
                attendance_id: ins.attendance?.attendance_id || null,
                has_attendance: true,
                own_check: state.own_check ?? null,
                admin_check: state.admin_check ?? null,
                teacher_id: state.teacher_id || null,
              }
            };
          }
          return ins;
        })
      );

      // Realizar la actualización en el servidor
      await handleConfirmMarkAttendanceByAdmin(
        inscripcionId,
        state.teacher_id,
        state.own_check,
        state.admin_check
      );

      // Limpiar el flag de cambios
      setHasChanges((prev) => ({
        ...prev,
        [inscripcionId]: false,
      }));

    } catch (error) {
      console.error("Error al guardar asistencia:", error);

      // En caso de error, recargar los datos reales desde el servidor
      if (curso?.id) {
        const updated = await fetchInscripcionesByCursoId(curso.id);
        setInscripciones(updated ?? []);
      }
    } finally {
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
      title="Registrar asistencia para el curso"
    >
      <div className="h-full flex flex-col gap-4 overflow-y-auto w-full md:w-2xl">
        {/* Header del curso */}
        <div className="flex items-center gap-2 border px-4 py-2 rounded-xl border-dashed">
          <div style={{ backgroundColor: curso.color }} className="w-2 h-16 rounded-full"></div>

          <div className="grow">
            <p className="text-lg font-medium">{curso.name}</p>
            <p className="text-xs text-muted-foreground">
              Profesor: {curso.teacher?.name ?? "Sin asignar"}
            </p>
          </div>
          <div className="flex flex-col gap-px text-sm">
            <span className="text-xs text-muted-foreground">Horario:</span>
            <div className="flex flex-col md:flex-row gap-2">
              <p className="flex items-center gap-1"><CalendarIcon size={12} className="text-muted-foreground" />{getShortDays(curso.schedule?.days || [])}</p>
              <p className="flex items-center gap-1"><ClockIcon size={12} className="text-muted-foreground" />{formatTime(curso.schedule?.start_time)} - {formatTime(curso.schedule?.end_time)}</p>
            </div>
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
          <div className="space-y-3 flex flex-col overflow-y-auto">
            <p className="font-medium">
              Listado de alumnos ({inscripciones.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {inscripciones.map((inscripcion) => {
                const inscripcionId = inscripcion.id || "";
                const state = asistenciaStates[inscripcionId];
                const pendingChanges = hasChanges[inscripcionId];
                const hasRecord = hasAttendanceRecord(inscripcion);

                if (!state) return null;

                return (
                  <div
                    key={inscripcionId}
                    className={`border rounded-xl p-3 ${pendingChanges ? "border-yellow-500 bg-yellow-50/50" : ""
                      }`}
                  >
                    {/* Información del estudiante */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">● {inscripcion.student?.name}</p>
                        <p className="text-xs text-muted-foreground"> DNI: {inscripcion.student?.dni}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>Clases: {inscripcion.class_count || 0}/{inscripcion.total_classes}</span>
                        <Progress value={inscripcion.class_count || 0} max={inscripcion.total_classes} />
                      </div>
                      {hasRecord && (
                        <p className="text-xs text-green-600">
                          ✓ Asistencia registrada
                        </p>
                      )}
                    </div>

                    {/* Selector de profesor */}
                    <div className="mt-2 w-full">
                      <Label className="text-sm text-muted-foreground">Profesor asignado</Label>
                      <Select
                        value={state.teacher_id}
                        onValueChange={(value) =>
                          updateAsistenciaField(inscripcionId, "teacher_id", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full">
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
                      className="flex gap-2 items-center pt-2"
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
                      <Label className="text-xs text-muted-foreground">Asistencia confirmada por el alumno</Label>
                    </div>

                    {/* Check admin */}
                    <div
                      className="flex gap-2 items-center pt-2"
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
                      <Label className="text-xs text-muted-foreground">Asistencia confirmada por el administrador</Label>
                    </div>

                    {/* Botón de acción */}
                    <div className="flex pt-2 w-full">
                      <Button
                        className="w-full"
                        disabled={loading || !state.teacher_id}
                        onClick={() => handleSaveAsistencia(inscripcion)}
                      >
                        <span>Guardar cambios</span>
                        <SaveIcon />
                      </Button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GenericDialog>
  );
}