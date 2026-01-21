"use client"

import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { Inscripcion } from "@/shared/types/supabase.types";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./inscripcion-columns";
import { useInscripcionesStore } from "@/lib/store/inscripciones.store";
import InscripcionForm from "./inscripcion-form";


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

export default function InscripcionesTab() {
  const dialogHandlers = useDialogHandlers();
  const { inscripciones, fetchInscripciones, createInscripcion, updateInscripcion, deleteInscripcion } = useInscripcionesStore();

  useEffect(() => {
    fetchInscripciones();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <DataTable<Inscripcion, unknown>
        columns={columns}
        data={inscripciones || []}
        entity="Inscripcion"
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Nueva Inscripcion"
      >
        <InscripcionForm dialogHandlers={dialogHandlers} onCreate={createInscripcion} onEdit={updateInscripcion} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deleteInscripcion}
      />
    </div>
  )
}