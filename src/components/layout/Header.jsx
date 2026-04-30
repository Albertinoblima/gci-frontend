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
import gciLogo from '@/assets/logo-gci-completo.png';

const formatRole = (role = '') =>
    role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function Header() {
    const { user, logout } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <header className="flex h-[60px] shrink-0 items-center gap-4 px-4 lg:px-6 sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-md">

            {/* ── Logo + nome — sempre visível ── */}
            <NavLink to="/dashboard" className="flex items-center gap-3 shrink-0">
                <img src={gciLogo} alt="GCI" className="h-8 w-auto brightness-0 invert" />
                <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-sm font-bold text-white tracking-tight">Sistema GCI</span>
                    <span className="text-[10px] text-slate-400 font-normal tracking-wider uppercase">Gestão Cidadã Integrada</span>
                </div>
            </NavLink>

            {/* ── Separador ── */}
            <div className="hidden md:block h-6 w-px bg-slate-700 mx-1" />

            {/* ── Espaço central ── */}
            <div className="flex-1" />

            {/* ── Nome do usuário ── */}
            <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-sm font-medium text-slate-100 leading-tight">
                    {user?.nome_completo || 'Usuário'}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight">
                    {formatRole(user?.role)}
                </span>
            </div>

            {/* ── Avatar / menu ── */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 shrink-0 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700">
                        <CircleUser className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 min-w-48">
                    <DropdownMenuLabel>
                        <p className="font-semibold truncate text-white">{user?.nome_completo || 'Nome do Usuário'}</p>
                        <p className="text-xs text-slate-400 font-normal">{formatRole(user?.role)}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800 focus:text-white">
                        <NavLink to="/configuracoes">
                            <Settings className="mr-2 h-4 w-4" /><span>Configurações</span>
                        </NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                        onClick={logout}
                        className="text-red-400 focus:bg-red-950 focus:text-red-400"
                    >
                        <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ── Hambúrguer mobile ── */}
            <div className="md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-300 hover:text-white hover:bg-slate-700">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
                        <Sidebar onLinkClick={() => setIsSheetOpen(false)} forceExpanded={true} />
                    </SheetContent>
                </Sheet>
            </div>

        </header>
    );
}