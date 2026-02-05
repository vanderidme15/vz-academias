"use client"

import { useAcademiaStore } from "@/lib/store/academia.store"
import { formatDate, formatTime, getShortDays } from "@/lib/utils-functions/format-date"
import { useAlumnosStore } from "@/lib/store/registro/alumnos.store"
import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon, GraduationCapIcon, NotebookPenIcon, QrCodeIcon, SearchIcon, Check, ChevronsUpDown } from "lucide-react"
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store"
import AsistenciaCursoDetalle from "./(registro)/listas/components/asistencia-curso-detalle"
import { useState } from "react"
import { Curso, Inscripcion } from "@/shared/types/supabase.types"
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store"
import { QRScannerModal } from "@/components/own/check-in/qr-scanner-modal"
import { InscripcionDetailModal } from "@/components/own/check-in/entity-detail-modal"
import { useCheckIn } from "@/components/own/check-in/use-check-in"
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"
import { useHorariosStore } from "@/lib/store/configuraciones/horarios.store"
import { ManualSearchModal } from "@/components/own/check-in/manual-search-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null);
  const [selectedHorarioId, setSelectedHorarioId] = useState<string | null>(null);

  const { countAlumnos, fetchCountAlumnos } = useAlumnosStore();
  const { academia } = useAcademiaStore();
  const { fetchCursos, cursos } = useCursosStore();
  const { fetchProfesores } = useProfesoresStore();
  const { fetchHorarios, horarios } = useHorariosStore();
  const { fetchInscripcionById, handleConfirmMarkAttendanceByStudent, fetchAllInscripciones } = useInscripcionesStore();
  const [showManualSearchModal, setShowManualSearchModal] = useState(false)
  const [allInscripciones, setAllInscripciones] = useState<Inscripcion[]>([])

  const [openScheduleFilter, setOpenScheduleFilter] = useState(false)

  const today = new Date();


  // Función para obtener el día actual en el formato que usa tu sistema
  const getCurrentDayKey = (): string => {
    const dayNames: { [key: number]: string } = {
      0: 'domingo',
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sabado'
    };
    return dayNames[today.getDay()];
  };

  // Función para convertir hora a minutos para comparación
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Función para encontrar el horario actual basado en día y hora
  const findCurrentHorario = () => {
    const currentDay = getCurrentDayKey();
    const currentTime = today.toTimeString().slice(0, 5); // HH:MM
    const currentMinutes = timeToMinutes(currentTime);

    // Buscar horarios que coincidan con el día actual
    const horariosDelDia = horarios.filter(horario => {
      // Asumiendo que horario tiene una propiedad 'days' o similar
      // Ajusta según la estructura real de tus datos
      return horario.days?.includes(currentDay);
    });

    if (horariosDelDia.length === 0) {
      return horarios[0]?.id || null; // Retornar el primer horario si no hay coincidencia
    }

    // Buscar el horario más cercano a la hora actual
    let closestHorario = horariosDelDia[0];
    let minDiff = Infinity;

    horariosDelDia.forEach(horario => {
      const startMinutes = timeToMinutes(horario.start_time || '');
      const endMinutes = timeToMinutes(horario.end_time || '');

      // Si estamos dentro del rango del horario
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        closestHorario = horario;
        minDiff = 0;
      } else {
        // Calcular la diferencia con el inicio del horario
        const diff = Math.abs(currentMinutes - startMinutes);
        if (diff < minDiff) {
          minDiff = diff;
          closestHorario = horario;
        }
      }
    });

    return closestHorario?.id || null;
  };

  useEffect(() => {
    fetchCountAlumnos();
    fetchCursos();
    fetchProfesores();
    fetchHorarios();
  }, []);

  // Pre-seleccionar horario cuando se cargan los horarios
  useEffect(() => {
    if (horarios.length > 0 && selectedHorarioId === null) {
      const currentHorarioId = findCurrentHorario();
      setSelectedHorarioId(currentHorarioId);
    }
  }, [horarios]);

  // Cargar inscripciones al abrir el modal de búsqueda
  const handleOpenManualSearch = async () => {
    const inscripciones = await fetchAllInscripciones()
    setAllInscripciones(inscripciones)
    setShowManualSearchModal(true)
  }

  const handleSelectInscripcionFromSearch = (inscripcion: Inscripcion) => {
    setShowManualSearchModal(false)
    checkInInscripciones.handleManualSelection(inscripcion)
  }

  const checkInInscripciones = useCheckIn<Inscripcion>({
    type: 'inscripcion',
    fetchById: fetchInscripcionById,
    handleCheckIn: handleConfirmMarkAttendanceByStudent,
  })

  // Filtrar cursos por horario seleccionado
  const cursosFiltrados = useMemo(() => {
    if (!selectedHorarioId) return cursos;

    return cursos.filter(curso =>
      curso.schedule?.id === selectedHorarioId
    );
  }, [cursos, selectedHorarioId]);

  // Función para manejar la selección de horario
  const handleHorarioSelect = (horarioId: string | null) => {
    setSelectedHorarioId(horarioId);
  };

  // Obtener el horario seleccionado para mostrar
  const selectedHorario = horarios.find(h => h.id === selectedHorarioId);

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-screen overflow-y-auto bg-muted rounded-xl p-4">
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
        <div className="w-full flex flex-col gap-4">
          <div className="bg-card w-full gap-4 p-4 rounded-xl">
            <h3 className="text-xl font-bold w-full">Asistencia rápida</h3>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-2 w-full mt-2 ">
              <Button onClick={handleOpenManualSearch} className="w-full lg:w-auto">
                <SearchIcon /> Buscar Alumno
              </Button>
              <Button onClick={checkInInscripciones.handleStartScan} className="w-full lg:w-auto">
                <QrCodeIcon /> Marcar Asistencia con QR
              </Button>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-col lg:flex-row items-start justify-start lg:items-center gap-2">
              <h3 className="text-xl font-bold">
                Cursos ({cursosFiltrados.length})
              </h3>

              {/* Selector de horarios mejorado */}
              <div className="w-full lg:w-64">
                <Label htmlFor="horario" className="mb-1">Filtrar por horario</Label>
                <Popover open={openScheduleFilter} onOpenChange={setOpenScheduleFilter}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full justify-between font-normal border text-sm flex items-center p-2 rounded-lg bg-card text-muted-foreground",
                        !selectedHorarioId && "text-muted-foreground"
                      )}
                    >
                      <div className="truncate">
                        {selectedHorario ? (
                          <div className="flex flex-col gap-1">
                            <p>{selectedHorario.name}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <CalendarIcon size={12} /> {getShortDays(selectedHorario.days || [])}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon size={12} /> {formatTime(selectedHorario.start_time)} - {formatTime(selectedHorario.end_time)}
                              </div>
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
                        <CommandItem
                          value="todos"
                          onSelect={() => { handleHorarioSelect(null); setOpenScheduleFilter(false) }}
                          className={cn(
                            selectedHorarioId === null && "bg-accent"
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedHorarioId === null ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Todos los horarios
                        </CommandItem>
                        {horarios.map((horario) => (
                          <CommandItem
                            key={horario.id}
                            value={`${horario.id}-${horario.name}`} // Usar ID + nombre para hacerlo único
                            onSelect={() => { handleHorarioSelect(horario.id || null); setOpenScheduleFilter(false) }}
                            className={cn(
                              selectedHorarioId === horario.id && "bg-accent"
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedHorarioId === horario.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{horario.name}</span>
                              <div className="flex gap-1">
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <CalendarIcon /> {getShortDays(horario.days || [])}
                                </p>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <ClockIcon /> {formatTime(horario.start_time)} - {formatTime(horario.end_time)}
                                </p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

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
                    onClick={() => {
                      setSelectedCourse(curso);
                      setOpenDialog(true);
                    }}
                  >
                    <div style={{ backgroundColor: curso.color }} className="w-2 h-full rounded-full"></div>
                    <div className="grow flex flex-col md:flex-row gap-1 md:items-end">
                      <div className="grow flex flex-col">
                        <p className="font-bold">{curso.name}</p>
                        <div className="flex gap-3 text-sm">
                          <p className="flex items-center gap-1"><CalendarIcon size={12} className="text-muted-foreground" />{getShortDays(curso.schedule?.days || [])}</p>
                          <p className="flex items-center gap-1"><ClockIcon size={12} className="text-muted-foreground" />{formatTime(curso.schedule?.start_time)} - {formatTime(curso.schedule?.end_time)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{curso.teacher?.name}</p>
                      </div>
                      <Button className="" variant="outline" onClick={() => {
                        setSelectedCourse(curso);
                        setOpenDialog(true);
                      }}>
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
        inscripciones={allInscripciones}
        onSelectInscripcion={handleSelectInscripcionFromSearch}
      />
    </>
  )
}
