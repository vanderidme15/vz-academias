"use client"

import {
  BrushIcon,
  ChevronsUpDown,
  LockIcon,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useAuthStore } from "@/lib/store/auth.store"
import { getClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Usuario } from "@/shared/types/supabase.types"
import PasswordChange from "./password-change"
import { useState } from "react"

export function NavUser({ user }: { user: Usuario | null }) {
  const router = useRouter()
  const { isMobile } = useSidebar();
  const { logout } = useAuthStore();
  const [openPasswordChange, setOpenPasswordChange] = useState(false);

  const handleLogout = async () => {
    const supabase = getClient()
    await supabase.auth.signOut()
    logout()
    router.push("/")
  }

  const handlePasswordChangeClick = (e: Event) => {
    e.preventDefault(); // Prevenir comportamiento por defecto
    setOpenPasswordChange(true);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{user?.email?.split("@")[0].slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{user?.email?.split("@")[0].slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/academia">
                  <BrushIcon />
                  Personalizar academia
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handlePasswordChangeClick}>
                <LockIcon />
                Cambiar contraseña
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <PasswordChange open={openPasswordChange} setOpen={setOpenPasswordChange} />
    </>
  )
}