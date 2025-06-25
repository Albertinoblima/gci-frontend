// src/components/chat/MensagemItem.jsx
import React from 'react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Se usar avatar
import { Paperclip, Download, Image as ImageIcon, FileText, Mic, Video, AlertCircle } from 'lucide-react'; // Ícones para anexos

// Função para formatar data/hora, pode ser movida para utils/formatters.js
const formatChatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
        const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
        if (!isValidDate(date)) return 'Data inválida';
        // Exemplo: '14:35' ou 'Ontem, 14:35' ou '25/07, 14:35'
        // A lógica exata de formatação pode ser mais complexa
        return format(date, 'HH:mm', { locale: ptBR });
    } catch (error) {
        return String(timestamp);
    }
};

// Função para obter iniciais
const getInitials = (name = '') => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length > 1) {
        return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Ícones para tipos de mídia
const mediaIcons = {
    imagem: ImageIcon,
    documento: FileText,
    audio: Mic,
    video: Video,
    arquivo: Paperclip, // Fallback genérico
};


export default function MensagemItem({ mensagem, usuarioLogado }) {
    // Determinar se a mensagem é do usuário logado (atendente) ou do outro participante (cidadão/bot)
    // `mensagem.remetente_tipo` pode ser 'agente', 'cidadao', 'bot'
    // `mensagem.agente_id` ou `mensagem.cidadao_id`
    // `usuarioLogado` deve ter uma estrutura como { id: ..., tipo: 'agente' }

    let isRemetenteLogado = false;
    if (usuarioLogado && mensagem.remetente_tipo === 'agente' && usuarioLogado.id === mensagem.agente_id) {
        isRemetenteLogado = true;
    }
    // Adicionar lógica para 'bot' se o bot também for considerado "não logado" visualmente
    // Ou se `remetente_tipo === 'cidadao'`

    const remetenteNome = isRemetenteLogado
        ? "Você"
        : (mensagem.remetente_tipo === 'cidadao'
            ? (mensagem.cidadao_nome_perfil || `Cidadão ${mensagem.cidadao_id || ''}`)
            : (mensagem.remetente_tipo === 'bot' ? 'Assistente Virtual' : `Agente ${mensagem.agente_id || ''}`)
        );

    const MediaIconComponent = mediaIcons[mensagem.tipo_midia] || mediaIcons.arquivo;

    return (
        <div className={`flex mb-3 ${isRemetenteLogado ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`p-3 rounded-xl max-w-[70%] sm:max-w-[60%] shadow-sm ${isRemetenteLogado
                        ? 'bg-emerald-600 dark:bg-emerald-700 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
            >
                {/* Opcional: Mostrar nome do remetente se não for o usuário logado e não for óbvio */}
                {!isRemetenteLogado && mensagem.remetente_tipo !== 'cidadao' && ( // Ex: se for outro agente ou bot
                    <p className="text-xs font-semibold mb-1 opacity-80">{remetenteNome}</p>
                )}

                {mensagem.conteudo_texto && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {mensagem.conteudo_texto}
                    </p>
                )}

                {mensagem.tipo_midia && mensagem.tipo_midia !== 'texto' && mensagem.url_midia && (
                    <a
                        href={mensagem.url_midia} // Idealmente, esta URL seria para seu servidor que serve o arquivo com segurança
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-2 flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${isRemetenteLogado
                                ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-900'
                                : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500'
                            }`}
                        title={`Baixar/Ver ${mensagem.nome_arquivo_original || mensagem.tipo_midia}`}
                    >
                        <MediaIconComponent className="w-5 h-5 shrink-0" />
                        <span className="truncate flex-1">{mensagem.nome_arquivo_original || `Anexo (${mensagem.tipo_midia})`}</span>
                        <Download className="w-4 h-4 shrink-0 opacity-70" />
                    </a>
                )}

                {/* Status de Envio/Leitura (complexo, depende da API da Meta e WebSockets) */}
                {/* {isRemetenteLogado && mensagem.status_envio_canal && (
            <span className={`text-xs mt-1 flex justify-end items-center gap-1 ${ isRemetenteLogado ? 'opacity-70' : 'text-slate-500 dark:text-slate-400'}`}>
                {mensagem.status_envio_canal === 'lido' && <CheckCheck className="w-3.5 h-3.5" />}
                {mensagem.status_envio_canal === 'entregue' && <Check className="w-3.5 h-3.5" />}
                {mensagem.status_envio_canal === 'enviado' && <Timer className="w-3.5 h-3.5" />}
                {mensagem.status_envio_canal === 'falhou' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
            </span>
        )} */}

                <p className={`text-xs mt-1.5 ${isRemetenteLogado ? 'text-right opacity-70' : 'text-left text-slate-500 dark:text-slate-400'}`}>
                    {formatChatMessageTime(mensagem.timestamp_mensagem || mensagem.created_at)}
                </p>
            </div>
        </div>
    );
}