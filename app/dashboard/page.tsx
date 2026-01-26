"use client"

import { Button } from "@/components/ui/button"
import { Backpack, Contact, NotebookPenIcon, QrCodeIcon, ScanSearchIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { QRScannerModal } from "@/components/own/check-in/qr-scanner-modal"
import { EntityDetailModal } from "@/components/own/check-in/entity-detail-modal"
import { CheckInButton } from "@/components/own/check-in/check-in-button"
import { useCheckIn } from "@/components/own/check-in/use-check-in"

import { Inscripcion } from "@/shared/types/supabase.types"
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {



  const router = useRouter()
  //cambiar esto por el check-in de alumnos
  const { fetchInscripcionById } = useInscripcionesStore()

  // const checkInInscripciones = useCheckIn<Inscripcion>({
  //   type: 'inscripcion',
  //   fetchById: fetchInscripcionById,
  //   handleCheckIn: handleCheckInInscripcion,
  // })

  return (
    <div className="flex flex-col gap-4 w-full h-screen overflow-y-auto">
      <div className="w-full grid grid-cols-5 gap-4">
        <div className="bg-muted rounded-xl col-span-3 p-4 flex flex-col justify-center">
          <h2 className="font-display text-2xl">Nombre de la academia</h2>
          <p>nombre del plan</p>
          <p className="text-muted-foreground text-sm">fecha de inicio - fecha de fin</p>
        </div>
        <div className="col-span-2 flex justify-between gap-2">
          <div className="bg-muted rounded-xl p-2 flex flex-col justify-center gap-2 grow">
            <p className="text-xs">Alumnos activos</p>
            <p className="font-display text-2xl">100</p>
          </div>
          <div className="bg-muted rounded-xl p-2 flex flex-col justify-center gap-2 grow">
            <p className="font-display text-2xl">Hoy</p>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full grid grid-cols-3 gap-4 bg-muted p-4 rounded-xl">
          <h3 className="col-span-3 text-xl font-bold">Asistencia rápida</h3>
          <div className="col-span-2 relative bg-card">
            <Input placeholder="Buscar por nombre o codigo" />
            <Button variant="ghost" className="absolute right-2">
              <SearchIcon />
            </Button>
          </div>
          <div className="col-span-1 border">
            <Button className="w-full">
              <QrCodeIcon /> Marcar Asistencia QR
            </Button>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <h3 className="text-xl font-bold">Cursos</h3>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 bg-muted p-2 px-4 rounded-xl"
              >
                <p>Nombre del curso</p>
                <p>Horario: 8:00 - 12:00</p>
                <p>10 alumnos</p>
                <Button>
                  <NotebookPenIcon />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col items-center gap-2">
        <span className="text-2xl font-bold">Check-in</span>
        <div className="flex justify-center items-center gap-2">
          <CheckInButton onClick={checkInInscripciones.handleStartScan} label="Check-in Campistas" />
          <CheckInButton onClick={checkInVoluntarios.handleStartScan} label="Check-in Voluntarios" />
        </div>
      </div> */}

      {/* <QRScannerModal
        open={checkInInscripciones.showScanModal}
        onClose={checkInInscripciones.handleCloseScanModal}
        onQRScanned={checkInInscripciones.handleQRScanned}
      />

      <EntityDetailModal
        open={checkInInscripciones.showResultModal}
        onClose={checkInInscripciones.handleCloseResultModal}
        entity={checkInInscripciones.scanResult}
        onConfirmCheckIn={checkInInscripciones.handleConfirmCheckIn}
        type="inscripcion"
      />

      <QRScannerModal
        open={checkInVoluntarios.showScanModal}
        onClose={checkInVoluntarios.handleCloseScanModal}
        onQRScanned={checkInVoluntarios.handleQRScanned}
      />

      <EntityDetailModal
        open={checkInVoluntarios.showResultModal}
        onClose={checkInVoluntarios.handleCloseResultModal}
        entity={checkInVoluntarios.scanResult}
        onConfirmCheckIn={checkInVoluntarios.handleConfirmCheckIn}
        type="voluntario"
      /> */}
    </div>
  )
}