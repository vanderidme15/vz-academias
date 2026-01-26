import { formatDateTime } from "@/lib/utils-functions/format-date";
import { Curso } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Curso>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name || '-'}</span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          )}
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
    accessorKey: 'teacher',
    header: 'Profesor',
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.original.teacher?.name || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'schedule',
    header: 'Horario',
    cell: ({ row }) => {
      const horario = row.original.schedule;

      if (!horario) return '-';

      return (
        <>
          {/* Ajusta según las propiedades de tu tipo Horario */}
          {horario.days && horario.start_time && horario.end_time
            ? (
              <div className="flex flex-col">
                <span className="text-sm">{horario.name}</span>
                <span className="text-xs text-muted-foreground">{horario.days.join(', ')}</span>
                <span className="text-xs text-muted-foreground">{horario.start_time} - {horario.end_time}</span>
              </div>
            )
            : '-'
          }
        </>
      );
    }
  },
  {
    accessorKey: 'class_count',
    header: 'Clases Base',
    cell: ({ row }) => (
      <div className="text-sm text-center">
        {row.original.class_count ?? '-'}
      </div>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Precio Base',
    cell: ({ row }) => {
      const price = row.original.price;
      if (!price) return '-';

      return (
        <div className="text-sm font-medium">
          S/ {price.toFixed(2)}
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
        return (
          <div className="text-xs text-muted-foreground">
            {formatDateTime(row.original.created_at)}
          </div>
        );
      } catch {
        return '-';
      }
    }
  },
  {
    accessorKey: 'updated_at',
    header: 'Actualizado',
    cell: ({ row }) => {
      if (!row.original.updated_at) return '-';
      try {
        return (
          <div className="text-xs text-muted-foreground">
            {formatDateTime(row.original.updated_at)}
          </div>
        );
      } catch {
        return '-';
      }
    }
  },
]