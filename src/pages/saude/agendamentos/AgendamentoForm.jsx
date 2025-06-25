// src/pages/saude/agendamentos/AgendamentoForm.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import saudeApiService from '@/services/saudeApiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AgendamentoForm({ isOpen, onClose }) {

    const { data: opcoes, isLoading: isLoadingOpcoes } = useQuery({
        queryKey: ['opcoesAgendamento'],
        queryFn: () => saudeApiService.getOpcoesAgendamento().then(res => res.data.data),
        staleTime: 1000 * 60 * 30, // Cache de 30 minutos para essas opções
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>Preencha os detalhes para encontrar um horário.</DialogDescription>
                </DialogHeader>

                {isLoadingOpcoes ? (
                    <LoadingSpinner />
                ) : (
                    <div className="p-4">
                        <p>O formulário com os selects dinâmicos será implementado aqui.</p>
                        <pre className="mt-4 text-xs bg-slate-100 p-2 rounded max-h-64 overflow-auto">
                            {JSON.stringify(opcoes, null, 2)}
                        </pre>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}