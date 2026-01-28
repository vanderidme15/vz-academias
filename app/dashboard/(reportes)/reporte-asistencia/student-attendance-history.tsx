// components/attendance/StudentAttendanceHistory.tsx
"use client";

import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAttendanceStore } from "@/lib/store/reportes/reporte-attendance.store";

interface StudentAttendanceHistoryProps {
  studentId: string;
}

export function StudentAttendanceHistory({
  studentId,
}: StudentAttendanceHistoryProps) {
  const { inscripciones, isLoading, fetchByStudentId } = useAttendanceStore();

  useEffect(() => {
    fetchByStudentId(studentId);
  }, [studentId, fetchByStudentId]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Sin datos
  if (!inscripciones.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No hay inscripciones registradas para este alumno.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {inscripciones.map((inscripcion) => {
        const asistencias = inscripcion.assistances || [];
        const totalAsistencias = asistencias.length;
        const totalClases = inscripcion.total_classes || 0;

        return (
          <Card key={inscripcion.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {inscripcion.course?.name || "Sin curso"}
                  </CardTitle>
                  <CardDescription>
                    {inscripcion.is_personalized && (
                      <Badge variant="outline" className="mr-2">
                        Personalizado
                      </Badge>
                    )}
                    {inscripcion.date_from && inscripcion.date_to && (
                      <span className="text-sm">
                        {format(new Date(inscripcion.date_from), "dd/MM/yyyy", {
                          locale: es,
                        })}{" "}
                        -{" "}
                        {format(new Date(inscripcion.date_to), "dd/MM/yyyy", {
                          locale: es,
                        })}
                      </span>
                    )}
                  </CardDescription>
                </div>

                {/* Resumen de asistencias */}
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {totalAsistencias} / {totalClases}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Asistencias
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {asistencias.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay asistencias registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead className="text-right">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {asistencias
                        .sort(
                          (a, b) =>
                            new Date(b.date_time || "").getTime() -
                            new Date(a.date_time || "").getTime()
                        )
                        .map((asistencia) => {
                          const fecha = asistencia.date_time
                            ? new Date(asistencia.date_time)
                            : null;

                          return (
                            <TableRow key={asistencia.id}>
                              <TableCell className="font-medium">
                                {fecha
                                  ? format(fecha, "dd/MM/yyyy", { locale: es })
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {fecha ? format(fecha, "HH:mm") : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="default">
                                  Confirmada
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Observaciones */}
              {inscripcion.observations && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Observaciones:</p>
                  <p className="text-sm text-muted-foreground">
                    {inscripcion.observations}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}