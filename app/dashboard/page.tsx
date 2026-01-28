"use client"

import { useAcademiaStore } from "@/lib/store/academia.store"
import { formatDate, formatTime, getShortDays } from "@/lib/utils-functions/format-date"
import { useAlumnosStore } from "@/lib/store/registro/alumnos.store"
import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon, NotebookPenIcon, QrCodeIcon, SearchIcon } from "lucide-react"
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store"
import AsistenciaCursoDetalle from "./(registro)/asistencia/components/asistencia-curso-detalle"
import { useState } from "react"
import { Curso, Inscripcion } from "@/shared/types/supabase.types"
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store"
import { QRScannerModal } from "@/components/own/check-in/qr-scanner-modal"
import { InscripcionDetailModal } from "@/components/own/check-in/entity-detail-modal"
import { useCheckIn } from "@/components/own/check-in/use-check-in"
import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"
import { DaysConfig, daysConfig } from "@/lib/constants/days"
import { useHorariosStore } from "@/lib/store/configuraciones/horarios.store"
import { ManualSearchModal } from "@/components/own/check-in/manual-search-modal"

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
  const handleHorarioSelect = (horarioId: string) => {
    setSelectedHorarioId(horarioId);
  };

  // Opción para mostrar todos los cursos
  const handleShowAll = () => {
    setSelectedHorarioId(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-screen overflow-y-auto bg-muted rounded-xl p-4">
        <div className="w-full grid grid-cols-6 gap-4">
          <div className="rounded-xl col-span-6 lg:col-span-3 p-4 flex flex-col justify-center bg-card">
            <h2 className="font-display text-2xl">{academia?.name}</h2>
            <p>Suscripción: {academia?.plan_type === 'year' ? 'Anual' : 'Mensual'}</p>
            <p className="text-muted-foreground text-xs">vence el {formatDate(academia?.end_date)}</p>
          </div>
          <div className="col-span-6 lg:col-span-3 flex justify-between gap-2">
            <div className="bg-card rounded-xl p-2 flex flex-col justify-center gap-px grow">
              <p className="text-xs font-bold">ALUMNOS</p>
              <p className="font-display text-2xl">{countAlumnos}</p>
            </div>
            <div className="bg-card rounded-xl p-2 flex flex-col justify-center gap-px grow">
              <p className="uppercase font-bold">{today.toLocaleDateString('es-ES', { weekday: 'long' })}</p>
              <p className="text-2xl">{today.toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="bg-card w-full gap-4 p-4 rounded-xl">
            <h3 className="text-xl font-bold w-full">Asistencia rápida</h3>
            <div className="flex justify-center items-center gap-2 w-full">
              <Button onClick={handleOpenManualSearch}>
                <SearchIcon /> Buscar Alumno
              </Button>
              <Button onClick={checkInInscripciones.handleStartScan}>
                <QrCodeIcon /> Marcar Asistencia con QR
              </Button>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2">
              <h3 className="text-xl font-bold">
                Cursos ({cursosFiltrados.length})
              </h3>
              {/* lista de horarios para filtrar */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedHorarioId === null ? "default" : "outline"}
                  onClick={handleShowAll}
                  size="sm"
                >
                  Todos
                </Button>
                {horarios.map((horario) => (
                  <Button
                    key={horario.id}
                    variant={selectedHorarioId === horario.id ? "default" : "outline"}
                    onClick={() => handleHorarioSelect(horario.id || '')}
                    size="sm"
                  >
                    {horario.name}
                  </Button>
                ))}
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
                    className="flex gap-2 items-end p-4 border rounded-xl bg-card"
                  >
                    <div style={{ backgroundColor: curso.color }} className="w-2 h-full rounded-full"></div>
                    <div className="grow">
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