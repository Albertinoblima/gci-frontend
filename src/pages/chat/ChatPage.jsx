// src/pages/chat/ChatPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import atendimentoApiService from '@/services/atendimentoApiService';
import ListaConversasChat from '@/components/chat/ListaConversasChat';
import MensagemFeed from '@/components/chat/MensagemFeed';
import MensagemInput from '@/components/chat/MensagemInput';
import DetalhesAtendimentoChat from '@/components/chat/DetalhesAtendimentoChat';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function ChatPage() {
    const { atendimentoId } = useParams();

    // Busca os dados do atendimento selecionado para passar para a coluna de detalhes
    const { data: atendimentoAtivo } = useQuery({
        queryKey: ['atendimento', atendimentoId],
        queryFn: () => atendimentoApiService.getById(atendimentoId).then(res => res.data.data.atendimento),
        enabled: !!atendimentoId,
    });

    return (
        // Usando o componente Resizable do Shadcn/UI para um layout flexível
        <ResizablePanelGroup direction="horizontal" className="h-full max-h-[calc(100vh-theme(space.16))] rounded-lg border">
            {/* Coluna da Esquerda: Lista de Conversas */}
            <ResizablePanel defaultSize={25} minSize={20} className="hidden md:block">
                <ListaConversasChat />
            </ResizablePanel>
            <ResizableHandle withHandle className="hidden md:flex" />

            {/* Coluna Central: A Conversa Ativa */}
            <ResizablePanel defaultSize={50} minSize={30}>
                <div className="flex flex-col h-full">
                    {/* O feed e o input agora só precisam do atendimentoId via useParams */}
                    <MensagemFeed />
                    <MensagemInput />
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="hidden lg:flex" />

            {/* Coluna da Direita: Detalhes do Atendimento */}
            <ResizablePanel defaultSize={25} minSize={20} className="hidden lg:block">
                <DetalhesAtendimentoChat atendimento={atendimentoAtivo} />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}