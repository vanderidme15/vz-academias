"use client"

import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { Profesor } from "@/shared/types/supabase.types";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./profesor-columns";
import ProfesorForm from "./profesor-form";
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store";


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

export default function ProfesoresPage() {
  const dialogHandlers = useDialogHandlers();
  const { profesores, fetchProfesores, createProfesor, updateProfesor, deleteProfesor } = useProfesoresStore();

  useEffect(() => {
    fetchProfesores();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-2xl font-bold">Profesores</h2>
      <p className="text-xs">Registro de todos los profesores</p>
      <DataTable<Profesor, unknown>
        columns={columns}
        data={profesores || []}
        entity="Profesor(a)"
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Nuevo Profesor(a)"
      >
        <ProfesorForm dialogHandlers={dialogHandlers} onCreate={createProfesor} onEdit={updateProfesor} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deleteProfesor}
      />
    </div>
  )
}