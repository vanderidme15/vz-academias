"use client"

import GenericDialog from "@/components/own/generic-dialog/generic-dialog"
import { Curso } from "@/shared/types/supabase.types";
import { useEffect, useState } from "react"
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"

interface AsistenciasCursoDetalleProps {
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
  curso: Curso | null
}

export default function AsistenciaCursoDetalle({ openDialog, setOpenDialog, curso }: AsistenciasCursoDetalleProps) {

  const { fetchInscripcionesByCursoId } = useInscripcionesStore();

  useEffect(() => {
    const fetchInscripciones = async () => {
      if (curso) {
        const inscripciones = await fetchInscripcionesByCursoId(curso.id);
        console.log(inscripciones);
      }
    }
    fetchInscripciones();
  }, [curso]);

  if (!curso) return null;

  return (
    <GenericDialog openDialog={openDialog} setOpenDialog={setOpenDialog} title="Asistencia del curso">
      <div className="flex justify-between items-center border px-2 py-1 rounded border-dashed">
        <p className="text-lg">{curso.name}</p>
        <div>
          <p className="text-xs">{curso.schedule?.days?.join(', ')}</p>
          <p className="text-sm">{curso.schedule?.start_time} - {curso.schedule?.end_time}</p>
        </div>
      </div>
      {/* Aqui pedir la lista de alumnos */}
      <div>

      </div>
    </GenericDialog>
  )
}