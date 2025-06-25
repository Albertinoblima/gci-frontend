// src/components/chat/MensagemFeed.jsx
import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import { useParams } from 'react-router-dom';
import mensagemService from '@/services/mensagemService';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';

// Componente simples para exibir uma mensagem
const MensagemItem = ({ msg, userId }) => {
    // Determina se a mensagem é do agente logado ou do cidadão
    const isMyMessage = msg.remetente_tipo === 'agente' && msg.agente_id === userId;

    return (
        <div className={`flex items-end gap-2 my-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-2 rounded-lg ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <p className="text-sm">{msg.conteudo_texto}</p>
                <p className="text-xs text-right mt-1 opacity-70">
                    {new Date(msg.timestamp_mensagem).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};


export default function MensagemFeed() {
    const { atendimentoId } = useParams();
    const queryClient = useQueryClient();
    const socket = useSocket();
    const { user } = useAuth(); // Pega o usuário logado para identificar suas próprias mensagens
    const bottomRef = useRef(null);
    const queryKey = ['mensagens', atendimentoId];

    const { data: mensagensResponse, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn: () => mensagemService.getByAtendimentoId(atendimentoId, { page: 1, limit: 200 }).then(res => res.data),
        enabled: !!atendimentoId,
        staleTime: 1000 * 60, // Cache de 1 minuto
    });

    const mensagens = mensagensResponse?.mensagens || [];

    useEffect(() => {
        // Lógica de inscrição no socket
        if (socket && atendimentoId) {
            socket.emit('join_atendimento_room', atendimentoId);

            const handleNovaMensagem = (novaMensagem) => {
                if (String(novaMensagem.atendimento_id) === String(atendimentoId)) {
                    // Atualiza o cache do React Query com a nova mensagem
                    queryClient.setQueryData(queryKey, (oldData) => {
                        if (!oldData || !oldData.mensagens) return { mensagens: [novaMensagem] };
                        // Evita duplicatas
                        if (oldData.mensagens.some(m => m.id === novaMensagem.id)) return oldData;
                        return { ...oldData, mensagens: [...oldData.mensagens, novaMensagem] };
                    });
                }
            };

            socket.on('nova_mensagem', handleNovaMensagem);

            // Função de limpeza para sair da sala e remover o listener
            return () => {
                socket.emit('leave_atendimento_room', atendimentoId); // Opcional, mas boa prática
                socket.off('nova_mensagem', handleNovaMensagem);
            };
        }
    }, [socket, atendimentoId, queryClient, queryKey]);

    // Scroll para a última mensagem
    useEffect(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, [mensagens]);

    if (!atendimentoId) {
        return <div className="flex-1 flex items-center justify-center text-slate-500">Selecione um atendimento para ver as mensagens.</div>;
    }
    if (isLoading) {
        return <LoadingSpinner text="Carregando histórico de mensagens..." />;
    }
    if (isError) {
        return <ErrorMessage message={error.message || "Não foi possível carregar as mensagens."} />;
    }

    return (
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
            <div className="space-y-4">
                {mensagens.map(msg => <MensagemItem key={msg.id || msg.id_mensagem_canal_origem} msg={msg} userId={user.id} />)}
            </div>
            <div ref={bottomRef} />
        </div>
    );
}