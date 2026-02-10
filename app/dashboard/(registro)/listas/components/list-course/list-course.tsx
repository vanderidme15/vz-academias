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
    <div className="flex flex-col w-full md:w-[calc(100vw-20rem)] overflow-auto">
      {/* Header del curso */}
      <div className="flex items-center gap-1 md:gap-2 border px-4 py-2 rounded-xl border-dashed">
        <div style={{ backgroundColor: dialogHandlers.selectedCourse?.color }} className="w-2 h-16 rounded-full"></div>

        <div className="grow">
          <p className="text-sm md:text-lg font-medium">{dialogHandlers.selectedCourse?.name}</p>
          <p className="text-xs text-muted-foreground">
            {dialogHandlers.selectedCourse?.teacher?.name ?? "Sin asignar"}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div className="px-2 py-1 rounded-full border font-bold border-dashed border-amber-500 text-amber-500 w-fit text-xs">
            {mesLabel}
          </div>
          <p className="flex items-center gap-1 text-xs"><CalendarIcon size={12} className="text-muted-foreground" />{getShortDays(dialogHandlers.selectedCourse?.schedule?.days || [])}</p>
          <p className="flex items-center gap-1 text-xs"><ClockIcon size={12} className="text-muted-foreground" />{formatTime(dialogHandlers.selectedCourse?.schedule?.start_time)} - {formatTime(dialogHandlers.selectedCourse?.schedule?.end_time)}</p>
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