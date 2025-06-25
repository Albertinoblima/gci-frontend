// src/pages/educacao/SolicitacoesMatriculaPage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import matriculaService from '@/services/educacao/matriculaService';
import { useNotifier } from '@/contexts/NotificationContext.jsx';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Filter, Edit } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
// Vamos precisar de um modal para atualizar o status
import SolicitacaoMatriculaForm from '@/components/educacao/matriculas/SolicitacaoMatriculaForm';

export default function SolicitacoesMatriculaPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { notify } = useNotifier();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const queryKey = useMemo(() => ['solicitacoesMatricula', user?.role, user?.municipio_id], [user]);


    // Sempre filtra por município, exceto admin_sistema
    const { data: solicitacoes = [], isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            try {
                if (user?.role === 'admin_sistema') {
                    const res = await matriculaService.getAll();
                    return res.data?.data?.solicitacoes || [];
                }
                const res = await matriculaService.getAll({ municipio_id: user?.municipio_id });
                return res.data?.data?.solicitacoes || [];
            } catch (err) {
                console.error('Erro ao buscar solicitações:', err);
                return [];
            }
        },
        enabled: !!user && (user?.role === 'admin_sistema' || !!user?.municipio_id),
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    const updateMutation = useMutation({
        mutationFn: (data) => matriculaService.update(selectedItem.id, data),
        onSuccess: () => {
            notify("Status da solicitação atualizado!", 'success');
            queryClient.invalidateQueries({ queryKey });
            setIsFormOpen(false);
        },
        onError: (err) => notify(err.response?.data?.message || "Ocorreu um erro.", 'error'),
    });

    const handleOpenForm = (item) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3"><ClipboardList className="w-8 h-8" /><h1 className="text-2xl font-bold">Solicitações de Matrícula</h1></div>

            {/* TODO: Adicionar Filtros (por escola, por status, etc.) */}

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}


            {!isLoading && !isError && (
                <div className="border rounded-lg"><Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Protocolo</TableHead>
                            <TableHead>Aluno</TableHead>
                            <TableHead>Escola Solicitada</TableHead>
                            {user?.role === 'admin_sistema' && <TableHead>Município</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {solicitacoes?.length > 0 ? (
                            solicitacoes.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">{item.atendimento?.protocolo_str || 'N/A'}</TableCell>
                                    <TableCell className="font-medium">{item.nome_aluno}</TableCell>
                                    <TableCell>{item.escola?.nome || 'Não informada'}</TableCell>
                                    {user?.role === 'admin_sistema' && (
                                        <TableCell>
                                            {item.municipio_nome ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.municipio_nome}</span>
                                                    {item.municipio_estado && (
                                                        <span className="text-sm text-gray-500">{item.municipio_estado}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant="outline">Sem município</Badge>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell><Badge>{item.status_solicitacao}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(item)}><Edit className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (<TableRow><TableCell colSpan={user?.role === 'admin_sistema' ? 6 : 5} className="text-center">Nenhuma solicitação de matrícula encontrada.</TableCell></TableRow>)}
                    </TableBody>
                </Table></div>
            )}

            <SolicitacaoMatriculaForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={() => setIsFormOpen(false)} initialData={selectedItem} mutation={updateMutation} />
        </div>
    );
}