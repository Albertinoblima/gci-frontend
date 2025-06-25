// src/pages/chat/components/MessageItem.jsx
import React from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { cn } from '../../../lib/utils.js'; // Utilitário do Shadcn para classes condicionais
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Paperclip, Download, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
// CORREÇÃO: Usando importação nomeada com chaves {}
import { anexoApiService } from '../../../services/anexoService.js';

// Componente para renderizar anexos
const AnexoRenderer = ({ anexo }) => {
    const handleDownload = async () => {
        try {
            await anexoApiService.downloadAnexo(anexo.id, anexo.nome_arquivo_original);
        } catch (error) {
            console.error("Falha no download:", error);
            // Idealmente, notificar o usuário com um toast
        }
    };

    // Simplificado, poderia ter mais lógica para diferentes tipos de anexo
    return (
        <div className="mt-2 p-2 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-sm text-slate-800 dark:text-slate-200">{anexo.nome_arquivo_original}</span>
            </div>
            <button onClick={handleDownload} className="p-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full">
                <Download className="w-4 h-4" />
            </button>
        </div>
    );
};


export default function MessageItem({ mensagem }) {
    const { user } = useAuth();
    const isFromAgent = mensagem.remetente_tipo === 'agente';
    // Assumimos que o usuário logado é o agente. Se não for, a mensagem é do cidadão.
    const isMyMessage = isFromAgent;

    // Formata o timestamp da mensagem
    const formattedTime = mensagem.timestamp_mensagem
        ? format(parseISO(mensagem.timestamp_mensagem), 'HH:mm')
        : '';

    return (
        <div
            className={cn(
                "flex items-end gap-2 my-2",
                isMyMessage ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg",
                    isMyMessage
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none"
                )}
            >
                {/* Renderiza o conteúdo do texto */}
                <p className="text-sm whitespace-pre-wrap">{mensagem.conteudo_texto}</p>

                {/* Renderiza o anexo se existir */}
                {mensagem.anexo_id && (
                    <AnexoRenderer anexo={{
                        id: mensagem.anexo_id,
                        nome_arquivo_original: mensagem.nome_arquivo_original
                    }} />
                )}

                {/* Timestamp da mensagem */}
                <p className={cn(
                    "text-xs mt-1 opacity-70",
                    isMyMessage ? "text-emerald-200" : "text-slate-500 dark:text-slate-400"
                )}>
                    {formattedTime}
                </p>
            </div>
        </div>
    );
}