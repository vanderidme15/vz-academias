import { Pago } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";

export const columns: ColumnDef<Pago>[] = [
  {
    accessorKey: 'payment_amount',
    header: 'Monto',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.payment_amount}</span>
      </div>
    )
  },
  {
    accessorKey: 'payment_method',
    header: 'Método',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant='outline' className={row.original.payment_method === 'yape' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'}>
          {row.original.payment_method === 'yape' ? '📱 Yape' : '💵 Efectivo'}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'payment_code',
    header: 'Código',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.payment_code}</span>
      </div>
    ),
  },
  {
    accessorKey: 'register_by',
    header: 'Registrado por',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.register_by}</span>
      </div>
    ),
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