'use client'

import { DialogHandlers } from "@/shared/types/ui.types";
import { useState, useMemo, useEffect } from "react";

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListCoursesFilters from "./components/list-courses-filters";
import ListCoursesItem from "./components/list-courses-item";
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store";
import { Curso } from "@/shared/types/supabase.types";
import { useHorariosStore } from "@/lib/store/configuraciones/horarios.store";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";


function useDialogHandlers() {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  return useMemo(() => ({
    openDialog,
    setOpenDialog,
    loading,
    setLoading,
    selectedCourse,
    setSelectedCourse
  }), [openDialog, setOpenDialog, loading, setLoading, selectedCourse, setSelectedCourse]);
}

export default function ListasPage() {
  const dialogHandlers = useDialogHandlers();

  const [mes, setMes] = useState(new Date());
  const [mesLabel, setMesLabel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHorarioId, setSelectedHorarioId] = useState<string | null>(null);

  const { cursos, fetchCursos } = useCursosStore();
  const { fetchHorarios, horarios } = useHorariosStore();

  useEffect(() => {
    fetchHorarios();
    fetchCursos();
  }, []);

  useEffect(() => {
    const mesActual = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    setMesLabel(mesActual);
  }, []);

  // Filtrar cursos por búsqueda y horario
  const cursosFiltrados = useMemo(() => {
    return cursos.filter((curso) => {
      // Filtro por búsqueda de nombre
      const matchesSearch = searchTerm === "" ||
        curso.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por horario
      const matchesHorario = selectedHorarioId === null ||
        curso.schedule_id === selectedHorarioId;

      return matchesSearch && matchesHorario;
    });
  }, [cursos, searchTerm, selectedHorarioId]);

  // Agrupar y ordenar cursos filtrados por schedule_id
  const cursosAgrupados = useMemo(() => {
    const grupos: Record<string, Curso[]> = {};

    // Agrupar cursos
    cursosFiltrados.forEach((curso) => {
      const scheduleId = curso.schedule_id || 'sin-horario';
      if (!grupos[scheduleId]) {
        grupos[scheduleId] = [];
      }
      grupos[scheduleId].push(curso);
    });

    // Ordenar los cursos dentro de cada grupo por nombre
    Object.keys(grupos).forEach((scheduleId) => {
      grupos[scheduleId].sort((a, b) => {
        return (a.name || '').localeCompare(b.name || '', 'es-ES');
      });
    });

    return grupos;
  }, [cursosFiltrados]);

  // Ordenar los grupos según el orden de los horarios
  const gruposOrdenados = useMemo(() => {
    return Object.entries(cursosAgrupados).sort(([scheduleIdA], [scheduleIdB]) => {
      // Los grupos sin horario van al final
      if (scheduleIdA === 'sin-horario') return 1;
      if (scheduleIdB === 'sin-horario') return -1;

      // Buscar el índice de cada horario en el array de horarios
      const indexA = horarios.findIndex(h => h.id === scheduleIdA);
      const indexB = horarios.findIndex(h => h.id === scheduleIdB);

      // Si alguno no se encuentra, va al final
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      // Ordenar por el índice en el array de horarios
      return indexA - indexB;
    });
  }, [cursosAgrupados, horarios]);

  const handleMesAnterior = () => {
    const mesAnterior = new Date(mes);
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    setMes(mesAnterior);
    setMesLabel(mesAnterior.toLocaleString('es-ES', { month: 'long', year: 'numeric' }));
  }

  const handleMesSiguiente = () => {
    const mesSiguiente = new Date(mes);
    mesSiguiente.setMonth(mesSiguiente.getMonth() + 1);
    setMes(mesSiguiente);
    setMesLabel(mesSiguiente.toLocaleString('es-ES', { month: 'long', year: 'numeric' }));
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-auto">
        <h2 className="text-2xl font-bold">Listas por curso</h2>
        <p className="text-xs">Registro de todos los cursos mes a mes</p>
        <div className="flex gap-4 my-4">
          <Button variant="outline" onClick={handleMesAnterior}>
            <ChevronLeftIcon />
            <span className="hidden md:block">Mes anterior</span>
          </Button>
          <div className="grow flex items-center justify-center border-2 rounded-lg uppercase">{mesLabel}</div>
          <Button variant="outline" onClick={handleMesSiguiente}>
            <span className="hidden md:block">Mes siguiente</span>
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="grow border-2 rounded-lg p-2 overflow-auto">
          {/* Filtros */}
          <ListCoursesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedHorarioId={selectedHorarioId}
            setSelectedHorarioId={setSelectedHorarioId}
          />

          {/* Lista de cursos agrupados y ordenados */}
          {gruposOrdenados.map(([scheduleId, cursosDelGrupo]) => (
            <div key={scheduleId} className="mb-6">
              {/* Encabezado del grupo */}
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {cursosDelGrupo[0]?.schedule?.name || 'Sin horario asignado'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {cursosDelGrupo.length} curso{cursosDelGrupo.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Cursos del grupo */}
              <div className="space-y-2 pl-4">
                {cursosDelGrupo.map((curso) => (
                  <ListCoursesItem key={curso.id} curso={curso} dialogHandlers={dialogHandlers} />
                ))}
              </div>
            </div>
          ))}

          {/* Mensaje si no hay cursos */}
          {gruposOrdenados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedHorarioId
                ? 'No se encontraron cursos con los filtros aplicados'
                : 'No hay cursos disponibles'}
            </div>
          )}
        </div>
      </div>
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Alumnos"
        description="Lista de alumnos del curso"
      >
        <div className="w-xl">
          {/* Header del curso */}
          <div className="flex items-center gap-2 border px-4 py-2 rounded-xl border-dashed">
            <div style={{ backgroundColor: dialogHandlers.selectedCourse?.color }} className="w-2 h-16 rounded-full"></div>

            <div className="grow">
              <p className="text-lg font-medium">{dialogHandlers.selectedCourse?.name}</p>
              <p className="text-xs text-muted-foreground">
                Profesor: {dialogHandlers.selectedCourse?.teacher?.name ?? "Sin asignar"}
              </p>
            </div>
            <div className="flex flex-col gap-px text-sm">
              <span className="text-xs text-muted-foreground">Horario:</span>
              <div className="flex flex-col md:flex-row gap-2">
                <p className="flex items-center gap-1"><CalendarIcon size={12} className="text-muted-foreground" />{getShortDays(dialogHandlers.selectedCourse?.schedule?.days || [])}</p>
                <p className="flex items-center gap-1"><ClockIcon size={12} className="text-muted-foreground" />{formatTime(dialogHandlers.selectedCourse?.schedule?.start_time)} - {formatTime(dialogHandlers.selectedCourse?.schedule?.end_time)}</p>
              </div>
            </div>
          </div>

          {/* Estados de carga */}
          {dialogHandlers.loading && (
            <p className="text-sm text-muted-foreground">Cargando asistencias...</p>
          )}

          {/* {!dialogHandlers.loading && dialogHandlers.selectedCourse?.inscripciones.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay inscripciones para este curso
            </p>
          )} */}

        </div>
      </GenericDialog>
    </>
  )
}
