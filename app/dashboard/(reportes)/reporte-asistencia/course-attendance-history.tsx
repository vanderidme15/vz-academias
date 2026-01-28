// components/attendance/CourseAttendanceHistory.tsx
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown } from "lucide-react";
import { useAttendanceStore } from "@/lib/store/reportes/reporte-attendance.store";

interface CourseAttendanceHistoryProps {
  courseId: string;
}

export function CourseAttendanceHistory({
  courseId,
}: CourseAttendanceHistoryProps) {
  const { inscripciones, isLoading, fetchByCourseId } = useAttendanceStore();

  useEffect(() => {
    fetchByCourseId(courseId);
  }, [courseId, fetchByCourseId]);

  // Estado de carga
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Sin datos
  if (!inscripciones.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No hay alumnos inscritos en este curso.
          </p>
        </CardContent>
      </Card>
    );
  }

  const courseName = inscripciones[0]?.course?.name || "Curso";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{courseName}</CardTitle>
        <CardDescription>
          {inscripciones.length} alumno{inscripciones.length !== 1 ? "s" : ""}{" "}
          inscrito{inscripciones.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead className="text-center">Asistencias</TableHead>
                <TableHead className="text-center">Progreso</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscripciones.map((inscripcion) => {
                const asistencias = inscripcion.assistances || [];
                const totalAsistencias = asistencias.length;
                const totalClases = inscripcion.total_classes || 0;
                const porcentaje =
                  totalClases > 0
                    ? Math.round((totalAsistencias / totalClases) * 100)
                    : 0;

                return (
                  <TableRow key={inscripcion.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {inscripcion.student?.name || "Sin nombre"}
                        </p>
                        {inscripcion.is_personalized && (
                          <Badge variant="outline" className="mt-1">
                            Personalizado
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-semibold">
                        {totalAsistencias} / {totalClases}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {porcentaje}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="detail" className="border-0">
                          <AccordionTrigger className="py-0 hover:no-underline">
                            <Badge variant="outline" className="gap-1">
                              Ver detalle
                              <ChevronDown className="h-3 w-3" />
                            </Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <AttendanceDetail asistencias={asistencias} />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente auxiliar para mostrar el detalle de asistencias
 * Se expande al hacer click en "Ver detalle"
 */
function AttendanceDetail({
  asistencias,
}: {
  asistencias: any[];
}) {
  if (!asistencias.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No hay asistencias registradas
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-md bg-muted/50">
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
  );
}