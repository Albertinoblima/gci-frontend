// src/pages/ServicosPage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import servicoService from '@/services/servicoService';
import { useNotifier } from '@/contexts/NotificationContext.jsx';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookMarked, PlusCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';
import ServicoForm from '@/components/servicos/ServicoForm';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

export default function ServicosPage() {
    const { municipioId, secretariaId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { notify } = useNotifier();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedServico, setSelectedServico] = useState(null);

    const queryKey = useMemo(() => ['servicos', secretariaId], [secretariaId]);

    const { data: servicos, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: () => servicoService.getAllBySecretaria(municipioId, secretariaId).then(res => res.data.data.servicos),
        enabled: !!secretariaId,
    });

    const mutation = useMutation({
        mutationFn: (data) => selectedServico ? servicoService.update(municipioId, secretariaId, selectedServico.id, data) : servicoService.create(municipioId, secretariaId, data),
        onSuccess: () => {
            notify(`Serviço ${selectedServico ? 'atualizado' : 'criado'}!`, 'success');
            queryClient.invalidateQueries({ queryKey });
            setIsFormOpen(false);
        },
        onError: (err) => notify(err.response?.data?.message || "Ocorreu um erro.", 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (servicoId) => servicoService.remove(municipioId, secretariaId, servicoId),
        onSuccess: () => {
            notify("Serviço deletado!", 'success');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (err) => notify(err.response?.data?.message || "Falha ao deletar.", 'error'),
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (servico = null) => { setSelectedServico(servico); setIsFormOpen(true); };
    const handleOpenDeleteConfirm = (servico) => { setSelectedServico(servico); setIsDeleteConfirmOpen(true); };

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => navigate(`/admin/municipios/${municipioId}/secretarias`)}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Secretarias</Button>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><BookMarked className="w-8 h-8" /><h1 className="text-2xl font-bold">Serviços da Secretaria</h1></div>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço</Button>
            </div>
            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}
            {!isLoading && !isError && (
                <div className="border rounded-lg"><Table>
                    <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {servicos?.length > 0 ? (
                            servicos.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">{s.nome}</TableCell>
                                    <TableCell>{s.tipo_servico}</TableCell>
                                    <TableCell><Badge variant={s.ativo ? 'success' : 'destructive'}>{s.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(s)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleOpenDeleteConfirm(s)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (<TableRow><TableCell colSpan="4" className="text-center">Nenhum serviço cadastrado.</TableCell></TableRow>)}
                    </TableBody>
                </Table></div>
            )}
            <ServicoForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={() => setIsFormOpen(false)} initialData={selectedServico} mutation={mutation} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={() => deleteMutation.mutate(selectedServico.id)} title="Confirmar Deleção" description={`Deletar o serviço "${selectedServico?.nome}"?`} isLoading={deleteMutation.isPending} />
        </div>
    );
}