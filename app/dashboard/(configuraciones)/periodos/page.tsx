"use client"

import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { usePeriodosStore } from "@/lib/store/configuraciones/periodos.store";
import { Periodo } from "@/shared/types/supabase.types";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./periodo-columns";
import PeriodoForm from "./periodo-form";


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

export default function PeriodosPage() {
  const dialogHandlers = useDialogHandlers();
  const { periodos, fetchPeriodos, createPeriodo, updatePeriodo, deletePeriodo } = usePeriodosStore();

  useEffect(() => {
    fetchPeriodos();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-2xl font-bold">Periodos</h2>
      <p className="text-xs">Registro de todos los periodos</p>
      <DataTable<Periodo, unknown>
        columns={columns}
        data={periodos || []}
        entity="Periodo"
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title={dialogHandlers.selectedItem ? 'Editar Periodo' : 'Nuevo Periodo'}
      >
        <PeriodoForm dialogHandlers={dialogHandlers} onCreate={createPeriodo} onEdit={updatePeriodo} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deletePeriodo}
      />
    </div>
  )
}