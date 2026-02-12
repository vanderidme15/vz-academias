import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";
import { CalendarIcon, ClockIcon } from "lucide-react";
import ListCourseStudent from "./list-course-student";
import { DialogHandlersCourses } from "../../page";
import { useState } from "react";
import { Inscripcion } from "@/shared/types/supabase.types";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import StudentAttendanceDetail from "./student-attendance-detail/student-attendance-detail";
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store";
import StudentAttendanceForce from "./student-attendance-force/student-attendance-force";
import StudentAttendancePays from "./student-attendance-pays/student-attendance-pays";


interface ListCourseProps {
  dialogHandlers: DialogHandlersCourses;
  mes: any;
  mesLabel: string
}

export default function ListCourse({ dialogHandlers, mes, mesLabel }: ListCourseProps) {
  const { inscripcionesByCurso } = useInscripcionesStore();

  const [inscripcionSelected, setInscripcionSelected] = useState<Inscripcion | null>(null);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [openAttendanceForceDialog, setOpenAttendanceForceDialog] = useState(false);
  const [openPaymentsDialog, setOpenPaymentsDialog] = useState(false);

  return (
    <>
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

        {!dialogHandlers.loading && inscripcionesByCurso.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay inscripciones para este curso
          </p>
        )}

        {/* Lista de alumnos */}
        {!dialogHandlers.loading && inscripcionesByCurso.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 overflow-auto">
            <span>Listado de alumnos ({inscripcionesByCurso.length})</span>
            <div className="flex flex-col gap-2">
              {inscripcionesByCurso.map((inscripcion) => {
                return (
                  <ListCourseStudent
                    key={inscripcion.id}
                    inscripcion={inscripcion}
                    setOpenAttendanceDialog={setOpenAttendanceDialog}
                    setOpenAttendanceForceDialog={setOpenAttendanceForceDialog}
                    setOpenPaymentsDialog={setOpenPaymentsDialog}
                    setInscripcionSelected={setInscripcionSelected}
                  />
                );
              })}
            </div>
          </div>
        )}

      </div>
      <GenericDialog
        openDialog={openAttendanceDialog}
        setOpenDialog={setOpenAttendanceDialog}
        title="Regularizar asistencia"
        description={`Regularizar asistencia de ${inscripcionSelected?.student?.name}`}
      >
        <div className="flex flex-col gap-2 w-xl">
          <StudentAttendanceDetail inscripcion={inscripcionSelected} course={dialogHandlers.selectedCourse} />
        </div>
      </GenericDialog>
      <GenericDialog
        openDialog={openPaymentsDialog}
        setOpenDialog={setOpenPaymentsDialog}
        title="Regularizar pagos"
        description={`Regularizar pagos de ${inscripcionSelected?.student?.name}`}
      >
        <div className="flex flex-col gap-2 w-xl">
          <StudentAttendancePays inscripcion={inscripcionSelected} course={dialogHandlers.selectedCourse} />
        </div>
      </GenericDialog>

      <GenericDialog
        openDialog={openAttendanceForceDialog}
        setOpenDialog={setOpenAttendanceForceDialog}
        title="Forzar asistencia"
        description={`Forzar asistencia de ${inscripcionSelected?.student?.name}`}
      >
        <div className="flex flex-col gap-2 w-xl">
          <StudentAttendanceForce inscripcion={inscripcionSelected} course={dialogHandlers.selectedCourse} setOpenDialog={setOpenAttendanceForceDialog} />
        </div>
      </GenericDialog>


    </>
  );
}