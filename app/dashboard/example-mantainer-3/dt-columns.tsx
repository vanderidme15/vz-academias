import { Precio } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Precio>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
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
    accessorKey: 'price',
    header: 'Precio',
    cell: ({ row }) => (
      <div>
        S/ {row.original.price}
      </div>
    )
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.description}
      </div>
    )
  },
  {
    accessorKey: 'default',
    header: 'Default',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant='outline' className={row.original.default ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
          {row.original.default ? 'Por defecto' : '-'}
        </Badge>
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