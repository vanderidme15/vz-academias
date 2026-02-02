'use client'

import { DialogHandlers } from "@/shared/types/ui.types";
import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/own/table/data-table";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import { Alumno } from "@/shared/types/supabase.types";
import { columns } from "./alumno-columns";
import { useAlumnosStore } from "@/lib/store/registro/alumnos.store";
import AlumnoForm from "./alumno-form";
import { EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function MatriculasPage() {
  const dialogHandlers = useDialogHandlers();
  const { alumnos, fetchAlumnos, createAlumno, updateAlumno, deleteAlumno } = useAlumnosStore();
  const router = useRouter();

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const extraActions = [
    {
      label: "Ver alumno",
      icon: EyeIcon,
      handler: (row: Alumno) => {
        dialogHandlers.setSelectedItem(row);
        router.push(`/dashboard/matriculas/${row.id}`);
      }
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-2xl font-bold">Matrículas</h2>
      <p className="text-xs">Registro de todos los alumnos matriculados y sus cursos</p>
      <DataTable<Alumno, unknown>
        columns={columns}
        data={alumnos || []}
        entity="Matricular"
        dialogHandlers={dialogHandlers}
        disableDelete={true}
        disableEdit={true}
        extraActions={extraActions}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Nueva Matrícula"
      >
        <AlumnoForm dialogHandlers={dialogHandlers} onCreate={createAlumno} onEdit={updateAlumno} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deleteAlumno}
      />
    </div>
  )
}