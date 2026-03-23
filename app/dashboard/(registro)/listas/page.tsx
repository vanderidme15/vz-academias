'use client'

import { useState, useMemo, useEffect } from "react";

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListCoursesFilters from "./components/list-courses-filters";
import ListCoursesItem from "./components/list-courses-item";
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store";
import { Curso } from "@/shared/types/supabase.types";
import GenericDialog from "@/components/own/generic-dialog/generic-dialog";
import ListCourse from "./components/list-course/list-course";
import { useProfesoresStore } from "@/lib/store/configuraciones/profesores.store";
import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";
import { HorarioKey, HorarioOption } from "@/shared/types/ui.types";


function buildHorarioKey(curso: Curso): HorarioKey {
  if (!curso.schedule_days?.length && !curso.schedule_start_time && !curso.schedule_end_time) {
    return 'sin-horario'
  }
  const sortedDays = [...(curso.schedule_days ?? [])].sort().join(',')
  return `${sortedDays}|${curso.schedule_start_time ?? ''}|${curso.schedule_end_time ?? ''}`
}

function buildHorarioLabel(curso: Curso): string {
  if (!curso.schedule_days?.length) return 'Sin horario asignado'
  return `${getShortDays(curso.schedule_days)} · ${formatTime(curso.schedule_start_time)} - ${formatTime(curso.schedule_end_time)}`
}

function useDialogHandlers() {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  return useMemo(() => ({
    openDialog,
    setOpenDialog,
    loading,
    setLoading,
    selectedCourse,
    setSelectedCourse,
  }), [openDialog, loading, selectedCourse]);
}

export type DialogHandlersCourses = ReturnType<typeof useDialogHandlers>;

export default function ListasPage() {
  const dialogHandlers = useDialogHandlers();

  const [mes, setMes] = useState(new Date());
  const [mesLabel, setMesLabel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHorarioKey, setSelectedHorarioKey] = useState<HorarioKey | null>(null);

  const { cursos, fetchCursos } = useCursosStore();
  const { fetchProfesores } = useProfesoresStore();

  useEffect(() => {
    fetchCursos();
    fetchProfesores();
  }, []);

  useEffect(() => {
    setMesLabel(new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' }));
  }, []);

  // Horarios únicos derivados de los cursos — para pasarle al filtro
  const horariosUnicos = useMemo(() => {
    const seen = new Map<HorarioKey, HorarioOption>()
    for (const curso of cursos) {
      const key = buildHorarioKey(curso)
      if (!seen.has(key)) {
        seen.set(key, {
          key,
          label: buildHorarioLabel(curso),
          days: curso.schedule_days ?? [],
          start_time: curso.schedule_start_time ?? '',
          end_time: curso.schedule_end_time ?? '',
        })
      }
    }
    return Array.from(seen.values())
  }, [cursos])

  // Filtrar cursos por búsqueda y horario
  const cursosFiltrados = useMemo(() => {
    return cursos.filter((curso) => {
      const matchesSearch = searchTerm === "" ||
        curso.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHorario = selectedHorarioKey === null ||
        buildHorarioKey(curso) === selectedHorarioKey;
      return matchesSearch && matchesHorario;
    });
  }, [cursos, searchTerm, selectedHorarioKey]);

  // Agrupar cursos filtrados por clave de horario
  const cursosAgrupados = useMemo(() => {
    const grupos = new Map<HorarioKey, Curso[]>()

    for (const curso of cursosFiltrados) {
      const key = buildHorarioKey(curso)
      if (!grupos.has(key)) grupos.set(key, [])
      grupos.get(key)!.push(curso)
    }

    // Ordenar cursos dentro de cada grupo por nombre
    for (const [, lista] of grupos) {
      lista.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es-ES'))
    }

    return grupos
  }, [cursosFiltrados]);

  // Ordenar grupos: primero los que tienen horario (en el orden que vienen de horariosUnicos), sin-horario al final
  const gruposOrdenados = useMemo(() => {
    const horarioKeyOrder = horariosUnicos.map(h => h.key)

    return Array.from(cursosAgrupados.entries()).sort(([keyA], [keyB]) => {
      if (keyA === 'sin-horario') return 1
      if (keyB === 'sin-horario') return -1
      return horarioKeyOrder.indexOf(keyA) - horarioKeyOrder.indexOf(keyB)
    })
  }, [cursosAgrupados, horariosUnicos]);

  const handleMesAnterior = () => {
    setMes(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      setMesLabel(d.toLocaleString('es-ES', { month: 'long', year: 'numeric' }))
      return d
    })
  }

  const handleMesSiguiente = () => {
    setMes(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      setMesLabel(d.toLocaleString('es-ES', { month: 'long', year: 'numeric' }))
      return d
    })
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
          {/* Filtros — ahora recibe horariosUnicos en lugar de horarios del store */}
          <ListCoursesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedHorarioKey={selectedHorarioKey}
            setSelectedHorarioKey={setSelectedHorarioKey}
            horariosUnicos={horariosUnicos}
          />

          {/* Lista de cursos agrupados por horario */}
          {gruposOrdenados.map(([horarioKey, cursosDelGrupo]) => (
            <div key={horarioKey} className="mb-6">
              {/* Encabezado del grupo */}
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {horarioKey === 'sin-horario'
                    ? 'Sin horario asignado'
                    : buildHorarioLabel(cursosDelGrupo[0])}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {cursosDelGrupo.length} curso{cursosDelGrupo.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Cursos del grupo */}
              <div className="space-y-2 pl-4">
                {cursosDelGrupo.map((curso) => (
                  <ListCoursesItem key={curso.id} curso={curso} date={mes} dialogHandlers={dialogHandlers} />
                ))}
              </div>
            </div>
          ))}

          {/* Mensaje si no hay cursos */}
          {gruposOrdenados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedHorarioKey
                ? 'No se encontraron cursos con los filtros aplicados'
                : 'No hay cursos disponibles'}
            </div>
          )}
        </div>
      </div>
      <GenericDialog
        openDialog={dialogHandlers.openDialog}
        setOpenDialog={dialogHandlers.setOpenDialog}
        title="Lista de alumnos del curso"
        description=""
      >
        <ListCourse dialogHandlers={dialogHandlers} mes={mes} mesLabel={mesLabel} />
      </GenericDialog>
    </>
  )
}
