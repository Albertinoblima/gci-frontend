// src/pages/educacao/EducacaoPage.jsx
import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, School, FileText, Users } from 'lucide-react'; // Ícones
import { createPageUrl } from '../../utils/urls.js';

const PaineisEducacao = [
    {
        title: "Gerenciar Escolas",
        description: "Cadastre e administre as escolas da rede municipal.",
        icon: School,
        url: createPageUrl("Educacao/Escolas"), // Ex: /educacao/escolas
        roles: ['admin_sistema', 'admin_municipio', 'gestor_educacao'] // Adicionar gestor_educacao se existir
    },
    {
        title: "Solicitações de Matrícula",
        description: "Acompanhe e gerencie os pedidos de matrícula escolar.",
        icon: FileText,
        url: createPageUrl("Educacao/SolicitacoesMatricula"), // Ex: /educacao/solicitacoes-matricula
        roles: ['admin_sistema', 'admin_municipio', 'gestor_educacao', 'agente_secretaria_educacao'] // Adicionar roles
    },
    // Adicionar mais painéis se necessário (ex: Alunos, Turmas, se o escopo aumentar)
];

export default function EducacaoPage() {
    const { user } = useContext(AuthContext);

    const paineisAcessiveis = PaineisEducacao.filter(painel =>
        painel.roles.includes(user?.role) || user?.role === 'admin_sistema'
    );

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
                <GraduationCap className="w-10 h-10 text-orange-500 dark:text-orange-400" />
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                        Módulo de Educação
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-base sm:text-lg">
                        Gestão de escolas e matrículas do município.
                    </p>
                </div>
            </div>

            {/* KPIs/Stats rápidos do módulo de educação aqui, se desejar */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paineisAcessiveis.map((painel) => (
                    <Card
                        key={painel.title}
                        className="hover:shadow-xl transition-shadow duration-300 dark:bg-slate-850 dark:border-slate-700 dark:hover:border-orange-500/50"
                    >
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-800/30">
                                <painel.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">{painel.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <CardDescription className="text-sm text-slate-600 dark:text-slate-400 min-h-[40px]">
                                {painel.description}
                            </CardDescription>
                            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white">
                                <RouterLink to={painel.url}>Acessar {painel.title}</RouterLink>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {paineisAcessiveis.length === 0 && (
                    <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-8">
                        Você não tem permissão para acessar funcionalidades do módulo de educação.
                    </p>
                )}
            </div>
        </div>
    );
}