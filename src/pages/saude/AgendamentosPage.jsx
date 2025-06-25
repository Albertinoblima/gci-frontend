// src/pages/saude/AgendamentosPage.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, PlusCircle } from 'lucide-react';
import AgendamentoFormModal from '@/components/saude/profissionais/AgendamentoFormModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import agendamentoSaudeService from '@/services/saude/agendamentoSaudeService';

// Componente para listar os agendamentos existentes
function ListaDeAgendamentos() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['agendamentos'],
        queryFn: async () => {
            try {
                const response = await agendamentoSaudeService.listAgendamentos();

                // A resposta pode ter diferentes estruturas, vamos ser flexíveis
                const agendamentos = response.data?.agendamentos ||
                    response.data?.data?.agendamentos ||
                    response.agendamentos ||
                    [];

                return agendamentos;
            } catch (error) {
                console.error('❌ Erro ao buscar agendamentos:', error);
                throw error;
            }
        }
    });

    if (isLoading) return <LoadingSpinner text="Carregando agendamentos..." />;
    if (isError) {
        console.error('❌ Erro ao carregar agendamentos:', error);
        return (
            <div className="text-center py-4">
                <p className="text-red-500 mb-2">Erro ao carregar agendamentos</p>
                <p className="text-sm text-gray-600">{error.message}</p>
            </div>
        );
    }

    // Tabela de agendamentos iria aqui...
    return (
        <div className="text-center py-4">
            <p className="text-lg">{data?.length || 0} agendamentos encontrados.</p>
            {data?.length === 0 && (
                <p className="text-sm text-gray-600 mt-2">
                    Nenhum agendamento cadastrado ainda.
                </p>
            )}
        </div>
    );
}

export default function AgendamentosPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <CalendarCheck className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">Agenda de Consultas e Exames</h1>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
                </Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Agendamentos Futuros</CardTitle></CardHeader>
                <CardContent>
                    <ListaDeAgendamentos />
                </CardContent>
            </Card>

            <AgendamentoFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
            />
        </div>
    );
}