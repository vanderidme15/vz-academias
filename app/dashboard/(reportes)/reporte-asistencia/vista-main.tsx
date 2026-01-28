// components/attendance/AttendanceOverview.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CoursesOverview } from "./courses-overview";
import { StudentSearch } from "./alumno";

export function AttendanceOverview() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reporte de Asistencias</h1>
        <p className="text-muted-foreground mt-2">
          Visualiza y gestiona las asistencias por curso o por alumno
        </p>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="courses">Por Cursos</TabsTrigger>
          <TabsTrigger value="student">Por Alumno</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <CoursesOverview />
        </TabsContent>

        <TabsContent value="student" className="mt-6">
          <StudentSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}