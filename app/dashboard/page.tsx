"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useAcademiaStore } from "@/lib/store/academia.store"
import { formatDate } from "@/lib/utils-functions/format-date"
import { useAlumnosStore } from "@/lib/store/registro/alumnos.store"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { NotebookPenIcon, QrCodeIcon, SearchIcon } from "lucide-react"
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store"
import AsistenciaCursoDetalle from "./(registro)/asistencia/asistencia-curso-detalle"
import { useState } from "react"
import { Curso } from "@/shared/types/supabase.types"
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store"

export default function DashboardPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null);

  const { countAlumnos, fetchCountAlumnos } = useAlumnosStore();
  const { academia } = useAcademiaStore();
  const { fetchCursos, cursos } = useCursosStore();
  const { fetchProfesores } = useProfesoresStore();

  const today = new Date();

  useEffect(() => {
    fetchCountAlumnos();
    fetchCursos();
    fetchProfesores();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-screen overflow-y-auto">
        <div className="w-full grid grid-cols-5 gap-4">
          <div className="bg-muted rounded-xl col-span-3 p-4 flex flex-col justify-center">
            <h2 className="font-display text-2xl">{academia?.name}</h2>
            <p>Suscripción: {academia?.plan_type === 'year' ? 'Anual' : 'Mensual'}</p>
            <p className="text-muted-foreground text-xs">vence el {formatDate(academia?.end_date)}</p>
          </div>
          <div className="col-span-2 flex justify-between gap-2">
            <div className="bg-muted rounded-xl p-2 flex flex-col justify-center gap-px grow">
              <p className="text-xs font-bold">Alumnos matriculados</p>
              <p className="font-display text-2xl">{countAlumnos}</p>
            </div>
            <div className="bg-muted rounded-xl p-2 flex flex-col justify-center gap-px grow">
              <p className="font-display text-3xl">{today.toLocaleDateString('es-ES', { weekday: 'long' })}</p>
              <p className="font-display text-lg">{today.toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full grid grid-cols-3 gap-4 bg-muted p-4 rounded-xl">
            <h3 className="col-span-3 text-xl font-bold">Asistencia rápida</h3>
            <div className="col-span-2 relative">
              <Input placeholder="Buscar por nombre o codigo" className="bg-card" />
              <Button variant="ghost" className="absolute right-2">
                <SearchIcon />
              </Button>
            </div>
            <div className="col-span-1">
              <Button className="w-full">
                <QrCodeIcon /> Marcar Asistencia QR
              </Button>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Cursos ({cursos.length})</h3>
              {/* lista de horarios para filtrar */}
              <div>

              </div>
            </div>
            <div className="flex flex-col gap-2">
              {cursos.map((curso) => (
                <div
                  key={curso.id}
                  className="grid grid-cols-4 gap-2 items-center bg-muted p-2 px-4 rounded-xl"
                >
                  <div className="">{curso.name}</div>
                  <p className="text-sm">días: {curso.schedule?.days?.join(', ')}</p>
                  <p className="text-sm">horario: {curso.schedule?.start_time} - {curso.schedule?.end_time}</p>
                  <Button variant="outline" onClick={() => {
                    setSelectedCourse(curso);
                    setOpenDialog(true);
                  }}>
                    Llamar asistencia
                    <NotebookPenIcon />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AsistenciaCursoDetalle
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        curso={selectedCourse}
      />
    </>
  )
}