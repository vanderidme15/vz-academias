import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils-functions/format-date";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Inscripcion>[] = [
  {
    accessorKey: 'course',
    header: 'Curso',
    cell: ({ row }) => {
      const isPersonalized = row.original.is_personalized;

      return (
        <div className="flex flex-col">
          <div className="flex flex-col justify-center gap-px">
            <span className="font-medium">{row.original.course?.name || '-'}</span>
            {isPersonalized && (
              <span className="inline-flex items-center w-fit rounded-full bg-blue-50 px-1 text-xs text-blue-700 border border-blue-200">
                Personalizado
              </span>
            )}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'total_classes',
    header: 'Clases',
    cell: ({ row }) => {
      const inscriptionClassCount = row.original.total_classes;
      const courseClassCount = row.original.course?.total_classes;
      const isPersonalized = row.original.is_personalized;

      // Verificar si el número de clases fue modificado
      const classCountModified = isPersonalized && courseClassCount && inscriptionClassCount !== courseClassCount;

      return (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{inscriptionClassCount || '-'}</span>
            {classCountModified && (
              <span className="text-xs text-blue-600 line-through">
                {courseClassCount}
              </span>
            )}
          </div>
          {classCountModified && (
            <span className="text-xs text-muted-foreground">
              Original: {courseClassCount} clases
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'price_charged',
    header: 'Precio',
    cell: ({ row }) => {
      const priceCharged = row.original.price_charged;
      const registrationPrice = row.original.registration_price;
      const coursePrice = row.original.course_price;
      const isPersonalized = row.original.is_personalized;
      const originalCoursePrice = row.original.course?.price;

      if (!priceCharged) return '-';

      // Verificar si el precio fue modificado
      const priceModified = isPersonalized && originalCoursePrice && coursePrice !== originalCoursePrice;

      return (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">S/ {priceCharged.toFixed(2)}</span>
            {priceModified && (
              <span className="text-xs text-blue-600 line-through">
                S/ {originalCoursePrice.toFixed(2)}
              </span>
            )}
          </div>
          {row.original.includes_registration && (
            <span className="text-xs text-muted-foreground">
              Mat: S/ {registrationPrice?.toFixed(2)} + Curso: S/ {coursePrice?.toFixed(2)}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'payments',
    accessorFn: (row) => row.payments,
    header: 'Pagos',
    cell: ({ row }) => {
      const payments = row.original.payments ?? []
      const total = payments.reduce((total, payment) => total + (payment.payment_amount || 0), 0)
      const saldo = (row.original.price_charged || 0) - total

      return (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">Total: S/ {total.toFixed(2)}</span>
            {saldo > 0 ? (
              <span className="text-xs text-orange-600 font-medium">
                Saldo: S/ {saldo.toFixed(2)}
              </span>
            ) : (
              <span className="text-xs text-green-600 font-medium">
                Pagado ✓
              </span>
            )}
          </div>
          {payments.length > 0 ? (
            <div className="flex gap-1 flex-wrap max-w-40 mt-1">
              {payments.map((payment, index) => (
                <div
                  key={`${payment.id}-${index}`}
                  className={cn(
                    "flex items-center gap-px px-1.5 py-0.5 rounded text-xs border-2 font-medium",
                    payment.payment_method === 'efectivo'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-purple-500 bg-purple-50 text-purple-700'
                  )}
                >
                  S/ {payment.payment_amount?.toFixed(2)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">
              Sin pagos registrados
            </div>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'class_count',
    header: 'Asistencias',
    cell: ({ row }) => {
      const assistances = row.original.class_count || 0;
      const totalClasses = row.original.total_classes || 0;
      const porcentaje = totalClasses > 0 ? ((assistances / totalClasses) * 100).toFixed(0) : 0;

      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {assistances} / {totalClasses}
            <span className="text-xs text-muted-foreground"> ({porcentaje}%)</span>
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'date_from',
    header: 'Fechas',
    cell: ({ row }) => {
      const dateFrom = row.original.date_from;
      const dateTo = row.original.date_to;
      if (!dateFrom || !dateTo) return '-';
      return (
        <>
          <div className="text-xs">
            Inicio: {formatDate(dateFrom || '')}
          </div>
          <div className="text-xs">
            Fin: {formatDate(dateTo || '')}
          </div>
        </>
      );
    }
  },
  {
    accessorKey: 'observations',
    header: 'Observaciones',
    cell: ({ row }) => {
      const observations = row.original.observations;
      if (!observations) return '-';
      return (
        <div className="flex flex-col text-[10px]">
          {observations}
        </div>
      );
    }
  },
  {
    accessorKey: 'register_by',
    header: 'Registrado por',
    cell: ({ row }) => {
      const register_by = row.original.register_by;
      if (!register_by) return '-';
      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {register_by}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Registrado',
    cell: ({ row }) => {
      if (!row.original.created_at) return '-';
      try {
        const date = new Date(row.original.created_at);
        return (
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true, locale: es })}
          </div>
        );
      } catch {
        return '-';
      }
    },
    meta: {
      visible: false
    }
  },
  {
    accessorKey: 'updated_at',
    header: 'Actualizado',
    cell: ({ row }) => {
      if (!row.original.updated_at) return '-';
      try {
        const date = new Date(row.original.updated_at);
        return (
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true, locale: es })}
          </div>
        );
      } catch {
        return '-';
      }
    },
    meta: {
      visible: false
    }
  },
]