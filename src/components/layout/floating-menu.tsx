
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, BarChart, Settings, Wrench, History, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const menuItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/registrar", label: "Registrar", icon: PlusCircle },
  { href: "/gerenciamento", label: "Gerenciar", icon: History },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: BarChart },
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function FloatingMenu() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-50">
        <div className="flex items-center gap-2 rounded-full border bg-background/70 p-2 shadow-lg backdrop-blur-md">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href} passHref>
                    <button
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                    </button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
