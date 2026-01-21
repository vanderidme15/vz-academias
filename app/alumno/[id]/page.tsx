"use client"

import { Voluntario } from "@/shared/types/supabase.types";
import { useParams } from "next/navigation"
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from "react";
import { useVoluntariosStore } from "@/lib/store/voluntarios.store";

// Date formatting utility
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Commission labels
const getCommissionLabel = (commission?: string) => {
  const labels = {
    'logistica': { text: 'Logística', icon: '👩🏻‍💻', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    'recepcion': { text: 'Recepción', icon: '👋🏻', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    'programacion-actividades': { text: 'Programación y actividades', icon: '📅', color: 'bg-green-100 text-green-700 border-green-200' },
    'sonido-luces': { text: 'Sonido y luces', icon: '🔊', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'publicidad': { text: 'Publicidad', icon: '📸', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    'alimentacion-limpieza': { text: 'Alimentación y limpieza', icon: '🍽️', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    'finanzas': { text: 'Finanzas', icon: '💰', color: 'bg-red-100 text-red-700 border-red-200' },
    'atencion-pastores': { text: 'Atención de pastores', icon: '🙏', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    'jueces': { text: 'Jueces', icon: '⚖️', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    'contenido-digital': { text: 'Contenido digital', icon: '📱', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    'lideres-equipo': { text: 'Líderes de equipo', icon: '🧗🏻‍♂️', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    'dinamicas-souvenires': { text: 'Dinámicas y Souvenires', icon: '🎁', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  };
  return labels[commission as keyof typeof labels] || { text: '-', icon: '📋', color: 'bg-gray-100 text-gray-700 border-gray-200' };
};

export default function VoluntarioPage() {
  const { id } = useParams();
  const [voluntarioData, setVoluntarioData] = useState<Voluntario | null>(null);

  const { fetchVoluntarioById } = useVoluntariosStore();

  useEffect(() => {
    if (id) {
      const idString = Array.isArray(id) ? id[0] : id;
      fetchVoluntarioById(idString).then((data) => {
        setVoluntarioData(data);
      });
    }
  }, [id]);

  const commissionInfo = getCommissionLabel(voluntarioData?.commission);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {!voluntarioData ? (
        <div className="text-white text-lg">
          Buscando voluntario...
        </div>
      ) : (
        <div className="relative w-full max-w-md">
          {/* Ticket Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Decorative stripes at top */}
            <div className="h-3 bg-linear-to-rrom-purple-500 via-indigo-500 to-purple-500 flex">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`}
                  style={{ transform: 'skewX(-20deg)' }}
                />
              ))}
            </div>

            {/* Top Section */}
            <div className="p-6 pb-4">
              {/* Volunteer Badge */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  VOLUNTARIO
                </div>
              </div>

              {/* Header */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Nombre</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                    {voluntarioData.name}
                  </p>
                  {voluntarioData.dni && (
                    <p className="text-xs text-gray-500 mt-1">DNI: {voluntarioData.dni}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Código</p>
                  <p className="text-lg font-bold text-indigo-600 font-mono">
                    V-{voluntarioData.id?.slice(0, 5).toUpperCase()}
                  </p>
                  {voluntarioData.payment_checked ? (
                    <div className="inline-flex items-center gap-1 mt-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Pagado
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 mt-1 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Pago por verificar
                    </div>
                  )}
                </div>
              </div>

              {/* Commission Badge - Destacado */}
              <div className="mb-4">
                <div className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 ${commissionInfo.color}`}>
                  <span className="text-3xl">{commissionInfo.icon}</span>
                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-70 font-semibold">Comisión Asignada</p>
                    <p className="text-xl font-bold">{commissionInfo.text}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">CAMPAMENTO</p>
                    <p className="text-sm text-gray-500">Servicio Voluntario</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participant Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Edad</p>
                  <p className="text-base font-semibold text-gray-900">
                    {voluntarioData.age || '-'} años
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Celular</p>
                  <p className="text-base font-semibold text-gray-900">
                    {voluntarioData.cellphone_number || '-'}
                  </p>
                </div>
              </div>

              {/* Parent/Guardian Info (if minor) */}
              {voluntarioData.is_under_18 && voluntarioData.parent_name && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 uppercase tracking-wide mb-2 font-semibold">
                    Responsable
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">{voluntarioData.parent_name}</p>
                    {voluntarioData.parent_cellphone_number && (
                      <p className="text-sm text-gray-600">{voluntarioData.parent_cellphone_number}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Pago and Date Info */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Registro</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {voluntarioData.created_at ? formatDate(voluntarioData.created_at) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Aporte</p>
                  <p className="text-sm font-semibold text-indigo-600 uppercase">
                    {voluntarioData.payment_method === 'yape' ? '💳 Yape' :
                      voluntarioData.payment_method === 'efectivo' ? '💵 Efectivo' : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Perforated divider */}
            <div className="relative h-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-gray-300"></div>
              </div>
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-linear-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-full"></div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-linear-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-full"></div>
            </div>

            {/* Bottom Section - QR Code */}
            <div className="p-6 pt-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center mb-4 font-medium">
                Credencial de Voluntario - Presenta este código QR
              </p>

              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl shadow-md border-2 border-indigo-200">
                  <QRCodeSVG
                    value={voluntarioData.id || ""}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 font-mono mt-2 tracking-wider">
                {voluntarioData.id?.toUpperCase()}
              </p>

              {/* Status badge */}
              {voluntarioData.is_active && (
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-linear-to-r from-purple-100 to-indigo-100 text-indigo-700 text-sm px-4 py-2 rounded-full font-medium border border-indigo-200">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    Voluntario Activo
                  </div>
                </div>
              )}
            </div>

            {/* Decorative stripes at bottom */}
            <div className="h-3 bg-linear-to-r from-purple-500 via-indigo-500 to-purple-500 flex">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`}
                  style={{ transform: 'skewX(-20deg)' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}