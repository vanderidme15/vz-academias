import { Asistencia } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CheckIcon, XIcon } from "lucide-react";
import { formatDateTime } from "@/lib/utils-functions/format-date";

export const columns: ColumnDef<Asistencia>[] = [
  {
    accessorKey: 'date_time',
    header: 'Fecha',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{formatDateTime(row.original.date_time)}</span>
      </div>
    )
  },
  {
    accessorKey: 'own_check',
    header: 'Propio',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant='outline' className={row.original.own_check ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
          {row.original.own_check ? <CheckIcon /> : <XIcon />}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'admin_check',
    header: 'Admin',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant='outline' className={row.original.admin_check ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}>
          {row.original.admin_check ? <CheckIcon /> : <XIcon />}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'observations',
    header: 'Observaciones',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span>{row.original.observations}</span>
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