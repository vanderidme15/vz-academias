"use client"

import { useInscripcionesStore } from "@/lib/store/registro/inscripciones.store"
import { cn } from "@/lib/utils";
import { Inscripcion } from "@/shared/types/supabase.types";
import { useParams } from "next/navigation"
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react"

export default function CarnetPage() {
  const { idCarnet } = useParams();
  const id = typeof idCarnet === 'string' ? idCarnet : undefined;

  const { fetchInscripcionById } = useInscripcionesStore();

  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await fetchInscripcionById(id);
        setInscripcion(data);
      }
    };

    fetchData();
  }, [idCarnet]);

  if (!inscripcion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Cargando carnet...</div>
      </div>
    );
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

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
          <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">CARNET DE ASISTENCIA</h1>
                <p className="text-blue-100 text-sm">Inscripción #{inscripcion.id?.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Información del estudiante */}
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Estudiante</h2>
                <p className="text-2xl font-bold text-gray-900">
                  {inscripcion.student?.name}
                </p>
                {inscripcion.student?.cellphone && (
                  <p className="text-sm text-gray-600">📱 {inscripcion.student.cellphone}</p>
                )}
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Curso</h2>
                <p className="text-xl font-bold text-gray-900">{inscripcion.course?.name}</p>
                {inscripcion.course?.schedule && (
                  <p className="text-sm text-gray-600 mt-1">{inscripcion.course.schedule.days?.join(', ')} - {inscripcion.course.schedule.start_time} - {inscripcion.course.schedule.end_time}</p>
                )}
              </div>

              {/* Progreso de clases */}
              <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progreso de Clases</span>
                  <span className="text-lg font-bold text-blue-600">
                    {inscripcion.class_count || 0}/{inscripcion.total_classes || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${inscripcion.total_classes ? ((inscripcion.class_count || 0) / inscripcion.total_classes) * 100 : 0}%`
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
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Fecha de Inscripción</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(inscripcion.created_at)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
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
                <div className="col-span-2 bg-gray-50 rounded-lg p-3">
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
              <div className="bg-linear-to-br from-blue-100 to-purple-100 p-6 rounded-2xl">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={inscripcion.id || ""}
                    size={240}
                    level="H"
                    includeMargin={true}
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
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
        className="mt-6 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
    </div>
  )
}
