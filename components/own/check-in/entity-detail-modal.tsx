"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"
import { CheckInEntity, CheckInType } from "@/shared/types/ui.types"


interface EntityDetailModalProps<T extends CheckInEntity> {
  open: boolean
  onClose: () => void
  entity: T | null
  onConfirmCheckIn: () => void
  type: CheckInType
  extraFields?: React.ReactNode
}

export function EntityDetailModal<T extends CheckInEntity>({
  open,
  onClose,
  entity,
  onConfirmCheckIn,
  type,
  extraFields
}: EntityDetailModalProps<T>) {
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

  const getTitle = () => {
    return type === 'inscripcion' ? 'Inscripción encontrada' : 'Voluntario encontrado'
  }

  if (!entity) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm text-gray-500">Nombre</span>
              <p className="font-semibold">{entity.name || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">DNI</span>
              <p className="font-semibold">{entity.dni || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Edad</span>
              <p className="font-semibold">{entity.age || "N/A"} años</p>
            </div>
            {entity.cellphone_number && (
              <div>
                <span className="text-sm text-gray-500">Celular</span>
                <p className="font-semibold">{entity.cellphone_number}</p>
              </div>
            )}

            {/* Campos extra específicos del tipo */}
            {extraFields}

            <div>
              <span className="text-sm text-gray-500">Método de pago</span>
              <p className="font-semibold capitalize">{entity.payment_method || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Pago verificado</span>
              <p className="font-semibold">
                {entity.payment_checked ? (
                  <span className="text-green-600">✓ Verificado</span>
                ) : (
                  <span className="text-orange-600">⚠ Pendiente</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Estado check-in</span>
              <p className="font-semibold">
                {entity.check_in ? (
                  <span className="text-green-600">✓ Ya realizó check-in</span>
                ) : (
                  <span className="text-gray-600">Pendiente</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Fecha de registro</span>
              <p className="text-sm">{formatDate(entity.created_at)}</p>
            </div>
            {entity.is_under_18 && entity.parent_name && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Tutor</span>
                <p className="font-semibold">{entity.parent_name}</p>
                {entity.parent_cellphone_number && (
                  <p className="text-sm text-gray-600">{entity.parent_cellphone_number}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onConfirmCheckIn}
              className="flex-1"
              disabled={!entity.payment_checked}
            >
              {entity.check_in ? "Cancelar check-in" : "Confirmar check-in"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cerrar
            </Button>
          </div>

          {!entity.payment_checked && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                El pago aún no ha sido verificado. Debe verificarse antes de realizar el check-in.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}