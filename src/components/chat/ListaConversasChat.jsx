// src/components/chat/ListaConversasChat.jsx
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import atendimentoApiService from '@/services/atendimentoApiService';
import { NavLink, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';

const ConversaItem = ({ atendimento }) => {
    const { atendimentoId } = useParams();
    const isActive = atendimentoId === String(atendimento.id);

    return (
        <NavLink
            to={`/chat/${atendimento.id}`}
            className={cn(
                "block p-3 border-b dark:border-slate-800",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                isActive && "bg-blue-100 dark:bg-blue-900/50"
            )}
        >
            <div className="flex justify-between items-center">
                <span className="font-semibold truncate">{atendimento.cidadao_nome || 'Novo Atendimento'}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(atendimento.data_ultima_atualizacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                {atendimento.assunto_breve || 'Nenhuma mensagem ainda...'}
            </p>
        </NavLink>
    );
};

export default function ListaConversasChat() {
    const queryClient = useQueryClient();
    const socket = useSocket();
    const queryKey = ['atendimentos-chat'];

    const { data: atendimentos, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            try {
                const response = await atendimentoApiService.getAll({
                    status: 'aberto,em_andamento,aguardando_atendente',
                    sortBy: 'data_ultima_atualizacao', // Pede para o backend ordenar pela mais recente
                    order: 'desc'
                });
                return response?.data?.data?.atendimentos || [];
            } catch (error) {
                console.error('Erro ao buscar atendimentos:', error);
                return [];
            }
        },
        initialData: [],
        staleTime: 1000 * 30, // 30 segundos
        refetchInterval: 1000 * 60, // 1 minuto
    });

    // Efeito para se inscrever em eventos do socket
    useEffect(() => {
        if (socket) {
            const handleListaUpdate = (mensagem) => {
                // Ao receber qualquer nova mensagem, invalida a query da lista de atendimentos.
                // Isso fará com que o React Query busque a lista novamente, trazendo a conversa
                // com a nova mensagem para o topo.
                queryClient.invalidateQueries({ queryKey });
            };

            socket.on('nova_mensagem', handleListaUpdate);

            return () => {
                socket.off('nova_mensagem', handleListaUpdate);
            };
        }
    }, [socket, queryClient, queryKey]);

    if (isLoading) {
        return <div className="p-4 flex justify-center"><LoadingSpinner text="Buscando atendimentos..." /></div>;
    }

    if (isError) {
        return <ErrorMessage message={error.message} onRetry={refetch} />;
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            <div className="p-4 border-b dark:border-slate-800">
                <h2 className="text-lg font-bold">Atendimentos Ativos</h2>
            </div>
            <ScrollArea className="flex-1">
                {atendimentos?.length > 0 ? (
                    atendimentos.map(atendimento => <ConversaItem key={atendimento.id} atendimento={atendimento} />)
                ) : (
                    <p className="p-4 text-center text-sm text-slate-500">Nenhum atendimento ativo.</p>
                )}
            </ScrollArea>
        </div>
    );
}