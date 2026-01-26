"use client"

import * as React from "react"
import {
  BookAIcon,
  ClockIcon,
  GraduationCapIcon,
  HomeIcon,
  ListCheckIcon,
  PieChartIcon,
  SquarePenIcon,
  UsersIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavUser } from "./nav-user"
import { useAuth } from "@/lib/hooks/use-auth"
import Link from "next/link"
import { useAcademiaStore } from "@/lib/store/academia.store"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { academia } = useAcademiaStore();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GraduationCapIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{academia?.name}</span>
                <span className="truncate text-xs">{academia?.description}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Registro</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton tooltip="Dashboard">
                  <HomeIcon />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/matriculas">
                <SidebarMenuButton tooltip="Matriculas">
                  <SquarePenIcon />
                  <span>Matriculas</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/asistencia">
                <SidebarMenuButton tooltip="Asistencia">
                  <ListCheckIcon />
                  <span>Asistencia</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu> */}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Configuraciones</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/profesores">
                <SidebarMenuButton tooltip="Profesores">
                  <UsersIcon />
                  <span>Profesores</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/horarios">
                <SidebarMenuButton tooltip="Horarios">
                  <ClockIcon />
                  <span>Horarios</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/cursos">
                <SidebarMenuButton tooltip="Cursos">
                  <BookAIcon />
                  <span>Cursos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* <SidebarGroup>
          <SidebarGroupLabel>Reportes</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/reporte">
                <SidebarMenuButton tooltip="Reporte">
                  <PieChartIcon />
                  <span>Reporte general</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
