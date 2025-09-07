
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, PlusCircle, History, Target, BarChart, Wrench, Settings, Car, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth-context"
import { Button } from "../ui/button"

const menuItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/registrar", label: "Registrar", icon: PlusCircle },
  { href: "/gerenciamento", label: "Gerenciar", icon: History },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: BarChart },
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function TopBar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
      setIsClient(true);
  }, []);


  return (
    <TooltipProvider>
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Car className="h-7 w-7 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="font-headline text-lg leading-tight">Rota Certa</span>
                    </div>
                </Link>
            </div>
            {isClient && (
                <nav className="flex items-center gap-1">
                    {menuItems.map((item) => {
                        const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                            <Link href={item.href} passHref>
                                <button
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                    isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={logout} className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sair</p>
                        </TooltipContent>
                    </Tooltip>
                </nav>
            )}
        </header>
    </TooltipProvider>
  )
}
