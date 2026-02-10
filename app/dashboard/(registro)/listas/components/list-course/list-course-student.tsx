import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils-functions/format-date";
import { Inscripcion } from "@/shared/types/supabase.types";

interface ListStudentItemProps {
  inscripcion: Inscripcion
}

export default function ListCourseStudent({ inscripcion }: ListStudentItemProps) {

  const payments = inscripcion.payments ?? []
  const total = payments?.reduce((total, payment) => total + (payment.payment_amount || 0), 0)
  const saldo = (inscripcion.price_charged || 0) - (total || 0)
  const porcentajeAsistencia = (inscripcion.total_classes || 0) > 0 ? (((inscripcion.class_count || 0) / (inscripcion.total_classes || 0)) * 100).toFixed(0) : 0;

  return (
    <div className="flex gap-1 items-center w-full" key={inscripcion.id}>
      <span>●</span>
      <div className="grow flex flex-col justify-center border rounded-md p-2">
        <p>{inscripcion.student?.name}</p>
        <div className="w-full flex gap-1">
          <div className="flex flex-col text-sm border-r px-2 basis-0 grow">
            <span className="text-xs font-bold">Precio</span>
            <span className="font-medium">S/ {inscripcion.price_charged?.toFixed(2)}</span>
            {inscripcion.includes_registration && (
              <>
                <span className="text-xs text-muted-foreground">
                  Mat: S/ {inscripcion.registration_price?.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Curso: S/ {inscripcion.course_price?.toFixed(2)}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col text-sm border-r px-2 basis-0 grow">
            <span className="text-xs font-bold">Pagos</span>
            <div className="flex flex-col justify-center gap-px">
              <div className="flex items-center gap-2 flex-wrap">
                {saldo > 0 ? (
                  <span className="text-xs text-orange-600 font-medium">
                    Saldo: S/ {saldo.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs text-green-600 font-medium">
                    Pagado ✓
                  </span>
                )}
              </div>
              {payments.length > 0 ? (
                <div className="flex gap-1 flex-wrap max-w-40 mt-1">
                  {payments.map((payment, index) => (
                    <div
                      key={`${payment.id}-${index}`}
                      className={cn(
                        "flex items-center gap-px px-1.5 py-0.5 rounded text-xs border-2 font-medium",
                        payment.payment_method === 'efectivo'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-purple-500 bg-purple-50 text-purple-700'
                      )}
                    >
                      S/ {payment.payment_amount?.toFixed(2)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground mt-1">
                  Sin pagos registrados
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col text-sm border-r px-2 basis-0 grow">
            <span className="text-xs font-bold">Asistencias</span>
            <div className="flex flex-col text-sm">
              <span className="font-medium">
                {inscripcion.class_count} / {inscripcion.total_classes}
                <span className="text-xs text-muted-foreground"> ({porcentajeAsistencia}%)</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col text-sm border-r px-2 basis-0 grow">
            <span className="text-xs font-bold">Fechas</span>
            <div className="flex flex-col text-sm">
              <div className="text-xs">
                Inicio: {formatDate(inscripcion.date_from || '')}
              </div>
              <div className="text-xs">
                Fin: {formatDate(inscripcion.date_to || '')}
              </div>
            </div>
          </div>
          <div className="flex flex-col text-sm px-2 basis-0 grow">
            <span className="text-xs font-bold">Acciones</span>
            <div className="flex flex-col text-sm">
              <Button variant="outline" size="sm">
                regularizar asistencias
              </Button>
              <Button variant="outline" size="sm">
                regularizar pagos
              </Button>
              <Button variant="outline" size="sm">
                ver asistencias
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}