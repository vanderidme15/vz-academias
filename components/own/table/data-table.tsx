"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";


import {
  EllipsisVerticalIcon,
  PenIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableHeader } from "./data-table-header"
import { DataTableFilters } from "./data-table-filters"

import type { DialogHandlers, ExtraAction } from "@/shared/types/ui.types"

type TextFilter = {
  type: "text"
  label?: string
  placeholder?: string
}

type SelectFilterOption = {
  label: string
  value: any
}

type SelectFilter = {
  type: "select"
  label?: string
  placeholder?: string
  options: SelectFilterOption[]
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    /**
     * Visible por defecto en la tabla
     */
    visible?: boolean

    /**
     * Configuración de filtro por columna
     */
    filterable?: TextFilter | SelectFilter
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  entity?: string
  dialogHandlers: DialogHandlers
  extraActions?: ExtraAction[]
  extraActionsBuilder?: (row: TData) => ExtraAction[]
  disableDelete?: boolean
  disableEdit?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  entity,
  dialogHandlers,
  extraActions,
  extraActionsBuilder,
  disableDelete,
  disableEdit,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  /**
   * 🔹 Visibilidad inicial desde meta.visible
   */
  const initialVisibility = useMemo<VisibilityState>(() => {
    return Object.fromEntries(
      columns.map((col) => {
        // TanStack Table usa 'accessorKey' o 'id' como identificador
        const columnId = col.id ?? (col as any).accessorKey ?? '';
        return [columnId, col.meta?.visible ?? true];
      })
    )
  }, [columns])

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialVisibility)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      {/* 🔍 Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <DataTableFilters table={table} />

        <div className="flex gap-2">
          <Button
            onClick={() => {
              dialogHandlers.setSelectedItem(null)
              dialogHandlers.setOpenDialog(true)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {entity}
          </Button>

          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* 📋 Tabla */}
      <div className="relative flex-1 overflow-auto rounded-md border">
        <Table>
          <DataTableHeader table={table} />

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <ContextMenu key={row.id} modal={false}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}

                        {/* ⚙️ Acciones */}
                        <TableCell className="w-[40px]">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              {extraActions?.map((action) => (
                                <DropdownMenuItem
                                  key={action.label}
                                  onClick={() => action.handler(row.original)}
                                  variant={action.variant}
                                >
                                  <action.icon className="h-4 w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}

                              {extraActionsBuilder?.(row.original).map((action) => (
                                <DropdownMenuItem
                                  key={action.label}
                                  onClick={() => action.handler(row.original)}
                                  variant={action.variant}
                                >
                                  <action.icon className="h-4 w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                              {!disableEdit && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    dialogHandlers.setSelectedItem(row.original)
                                    dialogHandlers.setOpenDialog(true)
                                  }}
                                >
                                  <PenIcon className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {!disableDelete && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    dialogHandlers.setSelectedItem(row.original)
                                    dialogHandlers.setOpenDialogDelete(true)
                                  }}
                                  variant="destructive"
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {extraActions?.map((action) => (
                        <ContextMenuItem
                          key={action.label}
                          onClick={() => action.handler(row.original)}
                          variant={action.variant}
                        >
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </ContextMenuItem>
                      ))}

                      {extraActionsBuilder?.(row.original).map((action) => (
                        <ContextMenuItem
                          key={action.label}
                          onClick={() => action.handler(row.original)}
                          variant={action.variant}
                        >
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </ContextMenuItem>
                      ))}
                      {!disableEdit && (
                        <ContextMenuItem
                          onClick={() => {
                            dialogHandlers.setSelectedItem(row.original)
                            dialogHandlers.setOpenDialog(true)
                          }}
                        >
                          <PenIcon className="h-4 w-4" />
                          Editar
                        </ContextMenuItem>
                      )}
                      {!disableDelete && (
                        <ContextMenuItem
                          onClick={() => {
                            dialogHandlers.setSelectedItem(row.original)
                            dialogHandlers.setOpenDialogDelete(true)
                          }}
                          variant="destructive"
                        >
                          <Trash2Icon className="h-4 w-4" />
                          Eliminar
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📄 Paginación */}
      <DataTablePagination table={table} />
    </div>
  )
}
