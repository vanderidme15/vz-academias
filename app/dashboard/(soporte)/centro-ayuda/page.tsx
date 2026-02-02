"use client"

import { DownloadIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export default function CentroAyudaPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleDownloadPDF = async () => {
    try {
      const supabase = createClient();

      // Descarga el archivo desde Storage
      const { data, error } = await supabase.storage
        .from('academia')
        .download('manuals/manual-de_uso_vzacademy.pdf')

      if (error) {
        toast.error("Error al descargar el archivo");
        return;
      }

      // Crea una URL temporal para el blob
      const url = window.URL.createObjectURL(data);

      // Crea un link temporal y simula el click para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = 'manual-de_uso_vzacademy.pdf';
      document.body.appendChild(link);
      link.click();

      // Limpia
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Archivo descargado correctamente, revisa tus descargas");
    } catch (error) {
      toast.error("Error al descargar el archivo");
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold">Centro de Ayuda</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">Aqui puedes descargar el manual de usuario</p>
                <Button onClick={handleDownloadPDF}>
                  <DownloadIcon className="h-4 w-4" />
                  Descargar manual
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          {/* <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tutoriales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div> */}
          <div className="min-h-40 w-full p-4 md:p-12 flex flex-col items-center justify-center gap-4">
            <img src="/tutorial.svg" alt="" className="w-full" />
            <p className="font-bold md:text-lg text-center">Estamos trabajando en nuevo material, ¡pronto estara disponible!</p>
          </div>
        </div>
      </div>
    </div>
  )
}