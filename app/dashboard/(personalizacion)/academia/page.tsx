"use client"

import { GraduationCapIcon } from "lucide-react";
import AcademiaForm from "./academia-form";
import { useAcademiaStore } from "@/lib/store/academia.store";
import { useMemo } from "react";
import { formatDate } from "@/lib/utils-functions/format-date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function AcademiaPage() {
  const { academia, updateAcademia } = useAcademiaStore();

  const fechaStart = useMemo(() => {
    return formatDate(academia?.start_date);
  }, [academia?.start_date]);

  const fechaEnd = useMemo(() => {
    return formatDate(academia?.end_date);
  }, [academia?.end_date]);

  return (
    <div className="flex flex-col gap-4 w-full h-full bg-muted/30 rounded-xl p-4">
      <h1 className="text-3xl font-bold">Personalizar academia</h1>
      <div className="flex flex-col gap-4 w-full h-full bg-card rounded-xl overflow-hidden">
        <div
          className="w-full h-30 relative"
          style={{
            background: `linear-gradient(to bottom, ${academia?.primary_color},${academia?.secondary_color})`
          }}
        >
          <div className="absolute -bottom-12 left-10 rounded-full flex items-center justify-center bg-card border">
            <Avatar className="size-30">
              <AvatarImage src={academia?.logo_url} />
              <AvatarFallback>
                <GraduationCapIcon size={30} />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="w-full h-full mt-14 overflow-y-auto px-4 space-y-2">
          <div className="p-4 border border-dashed rounded-xl">
            <h3 className="text-lg font-bold">Información del plan</h3>
            <ul className="list-disc list-inside mt-2">
              <li>Tipo de plan: <span>{academia?.plan_type === 'year' ? 'Anual' : 'Mensual'}</span></li>
              <li>Fecha de inicio: <span>{fechaStart}</span></li>
              <li>Fecha de finalización: <span>{fechaEnd}</span></li>
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