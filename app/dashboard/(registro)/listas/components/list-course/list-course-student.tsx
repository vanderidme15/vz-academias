import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils-functions/format-date";
import { Inscripcion } from "@/shared/types/supabase.types";
import { Calendar, MoreVertical, UserCheck, PiggyBankIcon, ContactRoundIcon, TicketXIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ListStudentItemProps {
  inscripcion: Inscripcion;
  setOpenAttendanceDialog: (open: boolean) => void;
  setOpenAttendanceForceDialog: (open: boolean) => void;
  setOpenPaymentsDialog: (open: boolean) => void;
  setInscripcionSelected: (inscripcion: Inscripcion) => void;
}

export default function ListCourseStudent({ inscripcion, setOpenAttendanceDialog, setOpenAttendanceForceDialog, setOpenPaymentsDialog, setInscripcionSelected }: ListStudentItemProps) {
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
      <div className="col-span-9 md:col-span-1 h-full flex items-center justify-end gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* ver carnet */}
            <DropdownMenuItem onClick={() => {
              const url = `${window.location.origin}/carnet/${inscripcion.id}`;
              window.open(url, "_blank");
            }}>
              <ContactRoundIcon />
              <span>Ver carnet</span>
            </DropdownMenuItem>

            {/* regularizar asistencia */}
            <DropdownMenuItem onClick={() => {
              setOpenAttendanceDialog(true);
              setInscripcionSelected && setInscripcionSelected(inscripcion);
            }}>
              <UserCheck />
              <span>Regularizar asistencia</span>
            </DropdownMenuItem>

            {/* regularizar pagos */}
            <DropdownMenuItem onClick={() => {
              setOpenPaymentsDialog(true);
              setInscripcionSelected && setInscripcionSelected(inscripcion);
            }}>
              <PiggyBankIcon />
              <span>Regularizar pagos</span>
            </DropdownMenuItem>

            {/* forzar asistencia */}
            <DropdownMenuItem
              onClick={() => {
                setOpenAttendanceForceDialog(true);
                setInscripcionSelected && setInscripcionSelected(inscripcion);
              }}
              className="text-red-700"
            >
              <TicketXIcon className="text-red-700" />
              <span>Forzar asistencias</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
