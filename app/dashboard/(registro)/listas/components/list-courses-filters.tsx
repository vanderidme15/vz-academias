'use client'

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, SearchIcon, CalendarIcon, ClockIcon, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils";
import { formatTime, getShortDays } from "@/lib/utils-functions/format-date";
import { useHorariosStore } from "@/lib/store/configuraciones/horarios.store";

interface ListCoursesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedHorarioId: string | null;
  setSelectedHorarioId: (value: string | null) => void;
}

export default function ListCoursesFilters({
  searchTerm,
  setSearchTerm,
  selectedHorarioId,
  setSelectedHorarioId
}: ListCoursesFiltersProps) {
  const [openScheduleFilter, setOpenScheduleFilter] = useState(false)
  const { fetchHorarios, horarios } = useHorariosStore();

  useEffect(() => {
    fetchHorarios();
  }, []);

  const selectedHorario = horarios.find(h => h.id === selectedHorarioId);

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
                !selectedHorarioId && "text-muted-foreground"
              )}
            >
              <div className="truncate">
                {selectedHorario ? (
                  <div className="flex flex-col gap-1">
                    <p>{selectedHorario.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={12} /> {getShortDays(selectedHorario.days || [])}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon size={12} /> {formatTime(selectedHorario.start_time)} - {formatTime(selectedHorario.end_time)}
                      </div>
                    </div>
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
                  onSelect={() => { setSelectedHorarioId(null); setOpenScheduleFilter(false) }}
                  className={cn(
                    selectedHorarioId === null && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedHorarioId === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Todos los horarios
                </CommandItem>
                {horarios.map((horario) => (
                  <CommandItem
                    key={horario.id}
                    value={`${horario.id}-${horario.name}`}
                    onSelect={() => { setSelectedHorarioId(horario.id || null); setOpenScheduleFilter(false) }}
                    className={cn(
                      selectedHorarioId === horario.id && "bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedHorarioId === horario.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{horario.name}</span>
                      <div className="flex gap-1">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon size={12} /> {getShortDays(horario.days || [])}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon size={12} /> {formatTime(horario.start_time)} - {formatTime(horario.end_time)}
                        </p>
                      </div>
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
