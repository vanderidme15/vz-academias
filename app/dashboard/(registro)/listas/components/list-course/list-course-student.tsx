import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils-functions/format-date";
import { Inscripcion } from "@/shared/types/supabase.types";
import { Calendar, MoreVertical, CreditCard, UserCheck, PiggyBankIcon, ContactRoundIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ListStudentItemProps {
  inscripcion: Inscripcion;
  setOpenAttendanceDialog: (open: boolean) => void;
  setInscripcionSelected: (inscripcion: Inscripcion) => void;
}

export default function ListCourseStudent({ inscripcion, setOpenAttendanceDialog, setInscripcionSelected }: ListStudentItemProps) {
  const payments = inscripcion.payments ?? [];
  const total = payments?.reduce((total, payment) => total + (payment.payment_amount || 0), 0);
  const saldo = (inscripcion.price_charged || 0) - (total || 0);
  const porcentajeAsistencia = (inscripcion.total_classes || 0) > 0
    ? (((inscripcion.class_count || 0) / (inscripcion.total_classes || 0)) * 100).toFixed(0)
    : 0;

  const getStatusBadge = () => {
    if (saldo <= 0) {
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Pagado</Badge>;
    }
    return <Badge variant="secondary" className="bg-slate-100 text-slate-800">Deuda</Badge>;
  };


  return (
    <div className="grid grid-cols-9 items-start justify-between p-4 gap-3 border rounded-xl bg-card">
      {/* Student Info */}
      <div className="col-span-9 md:col-span-3 flex items-center h-full  gap-3">
        <h3 className="w-full truncate leading-none tracking-tight">
          {inscripcion.student?.name}
        </h3>
      </div>

      {/* Price */}
      <div className="col-span-9 md:col-span-1 flex md:flex-col items-center md:items-start gap-2">
        <span className="text-sm font-bold text-muted-foreground tracking-tight">
          Precio
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-foreground">
            S/ {inscripcion.price_charged?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="col-span-7 md:col-span-2 flex md:flex-col items-center md:items-start gap-1">
        <span className="text-sm font-bold text-muted-foreground tracking-tight">
          Estado
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground tracking-tight">
              Pagos
            </span>
            <div className="text-sm">
              {payments && payments.length > 0 && payments.map((payment) => {
                return (
                  <div key={payment.id} className="flex items-center gap-1">
                    <span className="font-medium text-muted-foreground tracking-tight">
                      • S/ {payment.payment_amount?.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {saldo > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground tracking-tight">
                Saldo
              </span>
              <span className="text-sm font-medium text-muted-foreground tracking-tight">
                S/ {saldo.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Attendance Progress */}
      <div className="col-span-9 md:col-span-2 flex flex-col gap-1.5 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-muted-foreground tracking-tight">
            Asistencias
          </span>
          <span className="text-sm font-bold text-primary">
            {porcentajeAsistencia}%
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${porcentajeAsistencia}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {inscripcion.class_count} / {inscripcion.total_classes} clases
          </span>
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>{formatDate(inscripcion.date_from || '')} - {formatDate(inscripcion.date_to || '')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-9 md:col-span-1 h-full flex items-center gap-0.5">
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="grow basis-0 bg-green-600 text-white hover:bg-green-700 hover:text-white"
            >
              <PiggyBankIcon />
              <span className="text-xs md:hidden">Regularizar pago</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-green-600 text-white fill-green-600">
            <p>Regularizar pago</p>
          </TooltipContent>
        </Tooltip> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="grow basis-0 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
              onClick={() => {
                const url = `${window.location.origin}/carnet/${inscripcion.id}`;
                window.open(url, "_blank");
              }}
            >
              <ContactRoundIcon />
              <span className="text-xs md:hidden">Ver Carnet</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-blue-600 text-white fill-blue-600">
            <p>Ver Carnet</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="grow basis-0 bg-amber-400 text-white hover:bg-amber-500 hover:text-white"
              onClick={() => {
                setOpenAttendanceDialog(true);
                setInscripcionSelected && setInscripcionSelected(inscripcion);
              }}
            >
              <UserCheck />
              <span className="text-xs md:hidden">Regularizar asistencia</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-amber-400 text-white fill-amber-400">
            <p>Regularizar asistencia</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
