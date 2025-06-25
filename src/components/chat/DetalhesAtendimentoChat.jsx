// src/components/chat/DetalhesAtendimentoChat.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import cidadaoService from '@/services/cidadaoService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Mail } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function DetalhesAtendimentoChat({ atendimento }) {
    const cidadaoId = atendimento?.cidadao_id;

    const { data: cidadao, isLoading } = useQuery({
        queryKey: ['cidadao', cidadaoId],
        queryFn: () => cidadaoService.getById(cidadaoId).then(res => res.data.data.cidadao),
        enabled: !!cidadaoId,
    });

    if (!atendimento) return null; // Não renderiza nada se não houver atendimento selecionado

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-900 p-4 space-y-4">
            <Card>
                <CardHeader><CardTitle>Detalhes do Atendimento</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><strong>Protocolo:</strong> {atendimento.protocolo_str}</p>
                    <p><strong>Status:</strong> {atendimento.status}</p>
                    <p><strong>Secretaria:</strong> {atendimento.secretaria_nome || 'N/D'}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Informações do Cidadão</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                    {isLoading && <LoadingSpinner />}
                    {cidadao && (
                        <>
                            <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{cidadao.nome_perfil_canal}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{cidadao.telefone_principal || 'Não informado'}</span></div>
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{cidadao.email_principal || 'Não informado'}</span></div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}