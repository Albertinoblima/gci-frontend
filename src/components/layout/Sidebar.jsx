// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from "@/lib/utils";
import gciLogo from '@/assets/logo-gci-completo.png';

// Ícones
import {
    LayoutDashboard, MessageSquare, Building, Users, Library,
    HeartPulse, School, Wrench, ShieldQuestion, ClipboardList, Stethoscope, Hospital, User, Calendar, UserCircle
} from 'lucide-react';

// NavItem não precisa saber sobre o 'user'. Ele é um componente de apresentação.
const NavItem = ({ to, icon: Icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);

    return (
        <NavLink
            to={to}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                isActive && "bg-slate-200 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50"
            )}
        >
            <Icon className="h-4 w-4" />
            <span className="truncate">{children}</span>
        </NavLink>
    );
};

const NavGroupLabel = ({ children }) => (
    <h3 className="my-2 px-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
        {children}
    </h3>
);

export default function Sidebar({ onLinkClick }) {
    // A variável 'user' é definida e usada APENAS aqui, no componente pai.
    const { user } = useAuth();

    // Verificações de Role são feitas aqui
    const isAdminSistema = user?.role === 'admin_sistema';
    const isAdminMunicipio = user?.role === 'admin_municipio';
    const isGestorSecretaria = user?.role === 'gestor_secretaria';
    const isAgenteSaude = user?.role === 'agente_saude';
    const isAgenteEducacao = user?.role === 'agente_educacao';
    const isAgenteGenerico = user?.role.includes('agente'); // Para a tela de demandas

    const handleLinkClick = () => { if (onLinkClick) onLinkClick(); };

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 dark:border-slate-800">
                <a href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={handleLinkClick}>
                    <img src={gciLogo} alt="GCI Logo" className="h-8 w-auto" />
                    <span className="dark:text-white">GCI</span>
                </a>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                    <NavItem to="/chat" icon={MessageSquare}>Atendimentos</NavItem>

                    <NavGroupLabel>Saúde</NavGroupLabel>
                    {(isAdminSistema || isAdminMunicipio) && <NavItem to="/saude/profissionais" icon={User}>Profissionais</NavItem>}
                    {(isAdminSistema || isAdminMunicipio) && <NavItem to="/saude/unidades" icon={Hospital}>Unidades</NavItem>}
                    {(isAdminSistema || isAdminMunicipio) && <NavItem to="/saude/especialidades" icon={Stethoscope}>Especialidades</NavItem>}
                    {(isAdminSistema || isAdminMunicipio || isAgenteSaude) && <NavItem to="/saude/agendamentos" icon={HeartPulse}>Agenda Saúde</NavItem>}
                    {(isAdminSistema || isAdminMunicipio || isAgenteSaude) && <NavItem to="/saude/agendas" icon={Calendar}>Agendas</NavItem>}

                    <NavGroupLabel>Educação</NavGroupLabel>
                    {(isAdminSistema || isAdminMunicipio || isAgenteEducacao) && <NavItem to="/educacao/escolas" icon={School}>Escolas</NavItem>}
                    {(isAdminSistema || isAdminMunicipio || isAgenteEducacao) && <NavItem to="/educacao/matriculas" icon={ClipboardList}>Matrículas</NavItem>}

                    {(isAdminSistema || isAdminMunicipio || isGestorSecretaria) && (
                        <>
                            <NavGroupLabel>Administração</NavGroupLabel>
                            <NavItem to="/admin/usuarios" icon={Users}>Usuários</NavItem>
                            <NavItem to="/cidadaos" icon={UserCircle}>Cidadãos</NavItem>
                        </>
                    )}

                    {isAdminSistema && (
                        <>
                            <NavGroupLabel>Sistema</NavGroupLabel>
                            <NavItem to="/admin/municipios" icon={Building}>Municípios</NavItem>
                        </>
                    )}
                </nav>
            </div>
            {/* ... resto do componente ... */}
        </div>
    );
}