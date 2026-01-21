'use client';

import { useVoluntarioAudit } from '@/lib/hooks/use-voluntario-audit';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  voluntarioId: string;
  voluntarioName?: string;
}

export function VoluntariosHistoryList({
  voluntarioId,
  voluntarioName
}: Props) {
  const { history, loading } = useVoluntarioAudit(voluntarioId);

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
      is_under_18: 'Es menor de 18',
      cellphone_number: 'Teléfono',
      payment_method: 'Método de pago',
      payment_recipe_url: 'Comprobante',
      payment_checked: 'Pago verificado',
      parent_name: 'Nombre del padre',
      parent_cellphone_number: 'Teléfono del padre',
      terms_accepted: 'Términos aceptados',
      is_active: 'Estado de la inscripción',
      shirt_size: 'Talla de polo',
      gender: 'Género',
      observations: 'Observaciones',
    };
    return fieldNames[field] || field;
  };

  const formatValue = (value: unknown) => {
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (value === null || value === undefined || value === '') {
      return '(vacío)';
    }

    return String(value);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Historial de cambios
        </h2>
        {voluntarioName && (
          <p className="text-sm text-gray-600">
            Voluntario: {voluntarioName}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(log.changed_fields ?? []).map((field) => {
                        const oldValue = log.old_data?.[field];
                        const newValue = log.new_data?.[field];

                        return (
                          <div
                            key={field}
                            className="rounded-md bg-gray-50 p-3 text-sm"
                          >
                            <p className="font-medium text-gray-700 mb-1">
                              {formatFieldName(field)}
                            </p>

                            {oldValue !== undefined && (
                              <p className="text-slate-400">
                                <span className="font-medium">Antes:</span>{' '}
                                {formatValue(oldValue)}
                              </p>
                            )}

                            {newValue !== undefined && (
                              <p>
                                <span className="font-medium">Actual:</span>{' '}
                                {formatValue(newValue)}
                              </p>
                            )}
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
