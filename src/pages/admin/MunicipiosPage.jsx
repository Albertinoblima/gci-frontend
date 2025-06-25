// src/pages/admin/MunicipiosPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import municipioService from '@/services/municipioService';
import { useNotifier, NOTIFICATION_TYPES } from '@/contexts/NotificationContext.jsx';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, PlusCircle, Edit, Trash2, Library } from 'lucide-react';
import MunicipioForm from './MunicipioForm';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

export default function MunicipiosPage() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { notify } = useNotifier();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedMunicipio, setSelectedMunicipio] = useState(null);

    // Query para buscar municípios
    const { data: municipios = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['municipios'],
        queryFn: async () => {
            try {
                const res = await municipioService.getAll();
                return res.data?.data?.municipios || [];
            } catch (err) {
                console.error('Erro ao buscar municípios:', err);
                return [];
            }
        },
        enabled: isAuthenticated, // Só executa se estiver autenticado
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // ** CORREÇÃO CRÍTICA NA DEFINIÇÃO DA MUTAÇÃO **
    const mutation = useMutation({
        // A função agora espera um objeto com os dados e o ID (se for edição)
        mutationFn: ({ id, data }) => {
            if (id) {
                // Se o ID existe, é uma atualização
                return municipioService.update(id, data);
            }
            // Senão, é uma criação
            return municipioService.create(data);
        },
        onSuccess: () => {
            const action = selectedMunicipio ? 'atualizado' : 'criado';
            notify(`Município ${action} com sucesso!`, NOTIFICATION_TYPES.SUCCESS);
            queryClient.invalidateQueries({ queryKey: ['municipios'] });
            handleCloseForm();
        },
        onError: (err) => {
            notify(err.response?.data?.message || "Ocorreu um erro.", NOTIFICATION_TYPES.ERROR);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => municipioService.remove(id),
        onSuccess: () => {
            notify("Município deletado com sucesso!", NOTIFICATION_TYPES.SUCCESS);
            queryClient.invalidateQueries({ queryKey: ['municipios'] });
        },
        onError: (err) => notify(err.response?.data?.message || "Falha ao deletar.", NOTIFICATION_TYPES.ERROR),
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (municipio = null) => {
        setSelectedMunicipio(municipio);
        setIsFormOpen(true);
    };
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedMunicipio(null);
    };
    const handleOpenDeleteConfirm = (municipio) => {
        setSelectedMunicipio(municipio);
        setIsDeleteConfirmOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><Building2 className="w-8 h-8 text-slate-700" /><h1 className="text-2xl font-bold">Gerenciar Municípios</h1></div>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Novo Município</Button>
            </div>

            {isLoading && <LoadingSpinner text="Carregando municípios..." />}
            {error && <ErrorMessage message={error?.message || 'Erro ao carregar!'} onRetry={refetch} />}

            {!isLoading && !error && (
                <div className="border rounded-lg"><Table>
                    <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Sigla</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {municipios?.length > 0 ? (
                            municipios.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell className="font-medium">{m.nome}</TableCell>
                                    <TableCell>{m.sigla_protocolo}</TableCell>
                                    <TableCell><Badge variant={m.ativo ? 'success' : 'destructive'}>{m.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" title="Gerenciar Secretarias" onClick={() => navigate(`/admin/municipios/${m.id}/secretarias`)}><Library className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" title="Editar Município" onClick={() => handleOpenForm(m)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" title="Deletar Município" onClick={() => handleOpenDeleteConfirm(m)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (<TableRow><TableCell colSpan="4" className="text-center">Nenhum município cadastrado.</TableCell></TableRow>)}
                    </TableBody>
                </Table></div>
            )}

            {/* O formulário agora só precisa saber qual mutação chamar */}
            <MunicipioForm isOpen={isFormOpen} onClose={handleCloseForm} onSuccess={handleCloseForm} initialData={selectedMunicipio} mutation={mutation} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={() => deleteMutation.mutate(selectedMunicipio.id)} title="Confirmar Deleção" description={`Deletar "${selectedMunicipio?.nome}"?`} isLoading={deleteMutation.isPending} />
        </div>
    );
}