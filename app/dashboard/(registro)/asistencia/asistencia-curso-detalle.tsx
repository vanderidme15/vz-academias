"use client";

import { useEffect, useState } from "react";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { Curso, Inscripcion, InscripcionWithRelations } from "@/shared/types/supabase.types";
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
import { CheckCircle2Icon } from "lucide-react";

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
  const [teacherByInscription, setTeacherByInscription] = useState<Record<string, string>>({});

  const { fetchInscripcionesByCursoId } = useInscripcionesStore();
  const { profesores } = useProfesoresStore();

  useEffect(() => {
    if (!curso?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchInscripcionesByCursoId(curso.id);
        setInscripciones(data);
      } catch (error) {
        console.error("Error cargando inscripciones", error);
        setInscripciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [curso?.id]);

  const handleCheckAssistant = async (
    inscripcion: InscripcionWithRelations
  ) => {
    if (!curso) return;

    try {
      setLoading(true);

      // await marcarAsistencia({
      //   inscripcion_id: inscripcion.id,
      //   teacher_id:
      //     teacherByInscription[inscripcion.id] ?? curso.teacher_id,
      // });

      const updated = await fetchInscripcionesByCursoId(curso.id);
      setInscripciones(updated ?? []);
    } catch (error) {
      console.error("Error al marcar asistencia", error);
    } finally {
      setLoading(false);
    }
  };

  if (!curso) return null;

  return (
    <GenericDialog
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
      title="Asistencia del curso"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center border px-3 py-2 rounded border-dashed mb-4">
        <div>
          <p className="text-lg font-medium">{curso.name}</p>
          <p className="text-xs text-muted-foreground">
            Profesor designado: {curso.teacher?.name ?? "Sin asignar"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs">
            {curso.schedule?.days?.join(", ")}
          </p>
          <p className="text-sm">
            {curso.schedule?.start_time} - {curso.schedule?.end_time}
          </p>
        </div>
      </div>

      {/* STATES */}
      {loading && <p className="text-sm">Cargando asistencias...</p>}

      {!loading && inscripciones.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay inscripciones para este curso
        </p>
      )}

      {/* LIST */}
      {!loading && inscripciones.length > 0 && (
        <>
          <p className="text-sm mb-2">
            Alumnos inscriptos ({inscripciones.length})
          </p>

          <ul className="space-y-2">
            {inscripciones.map((inscripcion) => {
              const attendance = inscripcion.attendance;

              return (
                <li key={inscripcion.id}>
                  <div className="grid grid-cols-12 gap-2 p-2 items-center border rounded">
                    {/* STUDENT */}
                    <div className="col-span-4">
                      <p className="font-medium">
                        {inscripcion.student?.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        DNI: {inscripcion.student?.dni}
                      </span>
                    </div>

                    {/* TEACHER */}
                    <div className="col-span-3">
                      <Select
                        value={
                          teacherByInscription[inscripcion.id || ""] ??
                          curso.teacher_id ??
                          ""
                        }
                        onValueChange={(value) =>
                          setTeacherByInscription((prev) => ({
                            ...prev,
                            [inscripcion.id || ""]: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Profesor" />
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

                    {/* OWN CHECK */}
                    <div className="col-span-1 flex justify-center">
                      <CheckCircle2Icon
                        className={
                          attendance?.own_check
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      />
                    </div>

                    {/* ADMIN CHECK */}
                    <div className="col-span-1 flex justify-center">
                      <CheckCircle2Icon
                        className={
                          attendance?.admin_check
                            ? "text-blue-600"
                            : "text-muted-foreground"
                        }
                      />
                    </div>

                    {/* ACTION */}
                    <Button
                      variant="outline"
                      className="col-span-3"
                      disabled={attendance?.own_check && attendance?.admin_check || loading}
                      onClick={() => handleCheckAssistant(inscripcion)}
                    >
                      {attendance?.own_check && attendance?.admin_check
                        ? "Asistencia registrada"
                        : "Marcar asistencia"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </GenericDialog>
  );
}
