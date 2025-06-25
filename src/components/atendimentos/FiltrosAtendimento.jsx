// src/components/atendimentos/FiltrosAtendimento.jsx
import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"; // Supondo que são componentes Shadcn/UI
import { Button } from '@/components/ui/button'; // Para o botão de limpar filtros
import { Filter, RotateCcw } from "lucide-react"; // Ícone para limpar filtros

// Opções de filtro podem ser definidas como constantes para facilitar a manutenção
const OPCOES_STATUS = [
    { value: "todos", label: "Todos os Status" },
    { value: "aguardando", label: "Aguardando" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "pendente_cidadao", label: "Pend. Cidadão" },
    { value: "resolvido", label: "Resolvido" },
    { value: "fechado", label: "Fechado" },
    { value: "cancelado", label: "Cancelado" },
];

const OPCOES_CANAL = [
    { value: "todos", label: "Todos os Canais" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "messenger", label: "Messenger" },
    { value: "instagram", label: "Instagram" },
    { value: "presencial", label: "Presencial" },
    { value: "telefone", label: "Telefone" },
    { value: "email", label: "Email" },
    // Adicionar outros canais se necessário
];

const OPCOES_PRIORIDADE = [
    { value: "todas", label: "Todas as Prioridades" },
    { value: "baixa", label: "Baixa" },
    { value: "normal", label: "Normal" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" },
];

export default function FiltrosAtendimento({ filtros, setFiltros, secretarias, isLoading }) {
    // isLoading é adicionado para desabilitar filtros durante o carregamento dos dados principais

    const handleFiltroChange = (tipo, valor) => {
        // Se o valor for "todos" ou "todas", considerar remover a chave do objeto de filtros
        // ou definir como null/undefined, dependendo de como a lógica de filtragem lida com isso.
        // Por simplicidade, vamos manter a lógica atual do componente pai.
        setFiltros(prev => ({ ...prev, [tipo]: valor }));
    };

    const handleLimparFiltros = () => {
        setFiltros({
            status: "todos",
            secretaria: "todas",
            canal: "todos",
            prioridade: "todas"
            // Adicionar outros filtros aqui se houver
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mr-1">
                <Filter className="w-4 h-4 mr-2" />
                <span>Filtros:</span>
            </div>

            <Select
                value={filtros.status}
                onValueChange={(value) => handleFiltroChange('status', value)}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                    {OPCOES_STATUS.map(opcao => (
                        <SelectItem key={opcao.value} value={opcao.value} className="dark:focus:bg-slate-700">
                            {opcao.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filtros.secretaria}
                onValueChange={(value) => handleFiltroChange('secretaria', value)}
                disabled={isLoading || !secretarias || secretarias.length === 0}
            >
                <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Secretaria" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                    <SelectItem value="todas" className="dark:focus:bg-slate-700">Todas as Secretarias</SelectItem>
                    {secretarias?.map(secretaria => (
                        <SelectItem key={secretaria.id} value={String(secretaria.id)} className="dark:focus:bg-slate-700">
                            {secretaria.emoji || '🏛️'} {secretaria.nome}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filtros.canal}
                onValueChange={(value) => handleFiltroChange('canal', value)}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                    {OPCOES_CANAL.map(opcao => (
                        <SelectItem key={opcao.value} value={opcao.value} className="dark:focus:bg-slate-700">
                            {opcao.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filtros.prioridade}
                onValueChange={(value) => handleFiltroChange('prioridade', value)}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                    {OPCOES_PRIORIDADE.map(opcao => (
                        <SelectItem key={opcao.value} value={opcao.value} className="dark:focus:bg-slate-700">
                            {opcao.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                size="sm"
                onClick={handleLimparFiltros}
                disabled={isLoading}
                className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300"
            >
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Limpar
            </Button>
        </div>
    );
}
