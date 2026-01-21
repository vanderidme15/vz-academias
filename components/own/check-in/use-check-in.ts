"use client"

import { CheckInConfig, CheckInEntity } from "@/shared/types/ui.types"
import { useState } from "react"
import { toast } from "sonner"

export function useCheckIn<T extends CheckInEntity>(config: CheckInConfig<T>) {
  const [showScanModal, setShowScanModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [scanResult, setScanResult] = useState<T | null>(null)

  const handleStartScan = () => {
    setShowScanModal(true)
    setScanResult(null)
  }

  const handleCloseScanModal = () => {
    setShowScanModal(false)
  }

  const handleQRScanned = async (qrCode: string) => {
    try {
      const entity = await config.fetchById(qrCode)

      if (entity) {
        setScanResult(entity)
        setShowResultModal(true)
      } else {
        const entityName = config.type === 'inscripcion' ? 'inscripción' : 'voluntario'
        toast.error(`No se encontró ${entityName === 'inscripción' ? 'la' : 'el'} ${entityName}`, {
          description: `El código QR no corresponde a ${entityName === 'inscripción' ? 'ninguna' : 'ningún'} ${entityName} registrado`
        })
      }
    } catch (error) {
      console.error("Error al procesar QR:", error)
      const entityName = config.type === 'inscripcion' ? 'la inscripción' : 'el voluntario'
      toast.error(`Error al buscar ${entityName}`)
    }
  }

  const handleConfirmCheckIn = async () => {
    if (scanResult?.id) {
      await config.handleCheckIn(scanResult.id)
      setShowResultModal(false)
      setScanResult(null)
    }
  }

  const handleCloseResultModal = () => {
    setShowResultModal(false)
    setScanResult(null)
  }

  return {
    showScanModal,
    showResultModal,
    scanResult,
    handleStartScan,
    handleCloseScanModal,
    handleQRScanned,
    handleConfirmCheckIn,
    handleCloseResultModal,
  }
}