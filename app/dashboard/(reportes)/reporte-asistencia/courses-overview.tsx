// components/attendance/CoursesOverview.tsx
"use client";

import { useEffect, useState } from "react";
import { useCursosStore } from "@/lib/store/configuraciones/cursos.store";
import { CourseAttendanceHistory } from "./course-attendance-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import type { Curso } from "@/shared/types/supabase.types";

export function CoursesOverview() {
  const { cursos, fetchCursos } = useCursosStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar todos los cursos al montar el componente
  useEffect(() => {
    const loadCursos = async () => {
      setIsLoading(true);
      await fetchCursos();
      setIsLoading(false);
    };

    loadCursos();
  }, [fetchCursos]);

  // Si ya seleccionó un curso, mostrar su historial
  if (selectedCourseId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCourseId(null)}
          >
            ← Volver a cursos
          </Button>
        </div>
        <CourseAttendanceHistory courseId={selectedCourseId} />
      </div>
    );
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  // Sin cursos
  if (!cursos.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No hay cursos registrados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector móvil / responsive */}
      <div className="lg:hidden">
        <Select
          value={selectedCourseId || ""}
          onValueChange={setSelectedCourseId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un curso" />
          </SelectTrigger>
          <SelectContent>
            {cursos.map((curso) => (
              <SelectItem key={curso.id} value={curso.id!}>
                {curso.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid de cards en desktop */}
      <div className="hidden lg:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <CourseCard
            key={curso.id}
            curso={curso}
            onSelect={setSelectedCourseId}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Card individual de curso
 * Obtiene estadísticas desde el store centralizado
 */
function CourseCard({
  curso,
  onSelect,
}: {
  curso: Curso;
  onSelect: (id: string) => void;
}) {
  const fetchCourseStats = useCursosStore((state) => state.fetchCourseStats);
  const cachedStats = useCursosStore((state) => state.courseStats[curso.id!]);

  const [stats, setStats] = useState<{
    totalInscripciones: number;
    totalAsistencias: number;
  } | null>(cachedStats || null);
  const [isLoadingStats, setIsLoadingStats] = useState(!cachedStats);

  // Cargar estadísticas del curso desde el store
  useEffect(() => {
    if (!cachedStats && curso.id) {
      setIsLoadingStats(true);
      fetchCourseStats(curso.id)
        .then((data) => {
          setStats(data);
          setIsLoadingStats(false);
        })
        .catch(() => {
          setIsLoadingStats(false);
        });
    }
  }, [curso.id, cachedStats, fetchCourseStats]);

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onSelect(curso.id!)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: curso.color || "#6366f1" }}
            />
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {curso.name}
            </CardTitle>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <CardDescription>
          {curso.total_classes ? `${curso.total_classes} clases totales` : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estadísticas */}
        {isLoadingStats ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.totalInscripciones}</p>
              <p className="text-xs text-muted-foreground">
                Alumnos inscritos
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.totalAsistencias}</p>
              <p className="text-xs text-muted-foreground">
                Asistencias totales
              </p>
            </div>
          </div>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          className="w-full group-hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(curso.id!);
          }}
        >
          Ver historial completo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}