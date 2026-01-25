import { formatDate } from "@/lib/utils-functions/format-date";
import { Periodo } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Periodo>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.description}</span>
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
    accessorKey: 'start_date',
    header: 'Fecha inicio',
    cell: ({ row }) => {
      const startDate = formatDate(row.original.start_date);
      return (
        <div className="flex flex-col gap-1">
          {startDate}
        </div>
      );
    }
  },
  {
    accessorKey: 'end_date',
    header: 'Fecha fin',
    cell: ({ row }) => {
      const endDate = formatDate(row.original.end_date);
      return (
        <div className="flex flex-col gap-1">
          {endDate}
        </div>
      );
    }
  },
  {
    accessorKey: 'is_active',
    header: 'Activo',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.is_active ? 'Sí' : 'No'}
      </div>
    )
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