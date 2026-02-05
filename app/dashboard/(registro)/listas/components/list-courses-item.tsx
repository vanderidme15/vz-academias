import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UsersIcon } from "lucide-react";
import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";
import { Curso } from "@/shared/types/supabase.types";
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store";

interface ListCoursesItemProps {
  curso: Curso;
  date: Date;
  dialogHandlers: any;
}

export default function ListCoursesItem({ curso, date, dialogHandlers }: ListCoursesItemProps) {
  const { fetchInscripcionesByCursoAndCurrentMonth } = useInscripcionesStore();

  const getStudents = async () => {
    const inscripciones = await fetchInscripcionesByCursoAndCurrentMonth(curso.id, date);
    // console.log(inscripciones);
    dialogHandlers.setInscripcionesByCurso(inscripciones);
    dialogHandlers.setOpenDialog(true);
    dialogHandlers.setSelectedCourse(curso);
  }

  return (
    <div
      className="flex items-center gap-2 p-4 border rounded-xl bg-card hover:bg-primary/5 cursor-pointer"
      onClick={getStudents}
    >
      <div style={{ backgroundColor: curso.color }} className="w-2 h-12 rounded-full"></div>
      <div className="grow flex flex-col md:flex-row gap-1 md:items-end">
        <div className="grow flex flex-col">
          <p className="font-bold">{curso.name}</p>
          <div className="flex gap-3 text-sm">
            <p className="flex items-center gap-1"><CalendarIcon size={12} className="text-muted-foreground" />{getShortDays(curso.schedule?.days || [])}</p>
            <p className="flex items-center gap-1"><ClockIcon size={12} className="text-muted-foreground" />{formatTime(curso.schedule?.start_time)} - {formatTime(curso.schedule?.end_time)}</p>
          </div>
          <p className="text-xs text-muted-foreground">{curso.teacher?.name}</p>
        </div>
        <Button className="" variant="outline" onClick={getStudents}>
          Ver alumnos
          <UsersIcon />
        </Button>
      </div>
    </div>
  )
}