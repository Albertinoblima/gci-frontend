// src/components/atendimentos/ListaAtendimentos.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Clock,
    User,
    Smartphone,
    MessageCircle, // Ícone do Facebook Messenger
    Instagram,
    Mail,
    Phone,
    Building // Ícone para "Presencial" se User for para Cidadão
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Definindo fora para evitar recriação
const statusColors = {
    aguardando: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-800/30 dark:text-orange-300 dark:border-orange-700",
    em_andamento: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-300 dark:border-blue-700",
    pendente_cidadao: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-800/30 dark:text-purple-300 dark:border-purple-700",
    resolvido: "bg-green-100 text-green-800 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700",
    fechado: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600",
    cancelado: "bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700",
    default: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600"
};

const statusLabels = {
    aguardando: "Aguardando",
    em_andamento: "Em Andamento",
    pendente_cidadao: "Pendente Cidadão",
    resolvido: "Resolvido",
    fechado: "Fechado",
    cancelado: "Cancelado",
    default: "Desconhecido"
};

const canalIcons = {
    whatsapp: Smartphone,
    messenger: MessageCircle,
    instagram: Instagram,
    presencial: Building, // Usando Building para "presencial" para diferenciar de "User" para cidadão
    telefone: Phone,
    email: Mail,
    default: MessageSquare
};

const prioridadeColors = {
    baixa: "bg-gray-500 dark:bg-gray-400",
    normal: "bg-blue-500 dark:bg-blue-400",
    alta: "bg-orange-500 dark:bg-orange-400",
    urgente: "bg-red-500 dark:bg-red-400",
    default: "bg-slate-500 dark:bg-slate-400"
};
const prioridadeLabels = {
    baixa: "Baixa",
    normal: "Normal",
    alta: "Alta",
    urgente: "Urgente",
    default: "N/D"
};


// Função para formatar data, tratando strings ISO
const formatDate = (dateString, formatString = "dd/MM/yyyy HH:mm") => {
    if (!dateString) return 'N/D';
    try {
        return format(parseISO(dateString), formatString, { locale: ptBR });
    } catch (e) {
        // console.warn("Erro ao formatar data na lista:", dateString, e);
        return dateString;
    }
};

const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 sm:w-64"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32 sm:w-48"></div>
                </div>
            </div>
            <div className="space-y-2 flex flex-col items-end">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 sm:w-24"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 sm:w-16"></div>
            </div>
        </div>
    </div>
);


export default function ListaAtendimentos({
    atendimentos,
    secretarias,
    // municipios não está sendo usado neste componente diretamente, remover se não for necessário
    isLoading,
    onSelectAtendimento
}) {

    // Otimização: Memoizar a função getSecretariaNome se secretarias mudar raramente
    // Ou, melhor ainda, processar os atendimentos para já incluir o nome da secretaria antes de passar para este componente.
    const getSecretariaNome = React.useCallback((secretariaId) => {
        const secretaria = secretarias?.find(s => String(s.id) === String(secretariaId));
        return secretaria ? secretaria.nome : 'N/D';
    }, [secretarias]);

    const CanalIcon = ({ canal }) => {
        const IconComponent = canalIcons[canal?.toLowerCase()] || canalIcons.default;
        return <IconComponent className="w-5 h-5 text-slate-700 dark:text-slate-300" />;
    };

    const handleKeyDown = (event, atendimento) => {
        if (event.key === 'Enter' || event.key === ' ') {
            onSelectAtendimento(atendimento);
        }
    };

    if (isLoading) {
        return (
            <Card className="dark:bg-slate-850 dark:border-slate-700">
                <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                        {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-slate-850 dark:border-slate-700">
            <CardContent className="p-4 md:p-6">
                <div className="space-y-3">
                    {atendimentos?.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Nenhum atendimento encontrado</h3>
                            <p>Ajuste os filtros ou tente novamente mais tarde.</p>
                        </div>
                    ) : (
                        atendimentos.map((atendimento) => {
                            const currentStatusColor = statusColors[atendimento.status] || statusColors.default;
                            const currentStatusLabel = statusLabels[atendimento.status] || statusLabels.default;
                            const currentPrioridadeColor = prioridadeColors[atendimento.prioridade] || prioridadeColors.default;
                            const currentPrioridadeLabel = prioridadeLabels[atendimento.prioridade] || prioridadeLabels.default;

                            return (
                                <div
                                    key={atendimento.id}
                                    role="button" // Acessibilidade: indica que é clicável
                                    tabIndex={0}  // Acessibilidade: torna focável pelo teclado
                                    onClick={() => onSelectAtendimento(atendimento)}
                                    onKeyDown={(e) => handleKeyDown(e, atendimento)}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer group"
                                    aria-label={`Abrir detalhes do atendimento ${atendimento.protocolo}, assunto ${atendimento.assunto}`}
                                >
                                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-200 shrink-0">
                                            <CanalIcon canal={atendimento.canal_origem} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400" title={atendimento.assunto}>
                                                    {atendimento.assunto || "Sem assunto"}
                                                </h3>
                                                <div
                                                    className={`w-2.5 h-2.5 rounded-full ${currentPrioridadeColor} shrink-0`}
                                                    title={`Prioridade: ${currentPrioridadeLabel}`}
                                                    aria-label={`Prioridade: ${currentPrioridadeLabel}`}
                                                />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    {atendimento.cidadao_nome || "Cidadão não identificado"}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDate(atendimento.created_date)} {/* Supondo que o campo é created_date */}
                                                </span>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                                    {getSecretariaNome(atendimento.secretaria_id)}
                                                </span>
                                            </div>

                                            {atendimento.descricao && (
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 truncate max-w-md hidden sm:block">
                                                    {atendimento.descricao}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-end sm:items-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                                        <Badge
                                            className={`${currentStatusColor} border text-xs font-medium py-1 px-3 w-full sm:w-auto justify-center`}
                                            variant="secondary" // ou variant="outline"
                                        >
                                            {currentStatusLabel}
                                        </Badge>

                                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                                            #{atendimento.protocolo}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
