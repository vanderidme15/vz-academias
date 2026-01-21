'use client';

import { useInscripcionAudit } from '@/lib/hooks/use-inscripcion-audit';
import { Pago } from '@/shared/types/supabase.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  inscripcionId: string;
  inscripcionName?: string;
  registerBy?: string;
}

export function InscripcionHistoryList({
  inscripcionId,
  inscripcionName,
  registerBy
}: Props) {
  const { history, loading } = useInscripcionAudit(inscripcionId);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'Creado';
      case 'UPDATE':
        return 'Actualizado';
      case 'DELETE':
        return 'Eliminado';
      default:
        return action;
    }
  };

  const formatFieldName = (field: string) => {
    const fieldNames: Record<string, string> = {
      name: 'Nombre',
      age: 'Edad',
      dni: 'DNI',
      check_in: 'Check-in',
      is_under_18: 'Es menor de 18',
      cellphone_number: 'Teléfono',
      parent_name: 'Nombre del padre/tutor',
      parent_cellphone_number: 'Teléfono del padre/tutor',
      terms_accepted: 'Términos aceptados',
      height: 'Talla',
      is_active: 'Estado activo',
      payments: 'Pagos',
      price_id: 'ID del precio',
      price_amount: 'Monto del precio',
      price_name: 'Nombre del precio',
      payment_completed: 'Pago completado',
      gender: 'Género',
      shirt_size: 'Talla de polo',
      register_by: 'Registrado por',
    };
    return fieldNames[field] || field;
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      yape: 'Yape',
      plin: 'Plin',
      cash: 'Efectivo',
    };
    return methods[method] || method;
  };

  const formatPayments = (payments: Pago[] | null | undefined) => {
    if (!payments || payments.length === 0) {
      return '(sin pagos)';
    }

    return payments.map((p, idx) => (
      <div key={idx} className="border-l-2 border-blue-300 pl-3 py-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">Monto:</span> S/ {p.payment_amount?.toFixed(2) ?? '0.00'}
        </p>
        <p className="text-sm">
          <span className="font-medium">Método:</span> {formatPaymentMethod(p.payment_method ?? '')}
        </p>
        <p className="text-sm">
          <span className="font-medium">Verificado:</span> {p.payment_checked ? '✓ Sí' : '✗ No'}
        </p>
        {p.payment_recipe_url && (
          <a
            href={p.payment_recipe_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 underline inline-block"
          >
            Ver comprobante →
          </a>
        )}
      </div>
    ));
  };

  const formatValue = (field: string, value: unknown) => {
    // Manejo especial para payments
    if (field === 'payments') {
      return formatPayments(value as Pago[] | null | undefined);
    }

    // Manejo especial para payment_completed
    if (field === 'payment_completed') {
      return value ? '✓ Completado' : '✗ Pendiente';
    }

    // Manejo especial para price_amount
    if (field === 'price_amount' && typeof value === 'number') {
      return `S/ ${value.toFixed(2)}`;
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (value === null || value === undefined || value === '') {
      return '(vacío)';
    }

    return String(value);
  };

  const renderFieldValue = (field: string, value: unknown, label: string) => {
    if (field === 'payments') {
      const payments = value as Pago[] | null | undefined;
      if (!payments || payments.length === 0) {
        return <p className="text-slate-400">{label} (sin pagos)</p>;
      }
      return (
        <div className="space-y-2">
          <p className="font-medium text-sm">{label}</p>
          {formatPayments(payments)}
        </div>
      );
    }

    return (
      <p className={value === undefined ? 'text-slate-400' : ''}>
        <span className="font-medium">{label}</span> {formatValue(field, value)}
      </p>
    );
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Historial de cambios
        </h2>
        {inscripcionName && (
          <p className="text-sm text-gray-600">
            Inscripción de: {inscripcionName}
          </p>
        )}
        {registerBy && (
          <p className="text-sm text-gray-600">
            Registrado por: {registerBy}
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No hay historial de cambios
        </div>
      ) : (
        <ol className="relative border-l border-gray-200 space-y-6">
          {history.map((log) => (
            <li key={log.id} className="ml-6">
              {/* Dot */}
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-300">
                <span className={`h-3 w-3 rounded-full ${getActionColor(log.action)}`} />
              </span>

              {/* Card */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {getActionText(log.action)}
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {log.user_email || 'Sistema'}
                    </p>
                  </div>
                  <time className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(log.changed_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </time>
                </div>

                {/* Changed fields */}
                {(log.changed_fields ?? []).length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Campos modificados
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {(log.changed_fields ?? []).map((field) => {
                        const oldValue = log.old_data?.[field];
                        const newValue = log.new_data?.[field];
                        const isPayments = field === 'payments';

                        return (
                          <div
                            key={field}
                            className={`rounded-md bg-gray-50 p-3 text-sm ${isPayments ? 'md:col-span-2' : ''}`}
                          >
                            <p className="font-medium text-gray-700 mb-2">
                              {formatFieldName(field)}
                            </p>

                            <div className="space-y-3">
                              {oldValue !== undefined && renderFieldValue(field, oldValue, 'Antes:')}
                              {newValue !== undefined && renderFieldValue(field, newValue, 'Actual:')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* INSERT / DELETE payload */}
                {log.action === 'INSERT' && log.new_data && (
                  <details className="mt-3">
                    <summary className="text-xs font-semibold text-green-700 cursor-pointer">
                      Ver datos iniciales
                    </summary>
                    <pre className="mt-2 text-xs bg-green-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(log.new_data, null, 2)}
                    </pre>
                  </details>
                )}

                {log.action === 'DELETE' && log.old_data && (
                  <details className="mt-3">
                    <summary className="text-xs font-semibold text-red-700 cursor-pointer">
                      Ver datos eliminados
                    </summary>
                    <pre className="mt-2 text-xs bg-red-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(log.old_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}