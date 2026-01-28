// components/attendance/StudentSearch.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAlumnosStore } from "@/lib/store/registro/alumnos.store";
import { StudentAttendanceHistory } from "./student-attendance-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User, X } from "lucide-react";
import type { Alumno } from "@/shared/types/supabase.types";

export function StudentSearch() {
  const { alumnos, fetchAlumnos } = useAlumnosStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Cargar todos los alumnos al montar
  useEffect(() => {
    const loadAlumnos = async () => {
      setIsLoading(true);
      await fetchAlumnos();
      setIsLoading(false);
    };

    loadAlumnos();
  }, [fetchAlumnos]);

  // Filtrar alumnos según búsqueda
  const filteredAlumnos = useMemo(() => {
    if (!searchQuery.trim()) return alumnos;

    const query = searchQuery.toLowerCase();
    return alumnos.filter((alumno) => {
      const fullName = `${alumno.name || ""}`.toLowerCase();
      const phone = (alumno.cellphone || "").toLowerCase();

      return (
        fullName.includes(query) ||
        phone.includes(query)
      );
    });
  }, [alumnos, searchQuery]);

  // Si ya seleccionó un alumno, mostrar su historial
  if (selectedStudentId) {
    const selectedStudent = alumnos.find((a) => a.id === selectedStudentId);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStudentId(null)}
            >
              ← Volver
            </Button>
            <div>
              <h2 className="text-xl font-semibold">
                {selectedStudent?.name || "Alumno"}
              </h2>
            </div>
          </div>
        </div>
        <StudentAttendanceHistory studentId={selectedStudentId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Alumno</CardTitle>
          <CardDescription>
            Busca por nombre, email o teléfono
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Escribe para buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de alumnos */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredAlumnos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? "No se encontraron alumnos con ese criterio"
                : "No hay alumnos registrados"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlumnos.map((alumno) => (
            <StudentCard
              key={alumno.id}
              alumno={alumno}
              onSelect={setSelectedStudentId}
            />
          ))}
        </div>
      )}

      {/* Contador de resultados */}
      {searchQuery && !isLoading && (
        <p className="text-sm text-muted-foreground text-center">
          {filteredAlumnos.length} resultado{filteredAlumnos.length !== 1 ? "s" : ""}{" "}
          encontrado{filteredAlumnos.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

/**
 * Card individual de alumno
 * Obtiene estadísticas desde el store centralizado
 */
function StudentCard({
  alumno,
  onSelect,
}: {
  alumno: Alumno;
  onSelect: (id: string) => void;
}) {
  const fetchStudentStats = useAlumnosStore((state) => state.fetchStudentStats);
  const cachedStats = useAlumnosStore((state) => state.studentStats[alumno.id!]);

  const [inscripcionesCount, setInscripcionesCount] = useState<number | null>(
    cachedStats?.inscripcionesCount ?? null
  );
  const [isLoadingStats, setIsLoadingStats] = useState(!cachedStats);

  useEffect(() => {
    if (!cachedStats && alumno.id) {
      setIsLoadingStats(true);
      fetchStudentStats(alumno.id)
        .then((data) => {
          setInscripcionesCount(data.inscripcionesCount);
          setIsLoadingStats(false);
        })
        .catch(() => {
          setIsLoadingStats(false);
        });
    }
  }, [alumno.id, cachedStats, fetchStudentStats]);

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onSelect(alumno.id!)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <User className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {alumno.name || "Sin nombre"}
            </h3>

            <div className="space-y-1 mt-2">
              {alumno.cellphone && (
                <p className="text-sm text-muted-foreground">
                  {alumno.cellphone}
                </p>
              )}
            </div>

            {isLoadingStats ? (
              <Skeleton className="h-5 w-24 mt-3" />
            ) : inscripcionesCount !== null ? (
              <Badge variant="secondary" className="mt-3">
                {inscripcionesCount} inscripción{inscripcionesCount !== 1 ? "es" : ""}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
