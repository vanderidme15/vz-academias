import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";
import { CalendarIcon, ClockIcon } from "lucide-react";
import ListCourseStudent from "./list-course-student";
import { DialogHandlersListType } from "../../page";


interface ListCourseProps {
  dialogHandlers: DialogHandlersListType;
  mes: any;
  mesLabel: string
}

export default function ListCourse({ dialogHandlers, mes, mesLabel }: ListCourseProps) {
  return (
    <div className="flex flex-col w-3xl overflow-auto">
      {/* Header del curso */}

      <div className="flex items-center gap-2 border px-4 py-2 rounded-xl border-dashed">
        <div style={{ backgroundColor: dialogHandlers.selectedCourse?.color }} className="w-2 h-16 rounded-full"></div>

        <div className="grow">
          <div className="flex items-center gap-2">
            <p className="text-lg font-medium">{dialogHandlers.selectedCourse?.name}</p>
            <div className="px-2 py-1 rounded-full bg-amber-500 text-white w-fit text-xs">
              {mesLabel}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Profesor: {dialogHandlers.selectedCourse?.teacher?.name ?? "Sin asignar"}
          </p>
        </div>
        <div className="flex flex-col gap-px text-sm">
          <span className="text-xs text-muted-foreground">Horario:</span>
          <div className="flex flex-col md:flex-row gap-2">
            <p className="flex items-center gap-1"><CalendarIcon size={12} className="text-muted-foreground" />{getShortDays(dialogHandlers.selectedCourse?.schedule?.days || [])}</p>
            <p className="flex items-center gap-1"><ClockIcon size={12} className="text-muted-foreground" />{formatTime(dialogHandlers.selectedCourse?.schedule?.start_time)} - {formatTime(dialogHandlers.selectedCourse?.schedule?.end_time)}</p>
          </div>
        </div>
      </div>

      {/* Estados de carga */}
      {dialogHandlers.loading && (
        <p className="text-sm text-muted-foreground">Cargando asistencias...</p>
      )}

      {!dialogHandlers.loading && dialogHandlers.inscripcionesByCurso.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay inscripciones para este curso
        </p>
      )}

      {/* Lista de alumnos */}
      {!dialogHandlers.loading && dialogHandlers.inscripcionesByCurso.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 overflow-auto">
          <span>Listado de alumnos ({dialogHandlers.inscripcionesByCurso.length})</span>
          <div className="flex flex-col gap-2">
            {dialogHandlers.inscripcionesByCurso.map((inscripcion) => {
              return (
                <ListCourseStudent key={inscripcion.id} inscripcion={inscripcion} />
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}