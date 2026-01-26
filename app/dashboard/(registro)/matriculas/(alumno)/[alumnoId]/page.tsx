'use client'

import { useAlumnosStore } from "@/lib/store/registro/alumnos.store";
import { Alumno } from "@/shared/types/supabase.types";
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookAIcon, UserIcon } from "lucide-react"
import AlumnoForm from "../../alumno-form";
import { DialogHandlers } from "@/shared/types/ui.types";
import InscripcionesTab from "./inscripciones/inscripciones-tab";

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

export default function AlumnoPage() {
  const params = useParams();
  const alumnoId = params.alumnoId;

  const dialogHandlers = useDialogHandlers();
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const { fetchAlumnoById, createAlumno, updateAlumno } = useAlumnosStore();

  useEffect(() => {
    const loadAlumno = async () => {
      if (alumnoId) {
        const alumno = await fetchAlumnoById(alumnoId.toString());
        setAlumno(alumno);
        dialogHandlers.setSelectedItem(alumno);
      }
    }
    loadAlumno();
  }, [alumnoId]);

  if (!alumno) {
    return <div>No se encontro el alumno</div>
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-y-auto">
      <h2 className="text-2xl font-bold">Detalle del alumno - {alumno?.name}</h2>

      <Tabs defaultValue="datos" className="grow flex flex-col overflow-y-auto">
        <TabsList className="w-full">
          <TabsTrigger value="datos">
            <UserIcon />
            Datos del alumno
          </TabsTrigger>
          <TabsTrigger value="cursos">
            <BookAIcon />
            Cursos
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="datos"
          className="grow flex flex-col gap-2 overflow-y-auto"
        >
          <h4 className="text-sm">Datos del alumno</h4>
          <div className="grow flex flex-col gap-2 overflow-y-auto border rounded-lg p-2">
            {/* Aqui en principio solo se usa para editar */}
            {alumno && (
              <AlumnoForm dialogHandlers={dialogHandlers} onCreate={createAlumno} onEdit={updateAlumno} />
            )}
          </div>
        </TabsContent>
        <TabsContent value="cursos" className="w-full h-full flex flex-col gap-2 overflow-y-auto">
          <h4 className="text-sm">Listado de cursos al que se inscribio el alumno</h4>
          <div className="w-full h-full flex flex-col gap-2 overflow-y-auto border rounded-lg p-2">
            <InscripcionesTab student={alumno} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}