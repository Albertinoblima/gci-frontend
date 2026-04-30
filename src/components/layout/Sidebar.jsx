// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

import {
    LayoutDashboard, MessageSquare, Building, Users,
    HeartPulse, School, ClipboardList, Stethoscope, Hospital,
    User, Calendar, UserCircle,
    Settings, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

// ─── NavItem ────────────────────────────────────────────────────────────────
const NavItem = ({ to, icon: Icon, children, collapsed }) => {
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

    const baseClass = cn(
        'group flex items-center rounded-lg transition-all duration-150',
        'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        isActive && 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-950',
        collapsed ? 'justify-center p-2.5 w-10 h-10' : 'gap-3 px-3 py-2 w-full'
    );

    const content = (
        <NavLink to={to} className={baseClass}>
            <Icon className={cn(
                'shrink-0 transition-colors duration-150',
                collapsed ? 'h-5 w-5' : 'h-4 w-4',
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
            )} />
            {!collapsed && (
                <span className="truncate text-sm">{children}</span>
            )}
        </NavLink>
    );

    if (collapsed) {
        return (
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {children}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
};

// ─── NavGroupLabel ───────────────────────────────────────────────────────────
const NavGroupLabel = ({ children, collapsed }) => {
    if (collapsed) {
        return <div className="my-2 h-px bg-slate-200 dark:bg-slate-800 w-8" />;
    }
    return (
        <p className="mt-4 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">
            {children}
        </p>
    );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function Sidebar({ onLinkClick, forceExpanded = false }) {
    const { user } = useAuth();
    const { collapsed, toggle } = useSidebar();

    const isExpanded = forceExpanded || !collapsed;

    const isAdminSistema = user?.role === 'admin_sistema';
    const isAdminMunicipio = user?.role === 'admin_municipio';
    const isGestorSecretaria = user?.role === 'gestor_secretaria';
    const isAgenteSaude = user?.role === 'agente_saude';
    const isAgenteEducacao = user?.role === 'agente_educacao';

    const handleClick = () => { if (onLinkClick) onLinkClick(); };

    return (
        <TooltipProvider>
            <aside
                className={cn(
                    'flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800',
                    'transition-all duration-300 ease-in-out overflow-hidden',
                    isExpanded ? 'w-64' : 'w-[60px]'
                )}
            >
                {/* ── Toggle ── */}
                {!forceExpanded && (
                    <div className={cn(
                        'flex shrink-0 items-center border-b border-slate-200 dark:border-slate-800 h-[60px]',
                        isExpanded ? 'justify-end px-3' : 'justify-center'
                    )}>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggle}
                                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors duration-150"
                                    aria-label={isExpanded ? 'Recolher menu' : 'Expandir menu'}
                                >
                                    {isExpanded
                                        ? <PanelLeftClose className="h-5 w-5" />
                                        : <PanelLeftOpen className="h-5 w-5" />
                                    }
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {isExpanded ? 'Recolher menu' : 'Expandir menu'}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {/* ── Nav ── */}
                <div className={cn(
                    'flex-1 overflow-y-auto overflow-x-hidden py-3',
                    isExpanded ? 'px-3' : 'px-2 flex flex-col items-center'
                )}>
                    <nav className={cn('flex flex-col gap-0.5', !isExpanded && 'items-center w-full')}>

                        <NavItem to="/dashboard" icon={LayoutDashboard} collapsed={!isExpanded}>Dashboard</NavItem>
                        <NavItem to="/chat" icon={MessageSquare} collapsed={!isExpanded}>Atendimentos</NavItem>
                        <NavItem to="/cidadaos" icon={UserCircle} collapsed={!isExpanded}>Cidadãos</NavItem>

                        {(isAdminSistema || isAdminMunicipio || isAgenteSaude) && (
                            <>
                                <NavGroupLabel collapsed={!isExpanded}>Saúde</NavGroupLabel>
                                {(isAdminSistema || isAdminMunicipio) && <NavItem to="/saude/profissionais" icon={User} collapsed={!isExpanded}>Profissionais</NavItem>}
                                {(isAdminSistema || isAdminMunicipio) && <NavItem to="/saude/unidades" icon={Hospital} collapsed={!isExpanded}>Unidades</NavItem>}
                                {(isAdminSistema || isAdminMunicipio) && <NavItem to="/saude/especialidades" icon={Stethoscope} collapsed={!isExpanded}>Especialidades</NavItem>}
                                <NavItem to="/saude/agendamentos" icon={HeartPulse} collapsed={!isExpanded}>Agenda Saúde</NavItem>
                                <NavItem to="/saude/agendas" icon={Calendar} collapsed={!isExpanded}>Agendas</NavItem>
                            </>
                        )}

                        {(isAdminSistema || isAdminMunicipio || isAgenteEducacao) && (
                            <>
                                <NavGroupLabel collapsed={!isExpanded}>Educação</NavGroupLabel>
                                <NavItem to="/educacao/escolas" icon={School} collapsed={!isExpanded}>Escolas</NavItem>
                                <NavItem to="/educacao/matriculas" icon={ClipboardList} collapsed={!isExpanded}>Matrículas</NavItem>
                            </>
                        )}

                        {(isAdminSistema || isAdminMunicipio || isGestorSecretaria) && (
                            <>
                                <NavGroupLabel collapsed={!isExpanded}>Administração</NavGroupLabel>
                                <NavItem to="/admin/usuarios" icon={Users} collapsed={!isExpanded}>Usuários</NavItem>
                                {isAdminSistema && <NavItem to="/admin/municipios" icon={Building} collapsed={!isExpanded}>Municípios</NavItem>}
                            </>
                        )}
                    </nav>
                </div>

                {/* ── Footer ── */}
                <div className={cn(
                    'border-t border-slate-200 dark:border-slate-800 py-3 shrink-0',
                    isExpanded ? 'px-3' : 'px-2 flex flex-col items-center'
                )}>
                    <NavItem to="/configuracoes" icon={Settings} collapsed={!isExpanded}>Configurações</NavItem>
                </div>
            </aside>
        </TooltipProvider>
    );
}