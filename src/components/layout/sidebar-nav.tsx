
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, BarChart, Settings, Wrench, History, Target, Presentation, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Car } from 'lucide-react';


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
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Car className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-headline font-semibold text-foreground">Uber Cash</h1>
            <p className="text-xs text-muted-foreground">Controle</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {menuItems.map((item, index) => (
             <SidebarMenuItem key={item.href}>
              {index === 1 && <p className="px-2 py-1 text-xs text-muted-foreground">Apresentação</p>}
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
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
