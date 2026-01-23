"use client"

import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { Alumno, Inscripcion } from "@/shared/types/supabase.types";
import { DialogHandlers } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./inscripcion-columns";
import { useInscripcionesStore } from "@/lib/store/inscripciones.store";
import InscripcionForm from "./inscripcion-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InscripcionPagosTable from "./inscripcion-pagos/inscripcion-pagos-table";
import { PiggyBankIcon } from "lucide-react";


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

export default function InscripcionesTab({ student }: { student: Alumno }) {
  const dialogHandlers = useDialogHandlers();
  const {
    inscripciones,
    fetchInscripciones,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion,
    setSelectedInscripcion,
    selectedInscripcion
  } = useInscripcionesStore();

  useEffect(() => {
    fetchInscripciones();
  }, []);

  useEffect(() => {
    setSelectedInscripcion(dialogHandlers.selectedItem);
  }, [dialogHandlers.selectedItem]);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <DataTable<Inscripcion, unknown>
        columns={columns}
        data={inscripciones || []}
        entity="Inscripción"
        dialogHandlers={dialogHandlers}
      />
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title={dialogHandlers.selectedItem ? 'Editar Inscripción' : 'Nueva Inscripción'}
      >
        <Tabs defaultValue="form" className="w-full overflow-auto">
          <TabsList className="w-full">
            <TabsTrigger value="form">Formulario</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="w-full overflow-auto">
            <InscripcionForm
              dialogHandlers={dialogHandlers}
              onCreate={createInscripcion}
              onEdit={updateInscripcion}
              student={student}
            />
          </TabsContent>
          <TabsContent value="pagos" className="w-full overflow-auto">
            {selectedInscripcion ? (
              <InscripcionPagosTable inscripcion={selectedInscripcion} />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 w-sm">
                <PiggyBankIcon size={24} />
                <p className="text-center">Un vez inscrito el alumno, se mostrarán los pagos aquí</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
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