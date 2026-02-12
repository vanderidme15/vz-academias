"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, DollarSign } from "lucide-react"
import { Inscripcion, Pago } from "@/shared/types/supabase.types"
import { formatDate } from "@/lib/utils-functions/format-date";

interface InscripcionDetailModalProps {
  open: boolean
  onClose: () => void
  inscripcion: Inscripcion | null
  onConfirmAction: () => void
  actionLabel?: string
}

export function InscripcionDetailModal({
  open,
  onClose,
  inscripcion,
  onConfirmAction,
  actionLabel = "Confirmar"
}: InscripcionDetailModalProps) {

  const formatCurrency = (amount?: number) => {
    if (!amount) return "S/ 0.00"
    return `S/ ${amount.toFixed(2)}`
  }

  if (!inscripcion) return null

  const student = inscripcion.student
  const course = inscripcion.course
  const progress = inscripcion.total_classes
    ? `${inscripcion.class_count || 0}/${inscripcion.total_classes}`
    : "N/A"

  // Calcular información de pagos
  const payments = inscripcion.payments || []
  const totalPaid = payments.reduce((sum: number, payment: Pago) => sum + (payment.payment_amount || 0), 0)
  const amountCharged = inscripcion.price_charged || 0
  const remainingBalance = amountCharged - totalPaid
  const hasPayments = payments.length > 0
  const isFullyPaid = remainingBalance <= 0

  // Mostrar advertencia si no tiene pagos o no está completamente pagado
  const showPaymentWarning = !hasPayments || !isFullyPaid

  const outOfDate = inscripcion?.date_to && new Date() > new Date(inscripcion.date_to);
  const mesLabel = inscripcion?.date_to && new Date(inscripcion.date_to).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric"
  });


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col w-full md:w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Detalle de Inscripción
          </DialogTitle>
          <DialogDescription>
            Información detallada de la inscripción del alumno.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 overflow-y-auto">
          <div className="border border-dashed border-amber-500 rounded-full px-2 py-1 text-xs text-amber-500 font-bold w-fit">{mesLabel}</div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Datos del alumno */}
            <div>
              <span className="text-sm text-gray-500">Estudiante</span>
              <p className="font-semibold">{student?.name || "N/A"}</p>
              {student?.dni && (
                <p className="text-sm text-gray-600">DNI: {student.dni}</p>
              )}
            </div>

            <div className="flex gap-1 items-center justify-between">
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Curso</span>
                <p className="font-semibold">{course?.name || "N/A"}</p>
                {inscripcion.is_personalized && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                    Personalizado
                  </span>
                )}
              </div>

              {/* Progreso */}
              <div>
                <span className="text-sm text-gray-500">Progreso</span>
                <p className="font-semibold">{progress} clases</p>
              </div>
            </div>

            {/* Datos del curso */}

            {/* Información de pago */}
            <div className="flex flex-col gap-1 pt-3 border-t border-gray-200 space-y-2">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500">Monto a cobrar</span>
                <p className="font-semibold">{formatCurrency(amountCharged)}</p>
                {inscripcion.includes_registration && (
                  <p className="text-xs text-gray-600 mt-1">
                    (Incluye matrícula: {formatCurrency(inscripcion.registration_price)})
                  </p>
                )}
              </div>
              {showPaymentWarning && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">
                    {!hasPayments
                      ? "No se han registrado pagos para esta inscripción."
                      : `Falta pagar ${formatCurrency(remainingBalance)} para completar el pago.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {inscripcion.observations && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Observaciones</span>
                <p className="text-sm">{inscripcion.observations}</p>
              </div>
            )}

            {/* Fecha */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Fechas</p>
              <p className="text-xs font-semibold text-gray-900"><span className="font-light">Inicio:</span> {formatDate(inscripcion.date_from || '')}</p>
              <p className="text-xs font-semibold text-gray-900"><span className="font-light">Fin:</span> {formatDate(inscripcion.date_to || '')}</p>
              {outOfDate && (
                <p className="text-xs text-red-400 font-bold mt-2">Inscripción vencida</p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={onConfirmAction}
              className="flex-1"
            >
              {actionLabel}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}