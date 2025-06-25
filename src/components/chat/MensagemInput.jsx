// src/components/chat/MensagemInput.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifier, NOTIFICATION_TYPES } from '@/contexts/NotificationContext';
import mensagemService from '@/services/mensagemService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Loader2 } from 'lucide-react';

export default function MensagemInput() {
    const { atendimentoId } = useParams();
    const [texto, setTexto] = useState('');
    const { notify } = useNotifier();
    const queryClient = useQueryClient();
    const { user: agente } = useAuth(); // Pega o agente logado para a atualização otimista

    const mutation = useMutation({
        mutationFn: (novaMensagem) => mensagemService.create(atendimentoId, novaMensagem),

        // --- Início da Lógica de Atualização Otimista ---
        onMutate: async (novaMensagem) => {
            // 1. Cancela qualquer query em andamento para evitar conflitos
            await queryClient.cancelQueries({ queryKey: ['mensagens', atendimentoId] });

            // 2. Salva o estado anterior do cache, caso precisemos reverter
            const previousMessages = queryClient.getQueryData(['mensagens', atendimentoId]);

            // 3. Adiciona a nova mensagem ao cache imediatamente (de forma otimista)
            queryClient.setQueryData(['mensagens', atendimentoId], (oldData) => {
                const optimisticMessage = {
                    ...novaMensagem,
                    id: `temp_${Date.now()}`, // ID temporário para a key do React
                    remetente_tipo: 'agente',
                    agente_id: agente.id,
                    timestamp_mensagem: new Date().toISOString(),
                };

                if (!oldData || !oldData.mensagens) {
                    return { mensagens: [optimisticMessage] };
                }

                return { ...oldData, mensagens: [...oldData.mensagens, optimisticMessage] };
            });

            // 4. Limpa o input imediatamente para o usuário
            setTexto('');

            // 5. Retorna o estado anterior para o contexto do `onError`
            return { previousMessages };
        },
        onError: (err, newTodo, context) => {
            // 6. Se a mutação falhar, reverte o cache para o estado anterior
            if (context?.previousMessages) {
                queryClient.setQueryData(['mensagens', atendimentoId], context.previousMessages);
            }
            notify(err.response?.data?.message || "Falha ao enviar mensagem.", NOTIFICATION_TYPES.ERROR);
        },
        onSettled: () => {
            // 7. Ao final (sucesso ou erro), invalida a query para buscar os dados frescos do servidor.
            // Isso garante que o ID temporário seja substituído pelo ID real do banco.
            queryClient.invalidateQueries({ queryKey: ['mensagens', atendimentoId] });
        },
    });

    const handleSend = () => {
        if (!texto.trim() || !atendimentoId) return;
        mutation.mutate({ conteudo_texto: texto });
    };

    return (
        <div className="p-4 border-t bg-white dark:bg-slate-900">
            <div className="relative flex items-center">
                <Input
                    placeholder="Digite sua mensagem..."
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !mutation.isPending && handleSend()}
                    disabled={!atendimentoId || mutation.isPending}
                    autoComplete="off"
                />
                <div className="absolute right-2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" disabled={mutation.isPending}>
                        <Paperclip className="h-5 w-5 text-slate-500" />
                    </Button>
                    <Button size="icon" onClick={handleSend} disabled={!texto.trim() || mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}