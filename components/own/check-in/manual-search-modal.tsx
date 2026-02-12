"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, UserIcon, CalendarIcon, ClockIcon, Loader2 } from "lucide-react"
import { Inscripcion } from "@/shared/types/supabase.types"
import { formatTime, getShortDays } from "@/lib/utils-functions/format-date" // Necesitarás crear este hook
import { useDebounce } from "@/lib/hooks/use-debounce"

interface ManualSearchModalProps {
  open: boolean
  onClose: () => void
  onSelectInscripcion: (inscripcion: Inscripcion) => void
  onSearch: (searchTerm: string) => Promise<Inscripcion[]> // Nueva prop
}

export function ManualSearchModal({
  open,
  onClose,
  onSelectInscripcion,
  onSearch
}: ManualSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.trim().length === 0) {
        setInscripciones([])
        return
      }

      setIsLoading(true)
      try {
        const results = await onSearch(debouncedSearch)
        setInscripciones(results)
      } catch (error) {
        console.error('Error searching:', error)
        setInscripciones([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedSearch, onSearch])

  const handleSelectInscripcion = (inscripcion: Inscripcion) => {
    onSelectInscripcion(inscripcion)
    setSearchTerm("")
    setInscripciones([])
  }

  const handleClose = () => {
    setSearchTerm("")
    setInscripciones([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full md:w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Alumno</DialogTitle>
          <DialogDescription>
          </DialogDescription>
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
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" size={20} />
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {searchTerm.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <SearchIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p>Ingresa un nombre o DNI para buscar</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 size={48} className="mx-auto mb-2 opacity-50 animate-spin" />
              <p>Buscando...</p>
            </div>
          ) : inscripciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p>No se encontraron resultados</p>
            </div>
          ) : (
            inscripciones.map((inscripcion) => {
              const mesLabel = inscripcion.date_from && new Date(inscripcion.date_from).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
              return (
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
                        >
                          <div className="h-12 w-2 rounded" style={{ backgroundColor: inscripcion.course?.color }}></div>
                          <div className="flex-1">
                            <div className="border border-dashed border-amber-500 text-amber-500 rounded-full text-xs px-2 py-1 w-fit font-bold">{mesLabel}</div>
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
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
