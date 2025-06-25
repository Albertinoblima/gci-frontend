// src/pages/saude/UnidadesSaudePage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth.js';
import unidadeSaudeService from '@/services/saude/unidadeSaudeService';
import municipioService from '@/services/municipioService.js';
import { useNotifier } from '@/contexts/NotificationContext.jsx';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Hospital, PlusCircle, Edit, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import UnidadeSaudeForm from '@/pages/saude/unidades/UnidadeSaudeForm';

export default function UnidadesSaudePage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { notify } = useNotifier();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedMunicipioId, setSelectedMunicipioId] = useState(null);

    // Para admin_sistema, permita selecionar município; para outros, use o município fixo
    const municipioId = user?.role === 'admin_sistema' ? selectedMunicipioId : user?.municipio_id;
    const queryKey = useMemo(() => ['unidadesSaude', municipioId], [municipioId]);

    // Query para carregar municípios (somente para admin_sistema)
    const { data: municipios } = useQuery({
        queryKey: ['municipios'],
        queryFn: async () => {
            const response = await municipioService.getAll();
            return response.data?.data?.municipios || [];
        },
        enabled: user?.role === 'admin_sistema',
    });

    const { data: unidades, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await unidadeSaudeService.getAll(municipioId);
            return response.data?.data?.unidades || [];
        },
        enabled: !!municipioId, // Só carrega se há um município selecionado
    });

    const mutation = useMutation({
        mutationFn: (data) => selectedItem ? unidadeSaudeService.update(selectedItem.id, data) : unidadeSaudeService.create(data),
        onSuccess: () => {
            notify(`Unidade de Saúde ${selectedItem ? 'atualizada' : 'criada'} com sucesso!`, 'success');
            queryClient.invalidateQueries({ queryKey });
            setIsFormOpen(false);
        },
        onError: (err) => {
            console.error('❌ Erro na mutação:', err);
            let errorMessage = "Ocorreu um erro.";

            if (err.response?.status === 409) {
                errorMessage = "Uma unidade com este nome já existe neste município.";
            } else if (err.response?.status === 400) {
                // Melhor tratamento para erro 400
                if (err.response?.data?.errors) {
                    const errors = err.response.data.errors;
                    errorMessage = "Dados inválidos: " + errors.map(e => e.message).join(", ");
                } else {
                    errorMessage = "Dados inválidos. Verifique os campos obrigatórios e tente novamente.";
                }
            } else if (err.response?.status === 403) {
                errorMessage = "Você não tem permissão para realizar esta ação.";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            notify(errorMessage, 'error');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => unidadeSaudeService.remove(id),
        onSuccess: () => {
            notify("Unidade de Saúde deletada com sucesso!", 'success');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (err) => {
            let errorMessage = "Falha ao deletar.";

            if (err.response?.status === 403) {
                errorMessage = "Você não tem permissão para deletar esta unidade.";
            } else if (err.response?.status === 404) {
                errorMessage = "Unidade não encontrada.";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            notify(errorMessage, 'error');
        },
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (item = null) => { setSelectedItem(item); setIsFormOpen(true); };
    const handleOpenDeleteConfirm = (item) => { setSelectedItem(item); setIsDeleteConfirmOpen(true); };

    // Admin do Sistema deve selecionar um município
    if (user?.role === 'admin_sistema' && !municipioId) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Hospital className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Unidades de Saúde</h1>
                    </div>
                </div>
                <div className="p-8 text-center space-y-4">
                    <p>Como Administrador do Sistema, selecione um município para gerenciar suas Unidades de Saúde.</p>
                    <div className="max-w-md mx-auto">
                        <Select value={selectedMunicipioId?.toString() || ''} onValueChange={(value) => setSelectedMunicipioId(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um município" />
                            </SelectTrigger>
                            <SelectContent>
                                {municipios?.map((municipio) => (
                                    <SelectItem key={municipio.id} value={municipio.id.toString()}>
                                        {municipio.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        );
    }

    // Verificação de segurança para usuário não autenticado
    if (!user) {
        return <div className="p-8 text-center">Carregando dados do usuário...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Hospital className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">Unidades de Saúde</h1>
                    {user?.role === 'admin_sistema' && municipioId && (
                        <Badge variant="outline">
                            {municipios?.find(m => m.id === municipioId)?.nome || 'Município selecionado'}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {user?.role === 'admin_sistema' && (
                        <Select value={selectedMunicipioId?.toString() || ''} onValueChange={(value) => setSelectedMunicipioId(Number(value))}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Selecione município" />
                            </SelectTrigger>
                            <SelectContent>
                                {municipios?.map((municipio) => (
                                    <SelectItem key={municipio.id} value={municipio.id.toString()}>
                                        {municipio.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Button onClick={() => handleOpenForm()} disabled={!municipioId}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Nova Unidade
                    </Button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}

            {!isLoading && !isError && (
                <div className="border rounded-lg"><Table>
                    <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {unidades?.length > 0 ? (
                            unidades.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.nome}</TableCell>
                                    <TableCell>{item.tipo_unidade || '-'}</TableCell>
                                    <TableCell><Badge variant={item.ativo ? 'success' : 'destructive'}>{item.ativo ? 'Ativa' : 'Inativa'}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleOpenDeleteConfirm(item)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (<TableRow><TableCell colSpan="4" className="text-center">Nenhuma unidade de saúde cadastrada.</TableCell></TableRow>)}
                    </TableBody>
                </Table></div>
            )}

            <UnidadeSaudeForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={() => setIsFormOpen(false)} initialData={selectedItem} mutation={mutation} municipioId={municipioId} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id)} title="Confirmar Deleção" description={`Deletar a unidade "${selectedItem?.nome}"?`} isLoading={deleteMutation.isPending} />
        </div>
    );
}