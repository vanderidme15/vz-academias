"use client"

import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EraserIcon, EyeOffIcon } from "lucide-react"
import { type Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { flexRender } from "@tanstack/react-table"

interface DataTableHeaderProps<TData> {
  table: Table<TData>
}

export function DataTableHeader<TData>({ table }: DataTableHeaderProps<TData>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : (
                <div className="flex items-center">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <div className={cn("flex items-center space-x-2")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-8 data-[state=open]:bg-accent"
                          >
                            {header.column.getIsSorted() === "desc" ? (
                              <ArrowDownIcon className="h-3 w-3" />
                            ) : header.column.getIsSorted() === "asc" ? (
                              <ArrowUpIcon className="h-3 w-3" />
                            ) : (
                              <ChevronsUpDownIcon className="h-3 w-3" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => header.column.toggleSorting(false)}>
                            <ArrowUpIcon className="h-3 w-3 text-muted-foreground/70" />
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => header.column.toggleSorting(true)}>
                            <ArrowDownIcon className="h-3 w-3 text-muted-foreground/70" />
                            Desc
                          </DropdownMenuItem>
                          {header.column.getIsSorted() && (
                            <DropdownMenuItem onClick={() => header.column.clearSorting()}>
                              <EraserIcon className="h-3 w-3 text-muted-foreground/70" />
                              Limpiar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => header.column.toggleVisibility(false)}>
                            <EyeOffIcon className="h-3 w-3 text-muted-foreground/70" />
                            Ocultar columna
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}
