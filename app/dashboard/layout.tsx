"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/own/sidebar/app-sidebar"
import { DynamicBreadcrumb } from "@/components/own/dynamic-breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/hooks/use-auth"
import { useAcademiaStore } from "@/lib/store/academia.store"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();
  const { fetchAcademiaById } = useAcademiaStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/iniciar-sesion")
    }
  }, [isLoading, isAuthenticated, router])

  // pedir de primeras tambien a la academia
  useEffect(() => {
    if (user?.id) {
      fetchAcademiaById(user.academy_id)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <div>no autenticado</div>
  }

  return (

    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex pt-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="h-[calc(100vh-4rem)] w-full bg-background flex flex-col px-4 py-2 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
