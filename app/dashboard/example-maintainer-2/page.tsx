"use client"

import { DataTable } from "@/components/own/table/data-table";
import { DialogHandlers, ExtraAction } from "@/shared/types/ui.types";
import { useState, useMemo, useEffect } from "react";
import { columns } from "./dt-columns";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import { useInscripcionesStore } from "@/lib/store/inscripciones.store";
import { InscripcionesForm } from "./inscripciones-form";
import { toast } from "sonner";
import { BanIcon, EyeIcon, PlusIcon, SendIcon } from "lucide-react";
import { Inscripcion } from "@/shared/types/supabase.types";
import { InscripcionHistoryList } from "./inscripcion-history-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePreciosStore } from "@/lib/store/precios.store";
import PagosTable from "./pagos/pagos-table";

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

export default function InscripcionesPage() {
  const dialogHandlers = useDialogHandlers();
  const { inscripciones, fetchInscripciones, createInscripcion, updateInscripcion, deleteSoftInscripcion, selectedInscripcion, setSelectedInscripcion } = useInscripcionesStore();
  const { fetchPrecios } = usePreciosStore();

  useEffect(() => {
    fetchInscripciones();
    fetchPrecios();
  }, []);

  useEffect(() => {
    //selectedItem solo cambia cuando se selecciona un item de la tabla y da inicio a selectedInscription
    // al crear o editar un item de la tabla se actualiza selectedInscripcion en el store por cada accion
    setSelectedInscripcion(dialogHandlers.selectedItem);
  }, [dialogHandlers.selectedItem]);

  const extraActionsBuilder = (voluntario: Inscripcion) => {
    const extraActions: ExtraAction[] = [
      {
        label: "Compartir Ticket",
        handler: async (voluntario: Inscripcion) => {
          const url = `${window.location.origin}/campista/${voluntario.id}`;
          const mensaje = `Hola ${voluntario.name || ''}, aquí está tu ticket de inscripción: ${url}`;

          // Usar el número del campista o del padre si es menor de edad
          const numero = voluntario.is_under_18 && voluntario.parent_cellphone_number
            ? voluntario.parent_cellphone_number
            : voluntario.cellphone_number;

          if (!numero) {
            toast.error("No hay número de teléfono registrado");
            return;
          }

          // Limpiar el número (remover espacios, guiones, etc.)
          const numeroLimpio = numero.replace(/\D/g, '');

          // Agregar código de país de Perú (+51)
          const numeroCompleto = `51${numeroLimpio}`;

          const whatsappUrl = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensaje)}`;
          window.open(whatsappUrl, "_blank");
        },
        icon: SendIcon
      },
      {
        label: "Ver Ticket",
        handler: (voluntario: Inscripcion) => {
          const url = `${window.location.origin}/campista/${voluntario.id}`;
          window.open(url, "_blank");
        },
        icon: EyeIcon
      },
    ];
    if (voluntario.is_active) {
      extraActions.push({
        label: "Cancelar Inscripción",
        handler: (voluntario: Inscripcion) => {
          dialogHandlers.setSelectedItem(voluntario)
          dialogHandlers.setOpenDialogDelete(true)
          dialogHandlers.setCustomAction("Cancelar Inscripción")
        },
        icon: BanIcon,
        variant: 'destructive'
      })
    } else {
      extraActions.push({
        label: "Re-inscribir",
        handler: (voluntario: Inscripcion) => {
          dialogHandlers.setSelectedItem(voluntario)
          dialogHandlers.setOpenDialogDelete(true)
          dialogHandlers.setCustomAction("Re-inscribir")
        },
        icon: PlusIcon
      })
    }
    return extraActions;
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      <h2 className="text-2xl font-bold">Inscripciones</h2>
      <p className="text-xs">Registro de todos los campistas</p>
      <DataTable
        columns={columns}
        data={inscripciones || []}
        entity=""
        dialogHandlers={dialogHandlers}
        disableDelete={true}
        extraActionsBuilder={extraActionsBuilder}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Inscribir"
      >
        <Tabs defaultValue="form" className="w-full overflow-auto">
          <TabsList className="w-full">
            <TabsTrigger value="form">Formulario</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="w-full overflow-auto">
            <InscripcionesForm dialogHandlers={dialogHandlers} onCreate={createInscripcion} onEdit={updateInscripcion} />
          </TabsContent>
          <TabsContent value="pagos" className="w-full overflow-auto">
            {selectedInscripcion ? (
              <PagosTable inscripcion={selectedInscripcion} />
            ) : (
              <p className="text-center py-10 text-gray-500">
                Una vez inscrito un campista, puedes ver sus pagos aquí
              </p>
            )}
          </TabsContent>
          <TabsContent value="history" className="w-full overflow-auto">
            {dialogHandlers.selectedItem ? (
              <InscripcionHistoryList inscripcionId={dialogHandlers.selectedItem.id} inscripcionName={dialogHandlers.selectedItem.name} registerBy={dialogHandlers.selectedItem.register_by} />
            ) : (
              <p className="text-center py-10 text-gray-500">
                Una vez inscrito un campista, puedes ver su historial aquí
              </p>
            )}
          </TabsContent>
        </Tabs>
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deleteSoftInscripcion}
        customAction={dialogHandlers.customAction}
      />
    </div>
  )
}