'use client'

import { DataTable } from "@/components/own/table/data-table";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useState, useMemo, useEffect } from "react";
import { columns } from "./dt-columns";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import { PreciosForm } from "./precios-form";
import { usePreciosStore } from "@/lib/store/precios.store";
import { Precio } from "@/shared/types/supabase.types";

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


export default function PreciosPage() {
  const dialogHandlers = useDialogHandlers();
  const { precios, fetchPrecios, createPrecio, updatePrecio, deletePrecio } = usePreciosStore();

  useEffect(() => {
    fetchPrecios();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-2xl font-bold">Precios</h2>
      <p className="text-xs">Registro de todos los precios ofrecidos</p>
      <DataTable<Precio, unknown>
        columns={columns}
        data={precios || []}
        entity=""
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Nuevo Precio"
      >
        <PreciosForm dialogHandlers={dialogHandlers} onCreate={createPrecio} onEdit={updatePrecio} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deletePrecio}
      />
    </div>
  )
}
