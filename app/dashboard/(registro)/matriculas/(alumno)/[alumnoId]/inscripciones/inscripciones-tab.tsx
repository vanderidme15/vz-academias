"use client"

import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { DataTable } from "@/components/own/table/data-table";
import { Alumno, Inscripcion } from "@/shared/types/supabase.types";
import { DialogHandlers, ExtraAction } from "@/shared/types/ui.types";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./inscripcion-columns";
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store";
import InscripcionForm from "./inscripcion-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InscripcionPagosTable from "./inscripcion-pagos/inscripcion-pagos-table";
import { EyeIcon, PiggyBankIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";


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
    fetchInscripcionesByAlumnoId,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion,
    setSelectedInscripcion,
    selectedInscripcion
  } = useInscripcionesStore();

  useEffect(() => {
    fetchInscripcionesByAlumnoId(student.id);
  }, [student, fetchInscripcionesByAlumnoId]);

  useEffect(() => {
    setSelectedInscripcion(dialogHandlers.selectedItem);
  }, [dialogHandlers.selectedItem]);

  const extraActions: ExtraAction[] = [
    {
      label: "Compartir Carnet",
      handler: async (inscripcion: Inscripcion) => {
        const url = `${window.location.origin}/carnet/${inscripcion.id}`;
        const mensaje = `Hola ${inscripcion.student?.name || ''}, aquí está tu carnet de inscripción: ${url}, por favor preséntalo en la entrada`;
        // Usar el número del estudiante o del padre si es menor de edad
        const numero = inscripcion.student?.is_under_18 && inscripcion.student?.parent_cellphone
          ? inscripcion.student.parent_cellphone
          : inscripcion.student?.cellphone;

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
      label: "Ver Carnet",
      handler: (inscripcion: Inscripcion) => {
        const url = `${window.location.origin}/carnet/${inscripcion.id}`;
        window.open(url, "_blank");
      },
      icon: EyeIcon
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-auto">
      <DataTable<Inscripcion, unknown>
        columns={columns}
        data={inscripciones || []}
        entity="Inscribir a curso"
        dialogHandlers={dialogHandlers}
        extraActions={extraActions}
      />
      {/* Dialogs para acciones de inscripciones */}
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title={dialogHandlers.selectedItem ? 'Editar inscripción a curso' : 'Nueva inscripción a curso'}
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