"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Camera } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"

interface QRScannerModalProps {
  open: boolean
  onClose: () => void
  onQRScanned: (qrCode: string) => void
}

export function QRScannerModal({ open, onClose, onQRScanned }: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        startScanner()
      }, 100)
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [open])

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === 2) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (error) {
        console.error("Error al detener el escáner:", error)
      }
    }
    setIsScanning(false)
  }

  const startScanner = async () => {
    try {
      setScannerError(null)
      setIsScanning(true)

      const html5QrCode = new Html5Qrcode("qr-reader")
      scannerRef.current = html5QrCode

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          await stopScanner()
          onQRScanned(decodedText)
        },
        () => {
          // Error de escaneo normal
        }
      )
    } catch (error: any) {
      console.error("Error al iniciar escáner:", error)
      setScannerError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
      setIsScanning(false)
      toast.error("Error al iniciar la cámara")
    }
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear código QR</DialogTitle>
          <DialogDescription>
            Coloca el código QR frente a la cámara para realizar el check-in
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-full flex flex-col items-center gap-3">
            {scannerError ? (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">Error de cámara</p>
                  <p className="text-xs text-red-600 mt-1">{scannerError}</p>
                </div>
              </div>
            ) : (
              <>
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>

                {isScanning && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Camera className="w-4 h-4 animate-pulse" />
                    <span>Buscando código QR...</span>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}