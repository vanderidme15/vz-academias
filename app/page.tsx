"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {

  return (
    <div className="">
      <section className="min-h-screen w-full flex flex-col justify-center gap-4 items-center mask-fade-bottom">
        <div className="w-full max-w-lg relative flex flex-col items-center justify-center h-2/3">
          ACADEMIAS
          <Button variant="link">
            <Link href="/iniciar-sesion">
              Iniciar Sesión
            </Link>
          </Button>
        </div>
      </section>

      <footer className="w-full">
      </footer>
    </div>
  )
}