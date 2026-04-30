// gci-frontend/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CircleUser, Menu, LogOut, Settings } from 'lucide-react';
import Sidebar from './Sidebar';

// Função auxiliar para formatar a role para exibição
const formatRole = (role = '') => {
    return role
        .replace(/_/g, ' ') // Substitui underscores por espaços
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitaliza cada palavra
};

export default function Header() {
    const { user, logout } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 dark:bg-slate-950 dark:border-slate-800 sticky top-0 z-30">
            <div className="md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-64 dark:bg-slate-950 dark:border-r-slate-800">
                        <Sidebar onLinkClick={() => setIsSheetOpen(false)} forceExpanded={true} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="w-full flex-1"></div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-800">
                    <DropdownMenuLabel>
                        <p className="font-semibold truncate max-w-48">{user?.nome_completo || 'Nome do Usuário'}</p>
                        <p className="text-xs text-slate-500 font-normal">{formatRole(user?.role)}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <NavLink to="/configuracoes"><Settings className="mr-2 h-4 w-4" /><span>Configurações</span></NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/50 dark:focus:text-red-400">
                        <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}