// src/pages/SecretariasPage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import secretariaService from '@/services/secretariaService';
import municipioService from '@/services/municipioService';
import { useNotifier, NOTIFICATION_TYPES } from '@/contexts/NotificationContext.jsx';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Library, PlusCircle, Edit, Trash2, ArrowLeft, BookMarked } from 'lucide-react';
import SecretariaForm from '@/components/secretarias/SecretariaForm';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

export default function SecretariasPage() {
    const { municipioId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { notify } = useNotifier();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedSecretaria, setSelectedSecretaria] = useState(null);

    const queryKey = useMemo(() => ['secretarias', municipioId], [municipioId]);

    // Busca dados do município para exibir o título da página
    const { data: municipio, isLoading: isLoadingMunicipio } = useQuery({
        queryKey: ['municipio', municipioId],
        queryFn: () => municipioService.getById(municipioId).then(res => res.data.data.municipio),
    });

    // Busca a lista de secretarias
    const { data: secretarias, isLoading: isLoadingSecretarias, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: () => secretariaService.getAllByMunicipio(municipioId).then(res => res.data.data.secretarias),
        enabled: !!municipioId, // Só executa a query se o municipioId existir
    });

    // Mutação para criar ou atualizar uma secretaria
    const mutation = useMutation({
        mutationFn: ({ secretariaId, data }) => secretariaId
            ? secretariaService.update(municipioId, secretariaId, data)
            : secretariaService.create(municipioId, data),
        onSuccess: () => {
            notify(`Secretaria ${selectedSecretaria ? 'atualizada' : 'criada'} com sucesso!`, NOTIFICATION_TYPES.SUCCESS);
            queryClient.invalidateQueries({ queryKey });
            handleCloseForm();
        },
        onError: (err) => notify(err.response?.data?.message || "Ocorreu um erro.", NOTIFICATION_TYPES.ERROR),
    });

    // Mutação para deletar uma secretaria
    const deleteMutation = useMutation({
        mutationFn: (secretariaId) => secretariaService.remove(municipioId, secretariaId),
        onSuccess: () => {
            notify("Secretaria deletada com sucesso!", NOTIFICATION_TYPES.SUCCESS);
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (err) => notify(err.response?.data?.message || "Falha ao deletar.", NOTIFICATION_TYPES.ERROR),
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (secretaria = null) => { setSelectedSecretaria(secretaria); setIsFormOpen(true); };
    const handleCloseForm = () => setIsFormOpen(false);
    const handleOpenDeleteConfirm = (secretaria) => { setSelectedSecretaria(secretaria); setIsDeleteConfirmOpen(true); };

    if (isLoadingMunicipio) return <LoadingSpinner text="Carregando dados do município..." />;

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => navigate('/admin/municipios')}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Municípios</Button>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Library className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold">Secretarias de {municipio?.nome}</h1>
                        <p className="text-slate-500">Gerencie as secretarias deste município.</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Nova Secretaria</Button>
            </div>

            {isLoadingSecretarias && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}

            {!isLoadingSecretarias && !isError && (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead className="hidden sm:table-cell">Email</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {secretarias?.length > 0 ? (
                                secretarias.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.nome}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{s.email_responsavel || '-'}</TableCell>
                                        <TableCell><Badge variant={s.ativo ? 'success' : 'destructive'}>{s.ativo ? 'Ativa' : 'Inativa'}</Badge></TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="icon" title="Gerenciar Serviços" onClick={() => navigate(`/admin/municipios/${municipioId}/secretarias/${s.id}/servicos`)}><BookMarked className="h-4 w-4" /></Button>
                                            <Button variant="outline" size="icon" onClick={() => handleOpenForm(s)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleOpenDeleteConfirm(s)}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (<TableRow><TableCell colSpan="4" className="text-center">Nenhuma secretaria cadastrada.</TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            )}

            <SecretariaForm isOpen={isFormOpen} onClose={handleCloseForm} onSuccess={handleCloseForm} initialData={selectedSecretaria} mutation={mutation} municipioId={municipioId} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={() => deleteMutation.mutate(selectedSecretaria.id)} title="Confirmar Deleção" description={`Deletar "${selectedSecretaria?.nome}"?`} isLoading={deleteMutation.isPending} />
        </div>
    );
}