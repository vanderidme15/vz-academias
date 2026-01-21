"use client"

import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { useHorariosStore } from "@/lib/store/horarios.store";
import { Horario } from "@/shared/types/supabase.types";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./horario-columns";
import HorarioForm from "./horario-form";


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

export default function HorariosPage() {
  const dialogHandlers = useDialogHandlers();
  const { horarios, fetchHorarios, createHorario, updateHorario, deleteHorario } = useHorariosStore();

  useEffect(() => {
    fetchHorarios();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-2xl font-bold">Horarios</h2>
      <p className="text-xs">Registro de todos los horarios</p>
      <DataTable<Horario, unknown>
        columns={columns}
        data={horarios || []}
        entity="Horario"
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Nuevo Horario"
      >
        <HorarioForm dialogHandlers={dialogHandlers} onCreate={createHorario} onEdit={updateHorario} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deleteHorario}
      />
    </div>
  )
}