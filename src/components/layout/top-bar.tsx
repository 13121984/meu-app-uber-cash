
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LayoutDashboard, PlusCircle, History, Target, BarChart, Wrench, Settings, LogOut, Calculator, Smartphone, LifeBuoy, Calendar, CalendarPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth-context"
import { Button } from "../ui/button"
import { AppLogo } from "../ui/app-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const menuItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  // O botão de registro foi movido para um Dropdown separado
  { href: "/gerenciamento", label: "Gerenciar", icon: History },
  { href: "/taximetro", label: "Taxímetro", icon: Calculator },
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function TopBar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
      setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  const showNavButtons = pathname !== '/';

  return (
    <TooltipProvider>
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center border-2 border-primary-foreground/50 shadow-md">
                       <AppLogo className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="sr-only">Rota Certa</span>
                </Link>
            </div>
            {isClient && (
                <nav className="flex items-center gap-1">
                    {showNavButtons && menuItems.map((item) => {
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
                     
                     {/* Botão de Registro com Dropdown */}
                    <DropdownMenu>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                     <button
                                        className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                            pathname.startsWith("/registrar") && "bg-primary text-primary-foreground"
                                        )}
                                        >
                                        <PlusCircle className="h-5 w-5" />
                                     </button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="center">
                                <p>Registrar Ganhos</p>
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Registrar um Período</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <Link href="/registrar/today" passHref>
                                <DropdownMenuItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Registrar Hoje</span>
                                </DropdownMenuItem>
                             </Link>
                             <Link href="/registrar/other-day" passHref>
                                <DropdownMenuItem>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    <span>Registrar Outro Dia</span>
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>

                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
