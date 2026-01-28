// components/own/check-in/manual-search-modal.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, UserIcon, CalendarIcon, ClockIcon } from "lucide-react"
import { Inscripcion } from "@/shared/types/supabase.types"
import { formatDate, formatTime, getShortDays } from "@/lib/utils-functions/format-date"

interface ManualSearchModalProps {
  open: boolean
  onClose: () => void
  inscripciones: Inscripcion[]
  onSelectInscripcion: (inscripcion: Inscripcion) => void
}

export function ManualSearchModal({
  open,
  onClose,
  inscripciones,
  onSelectInscripcion
}: ManualSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInscripciones = inscripciones.filter((inscripcion) => {
    const student = inscripcion.student
    if (!student) return false

    const searchLower = searchTerm.toLowerCase()
    const matchesName = student.name?.toLowerCase().includes(searchLower)
    const matchesDni = student.dni?.toLowerCase().includes(searchLower)

    return matchesName || matchesDni
  })

  const handleSelectInscripcion = (inscripcion: Inscripcion) => {
    onSelectInscripcion(inscripcion)
    setSearchTerm("")
  }

  const handleClose = () => {
    setSearchTerm("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Alumno</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {searchTerm.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <SearchIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p>Ingresa un nombre o DNI para buscar</p>
            </div>
          ) : filteredInscripciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p>No se encontraron resultados</p>
            </div>
          ) : (
            filteredInscripciones.map((inscripcion) => (
              <div
                key={inscripcion.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon size={16} className="text-muted-foreground" />
                      <p className="font-bold">{inscripcion.student?.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      DNI: {inscripcion.student?.dni || "No registrado"}
                    </p>

                    <div className="space-y-2">
                      <div
                        className="flex gap-2 items-center p-3 bg-muted rounded-lg"
                        style={{
                          borderLeft: `4px solid ${inscripcion.course?.color || "#ccc"}`
                        }}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {inscripcion.course?.name}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={12} />
                              {getShortDays(inscripcion.course?.schedule?.days || [])}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon size={12} />
                              {formatTime(inscripcion.course?.schedule?.start_time)} -{" "}
                              {formatTime(inscripcion.course?.schedule?.end_time)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Clases: {inscripcion.class_count || 0} / {inscripcion.total_classes || 0}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectInscripcion(inscripcion)}
                        >
                          Registrar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}