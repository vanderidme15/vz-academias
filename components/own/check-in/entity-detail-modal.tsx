"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, DollarSign } from "lucide-react"
import { Inscripcion, Pago } from "@/shared/types/supabase.types"

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
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Detalle de Inscripción
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Datos del alumno */}
            <div>
              <span className="text-sm text-gray-500">Alumno</span>
              <p className="font-semibold">{student?.name || "N/A"}</p>
              {student?.dni && (
                <p className="text-sm text-gray-600">DNI: {student.dni}</p>
              )}
            </div>

            {/* Datos del curso */}
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

            {/* Información de pago */}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div>
                <span className="text-sm text-gray-500">Monto a cobrar</span>
                <p className="font-semibold">{formatCurrency(amountCharged)}</p>
                {inscripcion.includes_registration && (
                  <p className="text-xs text-gray-600 mt-1">
                    (Incluye matrícula: {formatCurrency(inscripcion.registration_price)})
                  </p>
                )}
              </div>

              <div>
                <span className="text-sm text-gray-500">Total pagado</span>
                <p className={`font-semibold ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                  {formatCurrency(totalPaid)}
                </p>
              </div>

              {remainingBalance > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Saldo pendiente</span>
                  <p className="font-semibold text-red-600">{formatCurrency(remainingBalance)}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500">Estado de pago</span>
                <p className="font-semibold">
                  {isFullyPaid ? (
                    <span className="text-green-600">✓ Pagado</span>
                  ) : hasPayments ? (
                    <span className="text-orange-600">⚠ Pago parcial</span>
                  ) : (
                    <span className="text-red-600">✗ Sin pagos</span>
                  )}
                </p>
              </div>
            </div>

            {/* Lista de pagos */}
            {hasPayments && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500 mb-2 block">Pagos registrados</span>
                <div className="space-y-2">
                  {payments.map((payment: Pago, index: number) => (
                    <div key={payment.id || index} className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{formatCurrency(payment.payment_amount)}</p>
                          <p className="text-xs text-gray-600 capitalize">
                            {payment.payment_method}
                            {payment.payment_code && ` - ${payment.payment_code}`}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                      </div>
                      {payment.register_by && (
                        <p className="text-xs text-gray-500 mt-1">Por: {payment.register_by}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observaciones */}
            {inscripcion.observations && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Observaciones</span>
                <p className="text-sm">{inscripcion.observations}</p>
              </div>
            )}

            {/* Registrado por */}
            {inscripcion.register_by && (
              <div>
                <span className="text-sm text-gray-500">Registrado por</span>
                <p className="text-sm">{inscripcion.register_by}</p>
              </div>
            )}

            {/* Fecha */}
            <div>
              <span className="text-sm text-gray-500">Fecha de inscripción</span>
              <p className="text-sm">{formatDate(inscripcion.created_at)}</p>
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

          {/* Advertencia de pago */}
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
      </DialogContent>
    </Dialog>
  )
}