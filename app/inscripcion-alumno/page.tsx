'use client'

import { useEffect, useState } from "react"
import { Stepper } from "@/components/own/stepper"
import { AutoinscripcionForm } from "./autoinscripcion-form"
import { RegistroCompletado } from "@/components/own/inscripcion/registro-completo"
import { useInscripcionesStore } from "@/lib/store/inscripciones.store"
import { Inscripcion, Precio } from "@/shared/types/supabase.types"
import Link from "next/link"
import { usePreciosStore } from "@/lib/store/precios.store"
import FirstInfo from "@/app/inscripcion-voluntario/first-info"

const steps = [
  { id: 1, label: "Instrucciones" },
  { id: 2, label: "Formulario" },
  { id: 3, label: "Confirmación" },
]

export default function InscripcionCampistaPage() {
  const [step, setStep] = useState(1)
  const [newInscription, setNewInscription] = useState<Inscripcion | null>(null);
  const { createAutoInscripcion } = useInscripcionesStore();
  const { fetchDefaultPrecio } = usePreciosStore();
  const [defaultPrecio, setDefaultPrecio] = useState<Precio | null>(null);

  useEffect(() => {
    const getDefaultPrecio = async () => {
      const defaultPrecio = await fetchDefaultPrecio();
      if (defaultPrecio) {
        setDefaultPrecio(defaultPrecio);
      }
    }
    getDefaultPrecio();

  }, []);

  const handleCreate = async (data: Record<string, any>) => {
    const valuesToCreate = {
      ...data,
      payment_method: 'yape',
      register_by: "campista",
      precio_id: defaultPrecio?.id,
      precio_name: defaultPrecio?.name,
      precio_price: defaultPrecio?.price
    }
    const result = await createAutoInscripcion(valuesToCreate);
    if (result) {
      setNewInscription(result);
      setStep(2);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center gap-4 justify-center">
      <Link href="/" className="mb-4">
        <img src="/main-logo.webp" alt="Campamento Desafío 2026" className="w-40 m-auto" />
      </Link>
      <h1 className="font-display text-2xl font-bold mb-4">Inscripción -  Campista</h1>
      <Stepper steps={steps} currentStep={step} />
      {step === 1 && (
        <div className="w-full">
          <FirstInfo setStep={setStep} />
        </div>
      )}
      {step === 2 && (
        <div className="w-full">
          <AutoinscripcionForm
            onCreate={handleCreate}
            defaultPrecio={defaultPrecio}
            setStep={setStep}
          />
        </div>
      )}

      {step === 3 && (
        <RegistroCompletado onReset={() => setStep(1)} inscription={newInscription} type="campista" />
      )}
    </div>
  )
}