
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, BarChart, Settings, Wrench, History, Target, Car } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

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
      <div className="fixed top-1/2 -translate-y-1/2 left-4 z-50">
        <div className="flex flex-col items-center gap-4 rounded-full border bg-background/70 p-2 shadow-lg backdrop-blur-md">
          <div className="p-2">
            <Car className="h-8 w-8 text-primary" />
          </div>
          <Separator />
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
                <TooltipContent side="right" align="center">
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
