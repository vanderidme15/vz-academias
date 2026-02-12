import { Inscripcion } from "@/shared/types/supabase.types";

interface StudentAttendancePaysProps {
  inscripcion: Inscripcion | null;
}

export default function StudentAttendancePays({ inscripcion }: StudentAttendancePaysProps) {
  return (
    <div>
      <h1>Student Attendance Pays</h1>
    </div>
  );
}