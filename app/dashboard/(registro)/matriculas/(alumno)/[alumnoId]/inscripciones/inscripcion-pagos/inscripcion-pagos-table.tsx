import { Inscripcion } from "@/shared/types/supabase.types";
import { DataTable } from "@/components/own/table/data-table";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useState, useMemo } from "react";
import { useInscripcionesStore } from "@/lib/store/inscripciones.store";
import { PagoForm } from "./pago-form";
import { columns } from "./pago-columns";


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

export default function InscripcionPagosTable({ inscripcion }: { inscripcion: Inscripcion }) {
  const dialogHandlers = useDialogHandlers();
  const { createPayment, updatePayment, deletePayment } = useInscripcionesStore();

  const totalPaid = inscripcion?.payments?.reduce((total, payment) => total + (payment.payment_amount || 0), 0);
  const totalBalance = (inscripcion?.price_charged || 0) - (totalPaid || 0);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex gap-2 items-center">
        <div className="font-bold flex flex-col">
          <span>Costo total: S/ {inscripcion?.price_charged}</span>
          {inscripcion?.includes_registration && (
            <div className="text-xs font-light">(Curso: S/{inscripcion?.course_price} + Matrícula: S/{inscripcion?.registration_price})</div>
          )}
        </div>
        <span>|</span>
        <div className="flex flex-col gap-px text-sm">
          <div className="text-green-600 font-bold">Pagado: S/ {totalPaid}</div>
          <div className="text-red-700 font-bold">Saldo: S/ {totalBalance}</div>
        </div>
      </div>
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
        <PagoForm dialogHandlers={dialogHandlers} selectedInscripcion={inscripcion} onCreate={createPayment} onEdit={updatePayment} />
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