"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL_VALUE = "__all__"

interface DataTableFiltersProps<TData> {
  table: Table<TData>
}

export function DataTableFilters<TData>({
  table,
}: DataTableFiltersProps<TData>) {
  return (
    <div className="flex flex-wrap gap-4">
      {table
        .getAllColumns()
        .filter(
          (column) =>
            column.getCanFilter() &&
            column.columnDef.meta?.filterable
        )
        .map((column) => {
          const filter = column.columnDef.meta!.filterable

          // 🔤 Text filter
          if (filter?.type === "text") {
            return (
              <FilterItem
                key={column.id}
                label={filter.label}
              >
                <Input
                  className="w-[200px]"
                  placeholder={filter.placeholder ?? "Buscar..."}
                  value={(column.getFilterValue() as string) ?? ""}
                  onChange={(e) =>
                    column.setFilterValue(
                      e.target.value || undefined
                    )
                  }
                />
              </FilterItem>
            )
          }

          // 🔽 Select filter
          if (filter?.type === "select") {
            const value =
              column.getFilterValue() === undefined
                ? ALL_VALUE
                : JSON.stringify(column.getFilterValue())

            return (
              <FilterItem
                key={column.id}
                label={filter.label}
              >
                <Select
                  value={value}
                  onValueChange={(v) => {
                    if (v === ALL_VALUE) {
                      column.setFilterValue(undefined)
                    } else {
                      column.setFilterValue(JSON.parse(v))
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue
                      placeholder={filter.placeholder ?? "Seleccionar"}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>
                      Todos
                    </SelectItem>

                    {filter.options.map((opt) => (
                      <SelectItem
                        key={opt.label}
                        value={JSON.stringify(opt.value)}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterItem>
            )
          }

          return null
        })}
    </div>
  )
}

function FilterItem({
  label,
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}
