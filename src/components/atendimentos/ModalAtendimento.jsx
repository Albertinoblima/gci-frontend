// src/components/atendimentos/ModalAtendimento.jsx
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter, // Adicionado para melhor semântica dos botões
    DialogClose,  // Para fechar o modal com o botão de fechar padrão
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Phone,
    Mail,
    Clock, // Ícone não usado no código fornecido, mas pode ser útil
    Building2,
    MessageSquare,
    ExternalLink,
    X,
    CalendarDays, // Para Data Limite
    Info, // Para Observações
    Hash, // Para Protocolo
    ShieldQuestion, // Para Assunto
} from "lucide-react";
import { format, parseISO } from "date-fns"; // parseISO para converter string ISO para Date
import { ptBR } from "date-fns/locale";

// Definindo fora para evitar recriação em cada render
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
    aguardando: "Aguardando Atendimento",
    em_andamento: "Em Andamento",
    pendente_cidadao: "Pendente do Cidadão",
    resolvido: "Resolvido",
    fechado: "Fechado",
    cancelado: "Cancelado",
    default: "Desconhecido"
};

export default function ModalAtendimento({
    atendimento,
    secretarias,
    municipios,
    isOpen, // Controlar abertura/fechamento por prop
    onClose,
    onOpenChat, // Callback para abrir chat
    onEditAtendimento // Callback para editar
}) {
    if (!atendimento) return null;

    const getSecretariaNome = (secretariaId) => {
        // Idealmente, esta busca seria mais otimizada ou o nome viria com o 'atendimento'
        const secretaria = secretarias?.find(s => String(s.id) === String(secretariaId));
        return secretaria ? secretaria.nome : 'N/D';
    };

    const getMunicipioNome = (municipioId) => {
        const municipio = municipios?.find(m => String(m.id) === String(municipioId));
        return municipio ? municipio.nome : 'N/D';
    };

    const currentStatusColor = statusColors[atendimento.status] || statusColors.default;
    const currentStatusLabel = statusLabels[atendimento.status] || statusLabels.default;

    // Função para formatar data, tratando strings ISO
    const formatDate = (dateString, formatString = "dd 'de' MMMM 'de' yyyy 'às' HH:mm") => {
        if (!dateString) return 'N/D';
        try {
            return format(parseISO(dateString), formatString, { locale: ptBR });
        } catch (e) {
            console.warn("Erro ao formatar data:", dateString, e);
            return dateString; // Retorna a string original se não puder formatar
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="p-6 pb-4 border-b dark:border-slate-700">
                    <div className="flex items-start justify-between">
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">
                            Detalhes do Atendimento
                        </DialogTitle>
                        <Badge
                            className={`${currentStatusColor} border font-medium py-1 px-3 text-xs`}
                            variant="secondary" // variant="outline" pode ser mais adequado se já tem bg e border
                        >
                            {currentStatusLabel}
                        </Badge>
                    </div>
                    {/* Subtítulo com protocolo e data de criação */}
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <Hash className="w-4 h-4 mr-1.5" />
                        Protocolo #{atendimento.protocolo}
                        <span className="mx-2">·</span>
                        <Clock className="w-4 h-4 mr-1.5" />
                        Criado em {formatDate(atendimento.created_date)}
                        {/* Supondo que created_date é o campo correto. No DDL era created_at */}
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Assunto e Prioridade */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                                    <ShieldQuestion className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-500" />
                                    {atendimento.assunto || "Assunto não informado"}
                                </h3>
                            </div>
                            {atendimento.prioridade && (
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Prioridade</p>
                                    <p className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                                        {atendimento.prioridade}
                                    </p>
                                </div>
                            )}
                        </div>
                        {atendimento.descricao && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {atendimento.descricao}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Informações do Cidadão */}
                    <Section title="Dados do Cidadão" icon={<User className="w-5 h-5" />}>
                        <InfoGrid>
                            <InfoItem label="Nome" value={atendimento.cidadao_nome} icon={<User />} />
                            {atendimento.cidadao_telefone && <InfoItem label="Telefone" value={atendimento.cidadao_telefone} icon={<Phone />} />}
                            {atendimento.cidadao_email && <InfoItem label="Email" value={atendimento.cidadao_email} icon={<Mail />} />}
                            <InfoItem label="Canal de Origem" value={atendimento.canal_origem?.replace('_', ' ') || 'N/D'} icon={<MessageSquare />} capitalizeValue />
                        </InfoGrid>
                    </Section>

                    {/* Informações Administrativas */}
                    <Section title="Informações Administrativas" icon={<Building2 className="w-5 h-5" />}>
                        <InfoGrid>
                            <InfoItem label="Município" value={getMunicipioNome(atendimento.municipio_id)} />
                            <InfoItem label="Secretaria" value={getSecretariaNome(atendimento.secretaria_id)} />
                            {atendimento.data_limite && <InfoItem label="Data Limite" value={formatDate(atendimento.data_limite, "dd/MM/yyyy")} icon={<CalendarDays />} />}
                            {/* Adicionar atendente responsável se houver */}
                            {atendimento.atendente_nome && <InfoItem label="Atendente" value={atendimento.atendente_nome} icon={<User />} />}
                        </InfoGrid>
                    </Section>

                    {/* Observações Internas */}
                    {atendimento.observacoes_internas && (
                        <Section title="Observações Internas" icon={<Info className="w-5 h-5" />}>
                            <p className="text-sm text-slate-700 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-800/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700 whitespace-pre-wrap">
                                {atendimento.observacoes_internas}
                            </p>
                        </Section>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 border-t dark:border-slate-700">
                    <Button variant="outline" onClick={onClose}>
                        <X className="w-4 h-4 mr-2" />
                        Fechar
                    </Button>
                    {onEditAtendimento && ( // Mostrar botão de editar apenas se a função for fornecida
                        <Button variant="outline" onClick={() => onEditAtendimento(atendimento)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                    )}
                    {onOpenChat && ( // Mostrar botão de chat apenas se a função for fornecida
                        <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white" onClick={() => onOpenChat(atendimento)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Abrir Chat
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Componentes auxiliares para o Modal (poderiam ir para um arquivo separado se usados em mais lugares)
const Section = ({ title, icon, children }) => (
    <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        {children}
    </div>
);

const InfoGrid = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {children}
    </div>
);

const InfoItem = ({ label, value, icon, capitalizeValue = false }) => (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
        {icon && React.cloneElement(icon, { className: "w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" })}
        <div className="flex-1">
            <p className="text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`font-medium text-slate-800 dark:text-slate-200 ${capitalizeValue ? 'capitalize' : ''}`}>
                {value || 'N/D'}
            </p>
        </div>
    </div>
);
