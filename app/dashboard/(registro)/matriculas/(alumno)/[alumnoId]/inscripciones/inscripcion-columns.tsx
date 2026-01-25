import { cn } from "@/lib/utils";
import { Inscripcion } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Inscripcion>[] = [
  {
    accessorKey: 'course',
    header: 'Curso',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.course?.name || '-'}</span>
          {row.original.course?.teacher?.name && (
            <span className="text-xs text-muted-foreground">
              Profesor: {row.original.course.teacher.name}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'price_charged',
    header: 'Precio cobrado',
    cell: ({ row }) => {
      const priceCharged = row.original.price_charged;
      const registrationPrice = row.original.registration_price;
      const coursePrice = row.original.course_price;
      if (!priceCharged) return '-';

      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">S/ {priceCharged.toFixed(2)}</span>
          {row.original.includes_registration && (
            <span className="text-xs text-muted-foreground">
              S/ {registrationPrice?.toFixed(2)} + S/ {coursePrice?.toFixed(2)}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'includes_registration',
    header: 'Incluye Matrícula',
    cell: ({ row }) => (
      <div>
        {row.original.includes_registration ? (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 font-medium text-green-700">
            Sí
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 font-medium text-gray-600">
            No
          </span>
        )}
      </div>
    ),
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
          <div><span className="font-medium">T: s/{total}</span>  <span className="text-xs text-muted-foreground">S: s/{saldo}</span></div>
          {payments.length > 0 ? (
            <div className="flex gap-px flex-wrap max-w-40">
              {payments.map((payment, index) => (
                <div key={`${payment.id}-${index}`} className={cn("flex items-center gap-px px-px rounded text-xs border-2", payment.payment_method === 'efectivo' ? 'border-green-500' : 'border-purple-500')}>
                  {payment.payment_amount}
                </div>
              ))}
            </div>
          ) : (
            <div>
              No hay pagos
            </div>
          )}
        </div>
      )
    }
  },
  // {
  //   accessorKey: 'payments',
  //   header: 'Pagos',
  //   cell: ({ row }) => {
  //     const payments = row.original.payments || [];
  //     const totalPagado = payments.reduce((sum, pago) => sum + (pago.amount || 0), 0);
  //     const precio = row.original.price_charged || 0;
  //     const pendiente = precio - totalPagado;

  //     return (
  //       <div className="flex flex-col text-sm">
  //         <span className="font-medium">
  //           {payments.length} {payments.length === 1 ? 'pago' : 'pagos'}
  //         </span>
  //         <span className="text-xs text-muted-foreground">
  //           Pagado: S/ {totalPagado.toFixed(2)}
  //         </span>
  //         {pendiente > 0 && (
  //           <span className="text-xs text-orange-600">
  //             Pendiente: S/ {pendiente.toFixed(2)}
  //           </span>
  //         )}
  //       </div>
  //     );
  //   }
  // },
  {
    accessorKey: 'assistances',
    header: 'Asistencias',
    cell: ({ row }) => {
      const assistances = row.original.assistances || [];
      const totalClases = row.original.course?.class_count || 0;
      const asistenciasRegistradas = assistances.length;

      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {asistenciasRegistradas} / {totalClases}
          </span>
          {totalClases > 0 && (
            <span className="text-xs text-muted-foreground">
              {((asistenciasRegistradas / totalClases) * 100).toFixed(0)}%
            </span>
          )}
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