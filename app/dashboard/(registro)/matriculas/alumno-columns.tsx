import { Alumno } from "@/shared/types/supabase.types";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Alumno>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
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
      <div className="flex flex-col gap-1">
        {row.original.age}
      </div>
    )
  },
  {
    accessorKey: 'cellphone',
    header: 'Celular',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.cellphone && (
          <span className="text-sm">{row.original.cellphone}</span>
        )}
        {row.original.is_under_18 && row.original.parent_cellphone && (
          <span className="text-xs text-muted-foreground">
            Tutor: {row.original.parent_name} - {row.original.parent_cellphone}
          </span>
        )}
      </div>
    )
  },
  {
    accessorKey: 'address',
    header: 'Dirección',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.address}
      </div>
    )
  },
  {
    accessorKey: 'school_name',
    header: 'Institución educativa',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.school_name}
      </div>
    )
  },
  {
    accessorKey: 'has_materials',
    header: 'Tiene materiales',
    cell: ({ row }) => {
      const hasMaterials = row.original.has_materials;
      let materialsDescription = '';


      if (!hasMaterials) {
        materialsDescription = 'No';
      } else {
        materialsDescription = row.original.materials_description ? row.original.materials_description : "";
      }
      return (
        <div className="flex flex-col gap-1 text-xs">
          {materialsDescription}
        </div>
      );
    }
  },
  {
    accessorKey: 'observations',
    header: 'Observaciones',
    cell: ({ row }) => {
      if (!row.original.observations) return 'no hay observaciones';
      return (
        <div className="flex flex-col gap-1 text-xs">
          {row.original.observations}
        </div>
      );
    }
  },
  {
    accessorKey: 'register_by',
    header: 'Registrado por',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.register_by}
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