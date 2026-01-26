"use client"

import { useAcademiaStore } from "@/lib/store/academia.store"
import { formatDate } from "@/lib/utils-functions/format-date"
import { useAlumnosStore } from "@/lib/store/registro/alumnos.store"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { NotebookPenIcon, QrCodeIcon, SearchIcon } from "lucide-react"
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store"
import AsistenciaCursoDetalle from "./(registro)/asistencia/asistencia-curso-detalle"
import { useState } from "react"
import { Curso, Inscripcion } from "@/shared/types/supabase.types"
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store"
import { QRScannerModal } from "@/components/own/check-in/qr-scanner-modal"
import { InscripcionDetailModal } from "@/components/own/check-in/entity-detail-modal"
import { useCheckIn } from "@/components/own/check-in/use-check-in"
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"

export default function DashboardPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null);

  const { countAlumnos, fetchCountAlumnos } = useAlumnosStore();
  const { academia } = useAcademiaStore();
  const { fetchCursos, cursos } = useCursosStore();
  const { fetchProfesores } = useProfesoresStore();
  const { fetchInscripcionById, handleConfirmCheckIn } = useInscripcionesStore();

  const today = new Date();

  useEffect(() => {
    fetchCountAlumnos();
    fetchCursos();
    fetchProfesores();
  }, []);

  const checkInInscripciones = useCheckIn<Inscripcion>({
    type: 'inscripcion',
    fetchById: fetchInscripcionById,
    handleCheckIn: handleConfirmCheckIn,
  })

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
          <div className="w-full gap-4 bg-muted p-4 rounded-xl">
            <h3 className="text-xl font-bold w-full">Asistencia rápida</h3>
            <div className="flex justify-center items-center gap-2 w-full">
              <Button>
                <SearchIcon /> Buscar Alumno
              </Button>
              <Button onClick={checkInInscripciones.handleStartScan}>
                <QrCodeIcon /> Marcar Asistencia con QR
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
      <QRScannerModal
        open={checkInInscripciones.showScanModal}
        onClose={checkInInscripciones.handleCloseScanModal}
        onQRScanned={checkInInscripciones.handleQRScanned}
      />

      {/* <EntityDetailModal
        open={checkInInscripciones.showResultModal}
        onClose={checkInInscripciones.handleCloseResultModal}
        entity={checkInInscripciones.scanResult}
        onConfirmCheckIn={checkInInscripciones.handleConfirmCheckIn}
      /> */}
      <InscripcionDetailModal
        open={checkInInscripciones.showResultModal}
        onClose={checkInInscripciones.handleCloseResultModal}
        inscripcion={checkInInscripciones.scanResult}
        onConfirmAction={checkInInscripciones.handleConfirmCheckIn}
        actionLabel="Registrar asistencia" // Opcional, por defecto es "Confirmar"
      />
    </>
  )
}