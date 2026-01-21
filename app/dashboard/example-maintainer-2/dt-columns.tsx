import { Inscripcion } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, CheckIcon, XCircle, XIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Inscripcion>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.is_active ? (
          <div className="h-2 w-2 border rounded-full bg-green-500"></div>
        ) : (
          <div className="h-2 w-2 border rounded-full bg-red-500"></div>
        )}
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_under_18 && (
            <span className="text-xs text-muted-foreground">
              Menor de edad
            </span>
          )}
          <div className="text-xs text-muted-foreground italic">
            {row.original.dni} - {row.original.gender}
          </div>
        </div>
      </div>
    ),
    meta: {
      filterable: {
        type: 'text',
        placeholder: '',
        label: 'Buscar por nombre'
      }
    }
  },
  {
    accessorKey: 'age',
    header: 'Edad',
    cell: ({ row }) => (
      <div>
        {row.original.age} años
      </div>
    ),
    meta: {
      visible: false
    }
  },
  {
    accessorKey: 'cellphone_number',
    header: 'Celular',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.cellphone_number && (
          <span className="text-sm">{row.original.cellphone_number}</span>
        )}
        {row.original.is_under_18 && row.original.parent_cellphone_number && (
          <span className="text-xs text-muted-foreground">
            Tutor: {row.original.parent_cellphone_number}
          </span>
        )}
      </div>
    ),
    meta: {
      visible: false,
    }
  },
  {
    accessorKey: 'price_id',
    header: 'Precio',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>S/ {row.original.price_amount}</span>
        <span className="text-xs text-muted-foreground">({row.original.price_name})</span>
      </div>
    )
  },
  {
    accessorKey: 'payments',
    accessorFn: (row) => row.payments,
    header: 'Pagos',
    cell: ({ row }) => {
      const payments = row.original.payments ?? []
      const total = payments.reduce((total, payment) => total + (payment.payment_amount || 0), 0)
      const saldo = (row.original.price_amount || 0) - total
      return (
        <div>
          <div><span className="font-medium">T: s/{total}</span>  <span className="text-xs text-muted-foreground">S: s/{saldo}</span></div>
          {payments.length > 0 ? (
            <div className="flex gap-px flex-wrap max-w-40">
              {payments.map((payment, index) => (
                <div key={`${payment.id}-${index}`} className={cn("flex items-center gap-px px-px rounded text-xs border-2", payment.payment_method === 'efectivo' ? 'border-green-500' : 'border-purple-500')}>
                  {payment.payment_amount}
                  {payment.payment_checked ? <CheckIcon className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
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
  {
    accessorKey: 'height',
    header: 'Talla',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span>{row.original.height}cm</span>
        <span className="text-muted-foreground">Polo: {row.original.shirt_size}</span>
      </div>
    ),
  },
  {
    accessorKey: 'observations',
    header: 'Observaciones',
    cell: ({ row }) => (
      <div>
        {row.original.observations}
      </div>
    ),
    meta: {
      visible: false,
    }
  },

  {
    accessorKey: 'register_by',
    header: 'Registrado por',
    cell: ({ row }) => (
      <div>
        {row.original.register_by}
      </div>
    )
  },
  {
    accessorKey: 'check_in',
    header: 'Check-in',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.check_in ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Check-in</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Pendiente</span>
          </div>
        )}
      </div>
    ),
    meta: {
      filterable: {
        type: 'select',
        options: [
          { label: 'Check-in', value: true },
          { label: 'Pendiente', value: false }
        ],
        label: 'Check-in',
        placeholder: 'Check-in'
      }
    },
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
      visible: false,
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
      visible: false,
    }
  },
]