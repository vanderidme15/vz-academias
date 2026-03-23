"use client"

import { useAcademiaStore } from "@/lib/store/academia.store"
import { formatDate, formatTime, getShortDays } from "@/lib/utils-functions/format-date"
import { useAlumnosStore } from "@/lib/store/registro/alumnos.store"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon, GraduationCapIcon, NotebookPenIcon, QrCodeIcon, SearchIcon, Check, ChevronsUpDown } from "lucide-react"
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store"
import AsistenciaCursoDetalle from "./(registro)/listas/components/asistencia-curso-detalle"
import { Curso, Inscripcion } from "@/shared/types/supabase.types"
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store"
import { QRScannerModal } from "@/components/own/check-in/qr-scanner-modal"
import { InscripcionDetailModal } from "@/components/own/check-in/entity-detail-modal"
import { useCheckIn } from "@/components/own/check-in/use-check-in"
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"
import { ManualSearchModal } from "@/components/own/check-in/manual-search-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Clave de horario derivada desde los campos del curso
type HorarioKey = string // formato: "days|start_time|end_time"

interface HorarioOption {
  key: HorarioKey
  days: string[]
  start_time: string
  end_time: string
  label: string
}

// Construye una clave única para identificar un horario a partir de los campos del curso
function buildHorarioKey(curso: Curso): HorarioKey | null {
  if (!curso.schedule_days?.length || !curso.schedule_start_time || !curso.schedule_end_time) {
    return null
  }
  const sortedDays = [...curso.schedule_days].sort().join(',')
  return `${sortedDays}|${curso.schedule_start_time}|${curso.schedule_end_time}`
}

// Extrae los horarios únicos a partir de la lista de cursos
function extractHorariosUnicos(cursos: Curso[]): HorarioOption[] {
  const seen = new Map<HorarioKey, HorarioOption>()

  for (const curso of cursos) {
    const key = buildHorarioKey(curso)
    if (!key || seen.has(key)) continue

    seen.set(key, {
      key,
      days: curso.schedule_days ?? [],
      start_time: curso.schedule_start_time ?? '',
      end_time: curso.schedule_end_time ?? '',
      label: `${getShortDays(curso.schedule_days ?? [])} · ${formatTime(curso.schedule_start_time)} - ${formatTime(curso.schedule_end_time)}`,
    })
  }

  return Array.from(seen.values())
}

// Detecta el horario más cercano al momento actual
function findCurrentHorarioKey(horarios: HorarioOption[]): HorarioKey | null {
  const today = new Date()
  const currentDay = (['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const)[today.getDay()]
  const currentMinutes = today.getHours() * 60 + today.getMinutes()

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const horariosDelDia = horarios.filter(h => h.days.includes(currentDay))
  const pool = horariosDelDia.length > 0 ? horariosDelDia : horarios

  if (pool.length === 0) return null

  let best = pool[0]
  let minDiff = Infinity

  for (const horario of pool) {
    const start = timeToMinutes(horario.start_time)
    const end = timeToMinutes(horario.end_time)

    if (currentMinutes >= start && currentMinutes <= end) return horario.key

    const diff = Math.min(Math.abs(currentMinutes - start), Math.abs(currentMinutes - end))
    if (diff < minDiff) {
      minDiff = diff
      best = horario
    }
  }

  return best.key
}

export default function DashboardPage() {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null)
  const [selectedHorarioKey, setSelectedHorarioKey] = useState<HorarioKey | null>(null)
  const [openScheduleFilter, setOpenScheduleFilter] = useState(false)
  const [showManualSearchModal, setShowManualSearchModal] = useState(false)

  const { countAlumnos, fetchCountAlumnos } = useAlumnosStore()
  const { academia } = useAcademiaStore()
  const { fetchCursos, cursos } = useCursosStore()
  const { fetchProfesores } = useProfesoresStore()
  const { fetchInscripcionById, handleConfirmMarkAttendanceByStudent, fetchInscripcionesBySearch } = useInscripcionesStore()

  const today = new Date()

  useEffect(() => {
    fetchCountAlumnos()
    fetchCursos()
    fetchProfesores()
  }, [])

  // Derivar horarios únicos desde los cursos
  const horariosUnicos = useMemo(() => extractHorariosUnicos(cursos), [cursos])

  // Pre-seleccionar el horario más cercano al actual cuando cargan los cursos
  useEffect(() => {
    if (horariosUnicos.length > 0 && selectedHorarioKey === null) {
      setSelectedHorarioKey(findCurrentHorarioKey(horariosUnicos))
    }
  }, [horariosUnicos])

  // Filtrar cursos por horario seleccionado
  const cursosFiltrados = useMemo(() => {
    if (!selectedHorarioKey) return cursos
    return cursos.filter(curso => buildHorarioKey(curso) === selectedHorarioKey)
  }, [cursos, selectedHorarioKey])

  const selectedHorario = horariosUnicos.find(h => h.key === selectedHorarioKey) ?? null

  const checkInInscripciones = useCheckIn<Inscripcion>({
    type: 'inscripcion',
    fetchById: fetchInscripcionById,
    handleCheckIn: handleConfirmMarkAttendanceByStudent,
  })

  const handleSelectInscripcionFromSearch = (inscripcion: Inscripcion) => {
    setShowManualSearchModal(false)
    checkInInscripciones.handleManualSelection(inscripcion)
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-screen overflow-y-auto bg-muted rounded-xl p-4">
        {/* Header */}
        <div className="w-full grid grid-cols-6 gap-4">
          <div className="rounded-xl col-span-6 lg:col-span-3 p-4 flex items-center gap-2 bg-card">
            <Avatar className="size-20">
              <AvatarImage src={academia?.logo_url} />
              <AvatarFallback>
                <GraduationCapIcon size={20} />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center">
              <h2 className="font-bold font-sans text-xl">{academia?.name}</h2>
              <p>Suscripción: {academia?.plan_type === 'year' ? 'Anual' : 'Mensual'}</p>
              <p className="text-muted-foreground text-xs">vence el {formatDate(academia?.end_date)}</p>
            </div>
          </div>
          <div className="col-span-6 lg:col-span-3 flex justify-between gap-2">
            <div className="bg-card rounded-xl p-2 flex flex-col justify-center gap-px grow">
              <p className="text-xs">Alumnos</p>
              <p className="font-display text-2xl font-bold">{countAlumnos}</p>
            </div>
            <div className="bg-card rounded-xl p-2 flex flex-col justify-center gap-px grow">
              <p className="text-xs capitalize">{today.toLocaleDateString('es-ES', { weekday: 'long' })}</p>
              <p className="font-display text-2xl font-bold">{today.toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>

        {/* Asistencia rápida */}
        <div className="w-full flex flex-col gap-4">
          <div className="bg-card w-full gap-4 p-4 rounded-xl">
            <h3 className="text-xl font-bold w-full">Asistencia rápida</h3>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-2 w-full mt-2">
              <Button onClick={() => setShowManualSearchModal(true)} className="w-full lg:w-auto">
                <SearchIcon /> Buscar Alumno
              </Button>
              <Button onClick={checkInInscripciones.handleStartScan} className="w-full lg:w-auto">
                <QrCodeIcon /> Marcar Asistencia con QR
              </Button>
            </div>
          </div>

          {/* Cursos + Selector de horario */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-col lg:flex-row items-start justify-start lg:items-center gap-2">
              <h3 className="text-xl font-bold">
                Cursos ({cursosFiltrados.length})
              </h3>

              <div className="w-full lg:w-64">
                <Label htmlFor="horario" className="mb-1">Filtrar por horario</Label>
                <Popover open={openScheduleFilter} onOpenChange={setOpenScheduleFilter}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full justify-between font-normal border text-sm flex items-center p-2 rounded-lg bg-card text-muted-foreground",
                        !selectedHorarioKey && "text-muted-foreground"
                      )}
                    >
                      <div className="truncate">
                        {selectedHorario ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="flex items-center gap-1">
                                <CalendarIcon size={12} /> {getShortDays(selectedHorario.days)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon size={12} /> {formatTime(selectedHorario.start_time)} - {formatTime(selectedHorario.end_time)}
                              </span>
                            </div>
                          </div>
                        ) : "Todos los horarios"}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Buscar horario..." />
                      <CommandEmpty>No se encontraron horarios.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {/* Opción "Todos" */}
                        <CommandItem
                          value="todos"
                          onSelect={() => { setSelectedHorarioKey(null); setOpenScheduleFilter(false) }}
                          className={cn(selectedHorarioKey === null && "bg-accent")}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedHorarioKey === null ? "opacity-100" : "opacity-0")} />
                          Todos los horarios
                        </CommandItem>

                        {horariosUnicos.map((horario) => (
                          <CommandItem
                            key={horario.key}
                            value={horario.label}
                            onSelect={() => { setSelectedHorarioKey(horario.key); setOpenScheduleFilter(false) }}
                            className={cn(selectedHorarioKey === horario.key && "bg-accent")}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedHorarioKey === horario.key ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarIcon size={12} /> {getShortDays(horario.days)}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ClockIcon size={12} /> {formatTime(horario.start_time)} - {formatTime(horario.end_time)}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Lista de cursos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {cursosFiltrados.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No hay cursos para este horario
                </div>
              ) : (
                cursosFiltrados.map((curso) => (
                  <div
                    key={curso.id}
                    className="flex gap-2 p-4 border rounded-xl bg-card cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => { setSelectedCourse(curso); setOpenDialog(true) }}
                  >
                    <div style={{ backgroundColor: curso.color }} className="w-2 h-full rounded-full" />
                    <div className="grow flex flex-col md:flex-row gap-1 md:items-end">
                      <div className="grow flex flex-col">
                        <p className="font-bold">{curso.name}</p>
                        <div className="flex gap-3 text-sm">
                          <p className="flex items-center gap-1">
                            <CalendarIcon size={12} className="text-muted-foreground" />
                            {getShortDays(curso.schedule_days ?? [])}
                          </p>
                          <p className="flex items-center gap-1">
                            <ClockIcon size={12} className="text-muted-foreground" />
                            {formatTime(curso.schedule_start_time)} - {formatTime(curso.schedule_end_time)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{curso.teacher?.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setSelectedCourse(curso); setOpenDialog(true) }}
                      >
                        Ver asistencia
                        <NotebookPenIcon />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
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
      <InscripcionDetailModal
        open={checkInInscripciones.showResultModal}
        onClose={checkInInscripciones.handleCloseResultModal}
        inscripcion={checkInInscripciones.scanResult}
        onConfirmAction={checkInInscripciones.handleConfirmCheckIn}
        actionLabel="Registrar asistencia"
      />
      <ManualSearchModal
        open={showManualSearchModal}
        onClose={() => setShowManualSearchModal(false)}
        onSearch={fetchInscripcionesBySearch}
        onSelectInscripcion={handleSelectInscripcionFromSearch}
      />
    </>
  )
}
