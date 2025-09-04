
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, BarChart, Settings, Wrench, History, Target, Car } from "lucide-react"
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

export function TopBar() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex flex-col items-center gap-1 font-semibold">
                    <Car className="h-7 w-7 text-primary" />
                    <span className="font-headline text-xs">Uber Cash</span>
                </Link>
            </div>
            <nav className="flex items-center gap-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                    <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                        <Link href={item.href} passHref>
                            <button
                            className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                isActive
                                ? "bg-primary/10 text-primary"
                                : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                            )}
                            >
                            <item.icon className="h-5 w-5" />
                            </button>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                        <p>{item.label}</p>
                        </TooltipContent>
                    </Tooltip>
                    )
                })}
            </nav>
        </header>
    </TooltipProvider>
  )
}
