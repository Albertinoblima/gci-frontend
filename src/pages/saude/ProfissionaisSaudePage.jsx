// src/pages/saude/ProfissionaisSaudePage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import profissionalSaudeService from '@/services/saude/profissionalSaudeService';
import { useAuth } from '@/hooks/useAuth';
import municipioService from '@/services/municipioService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifier } from '@/contexts/NotificationContext';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, PlusCircle, Edit, Trash2, Link2 } from 'lucide-react'; // Substituído UserMd por User
import ProfissionalSaudeForm from '@/components/saude/profissionais/ProfissionalSaudeForm';
import VincularEspecialidadeUnidadeModal from '@/components/saude/profissionais/VincularEspecialidadeUnidadeModal';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

export default function ProfissionaisSaudePage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { notify } = useNotifier();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Determinar município padrão baseado no usuário
    const isUserAdminSistema = user?.role === 'admin_sistema';
    const defaultMunicipioId = !isUserAdminSistema ? user?.municipio_id : null;

    const [municipioSelecionadoId, setMunicipioSelecionadoId] = useState(defaultMunicipioId);

    // Carregar municípios para admin_sistema
    const { data: municipios } = useQuery({
        queryKey: ['municipios'],
        queryFn: async () => {
            const response = await municipioService.getAll();
            return response.data?.data?.municipios || [];
        },
        enabled: isUserAdminSistema,
    });

    const queryKey = useMemo(() => ['profissionaisSaude', user?.role, municipioSelecionadoId], [user, municipioSelecionadoId]);

    const { data: profissionais, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: () => {
            let params = {};
            if (isUserAdminSistema) {
                // Para admin_sistema, exige município selecionado
                params.municipio_id = municipioSelecionadoId;
            }
            return profissionalSaudeService.getAll(params).then(res => res.data?.data?.profissionais || []);
        },
        enabled: !!user && (isUserAdminSistema ? !!municipioSelecionadoId : !!user?.municipio_id),
    });

    const mutation = useMutation({
        mutationFn: (data) => selectedItem ? profissionalSaudeService.update(selectedItem.id, data) : profissionalSaudeService.create(data),
        onSuccess: () => {
            notify(`Profissional ${selectedItem ? 'atualizado' : 'criado'}!`, 'success');
            queryClient.invalidateQueries({ queryKey });
            setIsFormOpen(false);
        },
        onError: (err) => notify(err.response?.data?.message || "Ocorreu um erro.", 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => profissionalSaudeService.remove(id),
        onSuccess: () => {
            notify("Profissional deletado!", 'success');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (err) => notify(err.response?.data?.message || "Falha ao deletar.", 'error'),
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (item = null) => { setSelectedItem(item); setIsFormOpen(true); };
    const handleOpenLinkModal = (item) => { setSelectedItem(item); setIsLinkModalOpen(true); };
    const handleOpenDeleteConfirm = (item) => { setSelectedItem(item); setIsDeleteConfirmOpen(true); };

    // Verificação de segurança para usuário não autenticado
    if (!user) {
        return <div className="p-8 text-center">Carregando dados do usuário...</div>;
    }

    // Se admin_sistema e não selecionou município, força seleção
    if (isUserAdminSistema && !municipioSelecionadoId) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <User className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Profissionais de Saúde</h1>
                    </div>
                </div>
                <div className="p-8 text-center space-y-4">
                    <p>Como Administrador do Sistema, selecione um município para gerenciar os profissionais.</p>
                    <div className="max-w-md mx-auto">
                        <Select value={municipioSelecionadoId?.toString() || ''} onValueChange={value => setMunicipioSelecionadoId(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Escolha um município..." />
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><User className="w-8 h-8" /><h1 className="text-2xl font-bold">Profissionais de Saúde</h1></div>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Novo Profissional</Button>
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}

            {!isLoading && !isError && (
                <div className="border rounded-lg"><Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Registro</TableHead>
                            {isUserAdminSistema && <TableHead>Município</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profissionais?.length > 0 ? (
                            profissionais.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.nome_completo}</TableCell>
                                    <TableCell>{p.registro_conselho}</TableCell>
                                    {isUserAdminSistema && <TableCell>{p.municipio_nome || 'Não informado'}</TableCell>}
                                    <TableCell><Badge variant={p.ativo ? 'success' : 'destructive'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" title="Vincular Especialidade/Unidade" onClick={() => handleOpenLinkModal(p)}><Link2 className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" title="Editar" onClick={() => handleOpenForm(p)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" title="Deletar" onClick={() => handleOpenDeleteConfirm(p)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (<TableRow><TableCell colSpan={isUserAdminSistema ? "5" : "4"} className="text-center">Nenhum profissional cadastrado.</TableCell></TableRow>)}
                    </TableBody>
                </Table></div>
            )}

            <ProfissionalSaudeForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
                initialData={selectedItem}
                mutation={mutation}
                defaultMunicipioId={defaultMunicipioId}
                isUserAdminSistema={isUserAdminSistema}
            />
            <VincularEspecialidadeUnidadeModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} profissional={selectedItem} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id)} title="Confirmar Deleção" description={`Deletar "${selectedItem?.nome_completo}"?`} isLoading={deleteMutation.isPending} />
        </div>
    );
}