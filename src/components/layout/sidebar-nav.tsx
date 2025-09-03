"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, History, LayoutDashboard, PlusCircle, Target, Car } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registrar", label: "Registrar Dia", icon: PlusCircle },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: BarChart },
  { href: "/gerenciamento", label: "Gerenciamento", icon: History },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Car className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-headline font-semibold text-primary">Rota Certa</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                    <item.icon />
                    <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            <AvatarImage src="https://picsum.photos/40/40" data-ai-hint="driver profile" alt="User avatar" />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Motorista</span>
            <span className="text-xs text-muted-foreground">motorista@email.com</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  )
}
