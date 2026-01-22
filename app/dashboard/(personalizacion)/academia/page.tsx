"use client"

import { GraduationCapIcon } from "lucide-react";
import AcademiaForm from "./academia-form";
import { useAcademiaStore } from "@/lib/store/academia.store";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

export default function AcademiaPage() {
  const { user } = useAuth();
  const { academia, fetchAcademiaById, updateAcademia } = useAcademiaStore();

  useEffect(() => {
    fetchAcademiaById(user?.academy_id);
  }, [user]);

  return (
    <div className="flex flex-col gap-4 w-full h-full bg-muted/30 rounded-xl px-20 py-4">
      <h1 className="text-3xl font-bold">Personalizar academia</h1>
      <div className="flex flex-col gap-4 w-full h-full bg-card rounded-xl overflow-hidden">
        <div className="w-full bg-linear-to-b from-red-100 to-purple-200 h-30 relative">
          <div className="absolute -bottom-10 left-10 w-20 h-20 rounded-full flex items-center justify-center bg-card border">
            <GraduationCapIcon className="size-10" />
          </div>
        </div>
        <div className="w-full h-full mt-14 overflow-y-auto px-12">
          <div className="p-4 border border-dashed rounded-xl">
            <h3 className="text-lg font-bold">Información del plan</h3>
            <ul className="list-disc list-inside mt-2">
              <li>Tipo de plan: <span>Anual</span></li>
              <li>Fecha de inicio: <span>22/01/2026</span></li>
              <li>Fecha de finalización: <span>22/01/2027</span></li>
            </ul>
            <span className="text-sm ">Para renovación contactar al whatsapp: <span>+51 966226600</span></span>
          </div>
          <div className="p-4 border border-dashed rounded-xl">
            <h3 className="text-lg font-bold">Información de la academia</h3>
            {academia && (
              <AcademiaForm
                academia={academia}
                onEdit={updateAcademia}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}