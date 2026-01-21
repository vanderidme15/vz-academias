'use client'
import { useState, useEffect } from "react";
import { usePreciosStore } from "@/lib/store/precios.store";
import { Precio } from "@/shared/types/supabase.types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CopyIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import CircleQuestionMark from "../../components/own/icons/circle-question-mark";

export default function FirstInfo({ setStep }: { setStep: (step: number) => void }) {
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

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.info("Número copiado al portapapeles");
  }

  const handleDownloadPDF = async () => {
    try {
      const supabase = createClient();

      // Descarga el archivo desde Storage
      const { data, error } = await supabase.storage
        .from('inscripciones')
        .download('docs/autorizacionMenor.pdf')

      if (error) {
        toast.error("Error al descargar el archivo");
        return;
      }

      // Crea una URL temporal para el blob
      const url = window.URL.createObjectURL(data);

      // Crea un link temporal y simula el click para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = 'autorizacionMenor.pdf';
      document.body.appendChild(link);
      link.click();

      // Limpia
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Archivo descargado correctamente, revisa tus descargas");
    } catch (error) {
      toast.error("Error al descargar el archivo");
    }
  }
  return (
    <div className="p-6 mb-4 border-2 border-dashed border-gray-200 rounded-md">
      <p className="text-lg font-bold">Consideraciones e indicaciones para tu inscripción:</p>
      <ul className="list-disc list-inside pl-4">
        <li className="">
          <span>Estos son los números de Yape y Plin. </span>
          <div className="flex w-full justify-center gap-2">
            <div onClick={() => handleCopyNumber("950569436")} className="flex flex-col items-center gap-px bg-slate-100 px-2 py-2 rounded border border-gray-200 cursor-pointer">
              <figure className="w-24 h-24">
                <img src="/qrs/plin.jpg" alt="" className="w-full h-auto object-contain" />
              </figure>
              <div>José Mamani - Plin</div>
              <div className="flex gap-2 items-center">950569436 <CopyIcon /></div>
            </div>
            <div onClick={() => handleCopyNumber("956890060")} className="flex flex-col items-center gap-px bg-slate-100 px-2 py-2 rounded border border-gray-200 cursor-pointer">
              <figure className="w-24 h-24">
                <img src="/qrs/yape.jpg" alt="" className="w-full h-auto object-contain" />
              </figure>
              <div>Victor Atamari - Yape</div>
              <div className="flex gap-2 items-center">956890060 <CopyIcon /></div>
            </div>
          </div>
        </li>
        <li>El monto total a pagar es de <strong>S/ {defaultPrecio?.price}</strong> ({defaultPrecio?.name}) </li>
        <li>Puedes reservar tu inscripción desde <strong>S/ 50</strong>.</li>
        <li className="italic ml-4 list-none border-2 border-amber-300 border-dashed p-2 rounded">¡Importante si solo reservas! El saldo debes pagarlo presencialmente en Jr. Mariano Nuñes N° 345 antes del <strong>8 de febrero</strong> para mantener el precio de Pre-venta.</li>
        <li>Adjunta en el formulario una captura de tu comprobante de pago (imagen clara).</li>
        <li>Debes ser mayor de 14 años para poder participar</li>
        <li>
          Si eres menor de edad debes tener <strong>la autorización firmada de tus padres o tutor, aquí podras descargar el</strong>{' '}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
          >
            formato
            <Download size={16} />
          </button>
        </li>
        <li className="flex flex-wrap gap-2 my-4"><CircleQuestionMark size={14} /> Si tienes alguna duda o consulta, puedes escribirnos al WhatsApp:
          <a href="https://wa.me/51992180530" target="_blank" className="rounded border bg-slate-100 px-2 py-1">992180530</a>
          <a href="https://wa.me/51925632050" target="_blank" className="rounded border bg-slate-100 px-2 py-1">925632050</a>
        </li>
      </ul>
      <div className="flex justify-center mt-4">
        <Button
          onClick={() => setStep(2)}
          variant="cta"
          size="cta"
          className="w-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}