import { Horario } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Horario>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
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
    accessorKey: 'days',
    header: 'Dias',
    cell: ({ row }) => {
      const days = row.original.days?.join(', ') || '-';
      return (
        <div className="flex flex-col gap-1">
          {days}
        </div>
      );
    }
  },
  {
    accessorKey: 'start_time',
    header: 'Hora inicio',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.start_time}
      </div>
    )
  },
  {
    accessorKey: 'end_time',
    header: 'Hora fin',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.end_time}
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