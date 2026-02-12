import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { Curso, Inscripcion } from "@/shared/types/supabase.types";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./student-attendance-columns";
import { StudentAttendanceForm } from "./student-attendance-form";
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store";
import { useAsistenciasStore } from "@/lib/store/registro/asistencias.store";

function useDialogHandlers(): DialogHandlers {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customAction, setCustomAction] = useState<string | undefined>(undefined);

  return useMemo(() => ({
    openDialog,
    setOpenDialog,
    openDialogDelete,
    setOpenDialogDelete,
    selectedItem,
    setSelectedItem,
    customAction,
    setCustomAction
  }), [openDialog, setOpenDialog, openDialogDelete, setOpenDialogDelete, selectedItem, setSelectedItem, customAction, setCustomAction]);
}

interface StudentAttendanceDetailProps {
  inscripcion: Inscripcion | null;
  course: Curso | null;
}


export default function StudentAttendanceDetail({ inscripcion, course }: StudentAttendanceDetailProps) {
  const dialogHandlers = useDialogHandlers();
  const { handleRegularizeCreateAttendance, handleRegularizeUpdateAttendance, handleRegularizeDeleteAttendance } = useInscripcionesStore();
  const { fetchAsistenciasByRegistrationId, asistenciasByRegistrationId } = useAsistenciasStore();

  useEffect(() => {
    if (inscripcion) {
      fetchAsistenciasByRegistrationId(inscripcion.id);
    }
  }, [inscripcion]);

  const totalAsistencias = useMemo(() => {
    return asistenciasByRegistrationId?.filter((asistencia) => asistencia.admin_check).length || 0;
  }, [asistenciasByRegistrationId]);

  if (!inscripcion) return null;

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex gap-2 items-center">
        <div className="font-bold flex flex-col">
          <span>Total de asistencias: {totalAsistencias}</span>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={asistenciasByRegistrationId || []}
        entity="Asistencia"
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title={dialogHandlers.selectedItem ? 'Editar asistencia' : 'Agregar asistencia'}
      >
        <StudentAttendanceForm
          dialogHandlers={dialogHandlers}
          selectedInscripcion={inscripcion}
          teacherId={course?.teacher_id}
          onCreate={handleRegularizeCreateAttendance}
          onUpdate={handleRegularizeUpdateAttendance}
        />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={(paymentId: string) => handleRegularizeDeleteAttendance(paymentId, inscripcion.id)}
      />
    </div>
  );
}