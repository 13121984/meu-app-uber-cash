
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LayoutDashboard, PlusCircle, History, Target, BarChart, Wrench, Settings, LogOut, Calculator, Smartphone, LifeBuoy, Calendar, CalendarPlus, DollarSign } from "lucide-react"
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
  { href: "/", label: "Início", icon: Home, showOnHome: true, showOnOthers: true },
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, showOnHome: false, showOnOthers: true },
  // Botão de registro será inserido dinamicamente
  { href: "/gerenciamento", label: "Gerenciar", icon: History, showOnHome: false, showOnOthers: true },
  { href: "/taximetro", label: "Taxímetro", icon: Calculator, showOnHome: false, showOnOthers: true },
  { href: "/manutencao", label: "Manutenção", icon: Wrench, showOnHome: false, showOnOthers: true },
  { href: "/metas", label: "Metas", icon: Target, showOnHome: false, showOnOthers: true },
  { href: "/configuracoes", label: "Configurações", icon: Settings, showOnHome: false, showOnOthers: true },
  { href: "/ajuda", label: "Ajuda", icon: LifeBuoy, showOnHome: true, showOnOthers: false },
]

const RegisterDropdown = () => (
    <DropdownMenu>
         <Tooltip>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                     <button
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            usePathname().startsWith("/registrar") && "bg-primary text-primary-foreground"
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
            <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500"/>
                    <span>Registrar Receitas</span>
                </div>
            </DropdownMenuLabel>
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
);

const NavButton = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const pathname = usePathname();
    const isActive = href === "/" ? pathname === href : pathname.startsWith(href);
    return (
        <Tooltip>
            <TooltipTrigger asChild>
            <Link href={href} passHref>
                <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                    isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                >
                <Icon className="h-5 w-5" />
                </button>
            </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
            <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    )
};


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

  const isHomePage = pathname === '/';

  const itemsToRender = isHomePage 
    ? menuItems.filter(item => item.showOnHome)
    : menuItems.filter(item => item.showOnOthers);

  return (
    <TooltipProvider>
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center border-2 border-primary-foreground/50 shadow-md">
                       <AppLogo className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="sr-only">Uber Cash</span>
                </Link>
            </div>
            {isClient && (
                <nav className="flex items-center gap-1">
                    {itemsToRender.map((item, index) => (
                        <React.Fragment key={item.href}>
                             {/* Insere o botão de registro após o Dashboard em outras páginas */}
                             {!isHomePage && index === 1 && <RegisterDropdown />}
                             <NavButton {...item} />
                        </React.Fragment>
                    ))}
                     
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
