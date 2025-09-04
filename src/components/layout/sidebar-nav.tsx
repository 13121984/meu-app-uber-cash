
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, BarChart, Settings, Wrench, History, Target } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import { Car } from 'lucide-react';
import { Button } from "../ui/button"

const menuItems = [
  { href: "/", label: "Painel de Controle", icon: LayoutDashboard },
  { href: "/registrar", label: "Registrar Ganhos", icon: PlusCircle },
  { href: "/gerenciamento", label: "Gerenciar Ganhos", icon: History },
  { href: "/metas", label: "Planejamento", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: BarChart },
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();


  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Car className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-headline font-semibold text-foreground">Uber Cash</h1>
            
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  as="a"
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary/10 hover:text-foreground",
                    "justify-start"
                  )}
                >
                    <item.icon />
                    <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}
