'use client'

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, SearchIcon, CalendarIcon, ClockIcon, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils";
import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";
import { HorarioKey, HorarioOption } from "@/shared/types/ui.types";



interface ListCoursesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedHorarioKey: HorarioKey | null;
  setSelectedHorarioKey: (value: HorarioKey | null) => void;
  horariosUnicos: HorarioOption[];
}

export default function ListCoursesFilters({
  searchTerm,
  setSearchTerm,
  selectedHorarioKey,
  setSelectedHorarioKey,
  horariosUnicos,
}: ListCoursesFiltersProps) {
  const [openScheduleFilter, setOpenScheduleFilter] = useState(false)

  const selectedHorario = horariosUnicos.find(h => h.key === selectedHorarioKey) ?? null

  return (
    <div className="flex items-end gap-4 my-2">
      <div className="relative max-w-md h-fit">
        <Input
          placeholder="Buscar curso"
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="w-full lg:w-64">
        <Label htmlFor="horario" className="mb-1">Filtrar por horario</Label>
        <Popover open={openScheduleFilter} onOpenChange={setOpenScheduleFilter}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-full justify-between font-normal border text-sm flex items-center p-2 rounded-lg bg-card text-muted-foreground",
                !selectedHorarioKey && "text-muted-foreground"
              )}
            >
              <div className="truncate">
                {selectedHorario ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} /> {getShortDays(selectedHorario.days)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon size={12} /> {formatTime(selectedHorario.start_time)} - {formatTime(selectedHorario.end_time)}
                    </span>
                  </div>
                ) : "Todos los horarios"}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-full p-0" align="end">
            <Command>
              <CommandInput placeholder="Buscar horario..." />
              <CommandEmpty>No se encontraron horarios.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                <CommandItem
                  value="todos"
                  onSelect={() => { setSelectedHorarioKey(null); setOpenScheduleFilter(false) }}
                  className={cn(selectedHorarioKey === null && "bg-accent")}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedHorarioKey === null ? "opacity-100" : "opacity-0")} />
                  Todos los horarios
                </CommandItem>

                {horariosUnicos.map((horario) => (
                  <CommandItem
                    key={horario.key}
                    value={horario.label}
                    onSelect={() => { setSelectedHorarioKey(horario.key); setOpenScheduleFilter(false) }}
                    className={cn(selectedHorarioKey === horario.key && "bg-accent")}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedHorarioKey === horario.key ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarIcon size={12} /> {getShortDays(horario.days)}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ClockIcon size={12} /> {formatTime(horario.start_time)} - {formatTime(horario.end_time)}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
