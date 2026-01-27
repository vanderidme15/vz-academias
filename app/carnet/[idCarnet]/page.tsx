"use client"

import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"
import { cn } from "@/lib/utils";
import { Academia, Inscripcion } from "@/shared/types/supabase.types";
import { useParams } from "next/navigation"
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react"
import { useAcademiaStore } from "@/lib/store/academia.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCapIcon } from "lucide-react";
import { formatDate } from "@/lib/utils-functions/format-date";

export default function CarnetPage() {
  const { idCarnet } = useParams();
  const id = typeof idCarnet === 'string' ? idCarnet : undefined;

  const { fetchInscripcionById } = useInscripcionesStore();
  const { fetchAcademiaByDomain } = useAcademiaStore();

  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [academia, setAcademia] = useState<Academia | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await fetchInscripcionById(id);
        setInscripcion(data);
      }
    };

    fetchData();
  }, [idCarnet]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await fetchAcademiaByDomain(window.location.origin);
        setAcademia(data);
      }
    };

    fetchData();
  }, [idCarnet]);

  const outOfDate = inscripcion?.date_to && new Date() > new Date(inscripcion.date_to);

  if (!inscripcion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Cargando carnet...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-linear-to-br from-blue-50 to-purple-50 p-4">
      {/* Carnet tipo Boleto */}
      <div className="relative w-full max-w-2xl">
        {/* Línea de corte decorativa superior */}
        <div className="w-full h-8 flex items-center justify-center mb-2">
          <div className="flex-1 h-px border-t-2 border-dashed border-gray-300"></div>
          <svg className="w-6 h-6 text-gray-300 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 00-1 1v4a1 1 0 102 0V4a1 1 0 00-1-1zm0 8a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" />
          </svg>
          <div className="flex-1 h-px border-t-2 border-dashed border-gray-300"></div>
        </div>

        {/* Contenedor del boleto */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header del boleto */}
          <div
            className="text-white p-6"
            style={{
              background: `linear-gradient(to bottom, ${academia?.primary_color}, ${academia?.secondary_color})`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Carnet de asistencia - {academia?.name}</h1>
                <p className="text-blue-100 text-sm">Inscripción #{inscripcion.id?.slice(0, 8).toUpperCase()}</p>
              </div>
              <Avatar className="size-20 bg-white">
                <AvatarImage src={academia?.logo_url} />
                <AvatarFallback>
                  <GraduationCapIcon size={20} />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Información del estudiante */}
            <div className="space-y-4">
              <div className="border-l-4 pl-4" style={{ borderColor: academia?.primary_color }}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Estudiante</h2>
                <p className="text-2xl font-bold text-gray-900">
                  {inscripcion.student?.name}
                </p>
                {inscripcion.student?.cellphone && (
                  <p className="text-sm text-gray-600">📱 {inscripcion.student.cellphone}</p>
                )}
              </div>

              <div className="border-l-4 pl-4" style={{ borderColor: academia?.secondary_color }}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Curso</h2>
                <p className="text-xl font-bold text-gray-900">{inscripcion.course?.name}</p>
                {inscripcion.course?.schedule && (
                  <p className="text-sm text-gray-600 mt-1">{inscripcion.course.schedule.days?.join(', ')} - {inscripcion.course.schedule.start_time} - {inscripcion.course.schedule.end_time}</p>
                )}
              </div>

              {/* Progreso de clases */}
              <div className="rounded-lg p-4 bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progreso de Clases</span>
                  <span className="text-lg font-bold text-blue-600">
                    {inscripcion.class_count || 0}/{inscripcion.total_classes || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${inscripcion.total_classes ? ((inscripcion.class_count || 0) / inscripcion.total_classes) * 100 : 0}%`,
                      backgroundColor: academia?.primary_color
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {inscripcion.total_classes && inscripcion.class_count
                    ? `${Math.round(((inscripcion.class_count || 0) / inscripcion.total_classes) * 100)}% completado`
                    : 'Sin clases registradas'}
                </p>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Fechas</p>
                  <p className="text-xs font-semibold text-gray-900"><span className="font-light">Inicio:</span> {formatDate(inscripcion.date_from || '')}</p>
                  <p className="text-xs font-semibold text-gray-900"><span className="font-light">Fin:</span> {formatDate(inscripcion.date_to || '')}</p>
                  {outOfDate && (
                    <p className="text-xs text-red-400 font-bold mt-2">Inscripción vencida</p>
                  )}
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Precio</p>
                  <p className="text-sm font-semibold text-gray-900">
                    Total: S/ {inscripcion.price_charged?.toFixed(2) || '0.00'}
                  </p>
                  {inscripcion.includes_registration && (
                    <>
                      <p className="text-xs text-muted-foreground">Matrícula: S/ {inscripcion.registration_price?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-muted-foreground">Curso: S/ {inscripcion.course_price?.toFixed(2) || '0.00'}</p>
                    </>
                  )}
                </div>
                <div className="col-span-2 bg-muted rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Pagos</p>
                  {inscripcion.payments?.length == 0 || inscripcion.payments == null && (
                    <p className="text-sm font-semibold text-gray-900">Sin pagos registrados</p>
                  )}

                  {inscripcion.payments?.map((payment) => (
                    <div key={payment.id} className={cn("flex w-fit p-1 rounded", payment.payment_method == "efectivo" ? "bg-green-50 border-2 border-green-600" : "bg-purple-50 border-2 border-purple-600")}>
                      {/* <p className="text-sm font-semibold text-gray-900">{formatDate(payment.created_at)}</p> */}
                      <span className={cn(
                        "text-sm font-semibold text-gray-900",
                        payment.payment_method == "efectivo" ? "text-green-600" : "text-purple-600"
                      )}>
                        S/ {payment.payment_amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  ))}
                  <div className="text-xs text-red-400 font-bold mt-2">
                    <span>Saldo pendiente: {((inscripcion.price_charged || 0) - (inscripcion.payments?.reduce((acc, payment) => acc + (payment.payment_amount || 0), 0) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Código QR */}
            <div className="flex flex-col items-center justify-center">
              <div className="p-6 rounded-2xl" style={{ background: `${academia?.primary_color}30` }}>
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={inscripcion.id || ""}
                    size={240}
                    level="H"
                  />
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-semibold text-gray-700">Escanea para registrar asistencia</p>
                <p className="text-xs text-gray-500 mt-1">ID: {inscripcion.id?.slice(0, 13)}...</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {inscripcion.is_personalized && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 border-dashed border-black">
                    ⭐ Personalizado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer del boleto */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Última actualización: {formatDate(inscripcion.updated_at)}</span>
              </div>
              <span className="font-mono">#{inscripcion.id?.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Línea de corte decorativa inferior */}
        <div className="w-full h-8 flex items-center justify-center mt-2">
          <div className="flex-1 h-px border-t-2 border-dashed border-gray-300"></div>
          <svg className="w-6 h-6 text-gray-300 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 00-1 1v4a1 1 0 102 0V4a1 1 0 00-1-1zm0 8a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" />
          </svg>
          <div className="flex-1 h-px border-t-2 border-dashed border-gray-300"></div>
        </div>
      </div>

      {/* Botón de impresión */}
      <button
        onClick={() => window.print()}
        className="mt-6 px-6 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        style={{
          background: `${academia?.primary_color}`
        }}
      >
        🖨️ Imprimir Carnet
      </button>

      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div >
  )
}
