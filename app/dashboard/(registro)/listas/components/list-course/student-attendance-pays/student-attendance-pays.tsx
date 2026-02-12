import { Curso, Inscripcion } from "@/shared/types/supabase.types";

interface StudentAttendancePaysProps {
  inscripcion: Inscripcion | null;
  course: Curso | null;
}

export default function StudentAttendancePays({ inscripcion, course }: StudentAttendancePaysProps) {
  return (
    <div>
      <h1>Student Attendance Pays</h1>
    </div>
  );
}