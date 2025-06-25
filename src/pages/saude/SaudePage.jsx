// src/pages/saude/SaudePage.jsx
import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hospital, Stethoscope, CalendarClock, CalendarPlus, ClipboardList, FlaskConical, Users } from 'lucide-react'; // Ícones
import { createPageUrl } from '../../utils/urls.js';

const PaineisSaude = [
    {
        title: "Unidades de Saúde",
        description: "Gerencie postos, clínicas e hospitais.",
        icon: Hospital,
        url: createPageUrl("Saude/Unidades"), // Ex: /saude/unidades
        roles: ['admin_sistema', 'admin_municipio', 'gestor_saude']
    },
    {
        title: "Profissionais de Saúde",
        description: "Cadastre médicos, enfermeiros e outros profissionais.",
        icon: Stethoscope,
        url: createPageUrl("Saude/Profissionais"), // Ex: /saude/profissionais
        roles: ['admin_sistema', 'admin_municipio', 'gestor_saude']
    },
    {
        title: "Especialidades Médicas",
        description: "Administre as especialidades oferecidas.",
        icon: Users, // Usando Users como placeholder, poderia ser algo mais específico
        url: createPageUrl("Saude/Especialidades"), // Ex: /saude/especialidades
        roles: ['admin_sistema'] // Geralmente global
    },
    {
        title: "Horários Disponíveis",
        description: "Configure agendas e horários para atendimento.",
        icon: CalendarClock,
        url: createPageUrl("Saude/Horarios"), // Ex: /saude/horarios
        roles: ['admin_sistema', 'admin_municipio', 'gestor_saude'] // Profissionais podem gerenciar os seus
    },
    {
        title: "Agendamentos",
        description: "Visualize e gerencie os agendamentos dos cidadãos.",
        icon: CalendarPlus,
        url: createPageUrl("Saude/Agendamentos"), // Ex: /saude/agendamentos
        roles: ['admin_sistema', 'admin_municipio', 'gestor_saude', 'agente_saude', 'agente_atendimento']
    },
    {
        title: "Tipos de Exames",
        description: "Cadastre os tipos de exames oferecidos.",
        icon: FlaskConical,
        url: createPageUrl("Saude/TiposExames"), // Ex: /saude/tipos-exames
        roles: ['admin_sistema', 'admin_municipio', 'gestor_saude']
    },
    {
        title: "Triagens",
        description: "Registre e acompanhe as triagens de pacientes.",
        icon: ClipboardList,
        url: createPageUrl("Saude/Triagens"), // Ex: /saude/triagens
        roles: ['admin_sistema', 'admin_municipio', 'gestor_saude', 'agente_saude'] // Enfermeiros, médicos
    },
];

export default function SaudePage() {
    const { user } = useContext(AuthContext);

    // Filtrar painéis baseados no role do usuário
    const paineisAcessiveis = PaineisSaude.filter(painel =>
        painel.roles.includes(user?.role) || user?.role === 'admin_sistema' // Admin sistema vê tudo
        // Adicionar lógica mais fina se admin_municipio só vê alguns, etc.
    );

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
                <Stethoscope className="w-10 h-10 text-red-600 dark:text-red-500" />
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                        Módulo de Saúde
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-base sm:text-lg">
                        Gerenciamento completo dos serviços e operações de saúde do município.
                    </p>
                </div>
            </div>

            {/* Adicionar alguns KPIs/Stats rápidos do módulo de saúde aqui, se desejar */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>...</Card>
        <Card>...</Card>
        <Card>...</Card>
      </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paineisAcessiveis.map((painel) => (
                    <Card
                        key={painel.title}
                        className="hover:shadow-xl transition-shadow duration-300 dark:bg-slate-850 dark:border-slate-700 dark:hover:border-red-500/50"
                    >
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-800/30">
                                <painel.icon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">{painel.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <CardDescription className="text-sm text-slate-600 dark:text-slate-400 min-h-[40px]"> {/* Altura mínima para alinhar */}
                                {painel.description}
                            </CardDescription>
                            <Button asChild className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white">
                                <RouterLink to={painel.url}>Acessar {painel.title}</RouterLink>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {paineisAcessiveis.length === 0 && (
                    <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-8">
                        Você não tem permissão para acessar funcionalidades do módulo de saúde ou nenhuma foi configurada.
                    </p>
                )}
            </div>
        </div>
    );
}