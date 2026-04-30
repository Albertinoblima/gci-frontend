// gci-frontend/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CircleUser, Menu, LogOut, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Sidebar from './Sidebar';
import gciLogo from '@/assets/logo-gci-completo.png';

const formatRole = (role = '') =>
    role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function Header() {
    const { user, logout } = useAuth();
    const { collapsed, toggle } = useSidebar();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <header className="flex h-[60px] shrink-0 items-center gap-3 border-b bg-white px-4 lg:px-6 dark:bg-slate-950 dark:border-slate-800 sticky top-0 z-30 shadow-sm">

            {/* ── Toggle sidebar — apenas desktop ── */}
            <button
                onClick={toggle}
                className="hidden md:flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors duration-150"
                aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
                {collapsed
                    ? <PanelLeftOpen className="h-5 w-5" />
                    : <PanelLeftClose className="h-5 w-5" />}
            </button>

            {/* ── Logo + nome — visível sempre ── */}
            <NavLink to="/dashboard" className="flex items-center gap-2.5">
                <img src={gciLogo} alt="GCI" className="h-7 w-auto" />
                <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                    Sistema GCI
                </span>
            </NavLink>

            {/* ── Separador vertical ── */}
            <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* ── Espaço central ── */}
            <div className="flex-1" />

            {/* ── Nome do usuário — visível em telas médias+ ── */}
            <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">
                    {user?.nome_completo || 'Usuário'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                    {formatRole(user?.role)}
                </span>
            </div>

            {/* ── Avatar / menu do usuário ── */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 shrink-0">
                        <CircleUser className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-800 min-w-48">
                    <DropdownMenuLabel>
                        <p className="font-semibold truncate">{user?.nome_completo || 'Nome do Usuário'}</p>
                        <p className="text-xs text-slate-500 font-normal">{formatRole(user?.role)}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <NavLink to="/configuracoes">
                            <Settings className="mr-2 h-4 w-4" /><span>Configurações</span>
                        </NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={logout}
                        className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                    >
                        <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ── Hambúrguer — apenas mobile ── */}
            <div className="md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-64 dark:bg-slate-950 dark:border-r-slate-800">
                        <Sidebar onLinkClick={() => setIsSheetOpen(false)} forceExpanded={true} />
                    </SheetContent>
                </Sheet>
            </div>

        </header>
    );
}