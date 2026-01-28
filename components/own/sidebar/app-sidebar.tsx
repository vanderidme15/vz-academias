"use client"

import * as React from "react"
import {
  BookAIcon,
  ChartColumnBigIcon,
  ClockIcon,
  GraduationCapIcon,
  HeadsetIcon,
  HomeIcon,
  ListCheckIcon,
  PieChartIcon,
  PiggyBankIcon,
  SquarePenIcon,
  TrelloIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { academia } = useAcademiaStore();

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square items-center justify-center">
                <Avatar className="size-12">
                  <AvatarImage src={academia?.logo_url} />
                  <AvatarFallback>
                    <GraduationCapIcon size={20} />
                  </AvatarFallback>
                </Avatar>
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
        <SidebarGroup>
          <SidebarGroupLabel>Reportes</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/reporte-asistencia">
                <SidebarMenuButton tooltip="Reporte">
                  <ChartColumnBigIcon />
                  <span>Reporte de asistencia</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/reporte-pagos">
                <SidebarMenuButton tooltip="Reporte">
                  <PiggyBankIcon />
                  <span>Reporte de pagos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Soporte</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/centro-ayuda">
                <SidebarMenuButton tooltip="Centro de ayuda">
                  <HeadsetIcon />
                  <span>Centro de ayuda</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
