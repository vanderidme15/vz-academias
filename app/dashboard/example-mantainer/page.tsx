'use client'

import { DataTable } from "@/components/own/table/data-table";
import { useVoluntariosStore } from "@/lib/store/voluntarios.store";
import { Voluntario } from "@/shared/types/supabase.types";
import { DialogHandlers, ExtraAction } from "@/shared/types/ui.types";
import { BanIcon, EyeIcon, Link2Icon, PlusIcon } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { columns } from "./dt-columns";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteDialog from "@/components/own/generic-dialog/delete-dialog";
import { VoluntariosForm } from "./voluntarios-form";
import { VoluntariosHistoryList } from "./voluntarios-history-list";

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
    setCustomAction,
  }), [openDialog, setOpenDialog, openDialogDelete, setOpenDialogDelete, selectedItem, setSelectedItem, customAction, setCustomAction]);
}


export default function VoluntariosPage() {
  const dialogHandlers = useDialogHandlers();
  const { voluntarios, fetchVoluntarios, createVoluntario, updateVoluntario, deleteSoftVoluntario } = useVoluntariosStore();

  useEffect(() => {
    fetchVoluntarios();
  }, []);

  const extraActionsBuilder = (voluntario: Voluntario) => {
    const extraActions: ExtraAction[] = [
      {
        label: "Compartir Ticket",
        handler: async (voluntario: Voluntario) => {
          const url = `${window.location.origin}/voluntario/${voluntario.id}`;
          try {
            await navigator.clipboard.writeText(url);
            toast.info(`${url} copiado al portapapeles`);
          } catch (err) {
            toast.error("Error al copiar");
          }
        },
        icon: Link2Icon
      },
      {
        label: "Ver Ticket",
        handler: (voluntario: Voluntario) => {
          const url = `${window.location.origin}/voluntario/${voluntario.id}`;
          window.open(url, "_blank");
        },
        icon: EyeIcon
      },
    ];
    if (voluntario.is_active) {
      extraActions.push({
        label: "Cancelar Inscripción",
        handler: (voluntario: Voluntario) => {
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
        handler: (voluntario: Voluntario) => {
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
      <h2 className="text-2xl font-bold">Voluntarios</h2>
      <p className="text-xs">Registro de todos los voluntarios</p>
      <DataTable
        columns={columns}
        data={voluntarios || []}
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
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="w-full overflow-auto">
            <VoluntariosForm dialogHandlers={dialogHandlers} onCreate={createVoluntario} onEdit={updateVoluntario} />
          </TabsContent>
          <TabsContent value="history" className="w-full overflow-auto">
            {dialogHandlers.selectedItem ? (
              <VoluntariosHistoryList voluntarioId={dialogHandlers.selectedItem.id} voluntarioName={dialogHandlers.selectedItem.name} />
            ) : (
              <p className="text-center py-10 text-gray-500">
                Una vez creado un voluntario, puedes ver su historial aquí
              </p>
            )}
          </TabsContent>
        </Tabs>
      </GenericDialog>
      <DeleteDialog
        openDeleteDialog={dialogHandlers.openDialogDelete}
        setOpenDeleteDialog={dialogHandlers.setOpenDialogDelete}
        selectedItem={dialogHandlers.selectedItem}
        action={deleteSoftVoluntario}
        customAction={dialogHandlers.customAction}
      />
    </div>
  )
}
