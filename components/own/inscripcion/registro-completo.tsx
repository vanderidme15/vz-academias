import { CheckCircle, TicketIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Inscripcion } from "@/shared/types/supabase.types"

interface RegistroCompletadoProps {
  onReset?: () => void
  inscription: Inscripcion | null
  type: 'campista' | 'voluntario'
}

export function RegistroCompletado({ onReset, inscription, type }: RegistroCompletadoProps) {

  const handleOpenInscription = () => {
    if (type === 'campista') {
      window.open(`/campista/${inscription?.id}`, '_blank')
    } else {
      window.open(`/voluntario/${inscription?.id}`, '_blank')
    }
  }
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">
      <CheckCircle className="w-16 h-16 text-primary" />

      <h2 className="text-2xl font-semibold">
        ¡Registro completado!
      </h2>

      <p className="text-muted-foreground max-w-md">
        {type === 'campista'
          ? 'Tu inscripción al campamento se realizó correctamente, tu pago se verificará en breve.'
          : 'Tu registro como voluntario se realizó correctamente, tu pago se verificará en breve.'}
      </p>

      <div>
        <p>En el siguiente enlace podras ver tu {type === 'campista' ? 'inscripción' : 'registro'} con el estado de tu pago, guarda el enlace o tomale una captura de pantalla</p>
        <Button variant="outline" onClick={handleOpenInscription}>
          <TicketIcon /> Ver ticket - {inscription?.name}
        </Button>
      </div>

      {onReset && (
        <Button variant="link" onClick={onReset}>
          Registrar otra persona
        </Button>
      )}
    </div>
  )
}
