"use client"

import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { Profesor } from "@/shared/types/supabase.types";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./curso-columns";
import ProfesorForm from "./curso-form";
import { useProfesoresStore } from "@/lib/store/profesores.store";
import { useCursosStore } from "@/lib/store/cursos.store";
import CursoForm from "./curso-form";


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

export default function CursosPage() {
  const dialogHandlers = useDialogHandlers();
  const { cursos, fetchCursos, createCurso, updateCurso, deleteCurso } = useCursosStore();

  useEffect(() => {
    fetchCursos();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-2xl font-bold">Cursos</h2>
      <p className="text-xs">Registro de todos los cursos brindados</p>
      <DataTable<Profesor, unknown>
        columns={columns}
        data={cursos || []}
        entity="Curso"
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Nuevo Curso"
      >
        <CursoForm dialogHandlers={dialogHandlers} onCreate={createCurso} onEdit={updateCurso} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deleteCurso}
      />
    </div>
  )
}