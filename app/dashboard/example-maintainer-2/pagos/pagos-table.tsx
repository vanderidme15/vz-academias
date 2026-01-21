import { Inscripcion } from "@/shared/types/supabase.types";
import { DataTable } from "@/components/own/table/data-table";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useState, useMemo } from "react";
import { columns } from "./dt-columns";
import { PagosForm } from "./pagos-form";
import { useInscripcionesStore } from "@/lib/store/inscripciones.store";


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

export default function PagosTable({ inscripcion }: { inscripcion: Inscripcion }) {
  const dialogHandlers = useDialogHandlers();
  const { createPayment, updatePayment, deletePayment } = useInscripcionesStore();

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-lg font-bold">Pagos registrados</h2>
      <DataTable
        columns={columns}
        data={inscripcion?.payments || []}
        entity=""
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Nuevo Precio"
      >
        <PagosForm dialogHandlers={dialogHandlers} selectedInscripcion={inscripcion} onCreate={createPayment} onEdit={updatePayment} />
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={(paymentId: string) => deletePayment(paymentId, inscripcion.id)}
      />
    </div>
  )
}