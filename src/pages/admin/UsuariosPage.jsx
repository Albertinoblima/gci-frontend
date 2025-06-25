// src/pages/admin/UsuariosPage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth.js';
import { useHierarchy } from '@/components/security/HierarchyGuard.jsx';
import usuarioService from '@/services/usuarioService.js';
import { useNotifier, NOTIFICATION_TYPES } from '@/contexts/NotificationContext.jsx';
import { useDebounce } from '@/hooks/useDebounce.js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, PlusCircle, Edit, Trash2, Search, Shield } from 'lucide-react';
import UsuarioForm from '@/components/usuarios/UsuarioForm.jsx';
import ConfirmationModal from '@/components/shared/ConfirmationModal.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import ErrorMessage from '@/components/shared/ErrorMessage.jsx';

export default function UsuariosPage() {
    const queryClient = useQueryClient();
    const { user: usuarioLogado, isAuthenticated } = useAuth();
    const { canManageUser, isUserVisible } = useHierarchy();
    const { notify } = useNotifier();

    const [filters, setFilters] = useState({ search: '' });
    const debouncedSearch = useDebounce(filters.search, 500);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);


    // Sempre filtra por município, exceto admin_sistema
    const queryKey = useMemo(() => ['usuarios', { search: debouncedSearch, municipio_id: usuarioLogado?.role === 'admin_sistema' ? undefined : usuarioLogado?.municipio_id }], [debouncedSearch, usuarioLogado]);

    const { data: usuariosData, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: () => {
            const params = { search: debouncedSearch };
            if (usuarioLogado?.role !== 'admin_sistema') {
                params.municipio_id = usuarioLogado?.municipio_id;
            }
            return usuarioService.getAll(params).then(res => res.data.data.usuarios);
        },
        enabled: isAuthenticated,
        select: (data) => {
            // Camada adicional de segurança no frontend
            return data?.filter(usuario => isUserVisible(usuario)) || [];
        }
    });

    const mutation = useMutation({
        mutationFn: (data) => selectedUser?.id ? usuarioService.update(selectedUser.id, data) : usuarioService.create(data),
        onSuccess: (data, variables) => {
            const action = selectedUser?.id ? 'atualizado' : 'criado';
            notify(`Usuário ${action} com sucesso!`, NOTIFICATION_TYPES.SUCCESS);
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            handleCloseForm();
        },
        onError: (err) => notify(err.response?.data?.message || "Ocorreu um erro.", NOTIFICATION_TYPES.ERROR),
    });

    const deleteMutation = useMutation({
        mutationFn: usuarioService.remove,
        onSuccess: () => {
            notify("Usuário deletado com sucesso!", NOTIFICATION_TYPES.SUCCESS);
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        },
        onError: (err) => notify(err.response?.data?.message || "Falha ao deletar.", NOTIFICATION_TYPES.ERROR),
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (usuario = null) => {
        setSelectedUser(usuario);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => setIsFormOpen(false);

    const handleOpenDeleteConfirm = (usuario) => {
        // CORREÇÃO CRÍTICA: Verificar se pode deletar antes de abrir modal
        if (!canManageUser(usuario, 'delete')) {
            notify("Você não tem permissão para deletar este usuário.", NOTIFICATION_TYPES.ERROR);
            return;
        }
        setSelectedUser(usuario);
        setIsDeleteConfirmOpen(true);
    };

    const handleEditUser = (usuario) => {
        // CORREÇÃO CRÍTICA: Verificar se pode editar antes de abrir form
        if (!canManageUser(usuario, 'edit')) {
            notify("Você não tem permissão para editar este usuário.", NOTIFICATION_TYPES.ERROR);
            return;
        }
        handleOpenForm(usuario);
    };

    // Função para determinar se deve mostrar as ações
    const shouldShowActions = (usuario) => {
        return canManageUser(usuario, 'edit') || canManageUser(usuario, 'delete');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
                    {usuarioLogado?.role !== 'admin_sistema' && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Acesso Restrito
                        </Badge>
                    )}
                </div>
                <Button onClick={() => handleOpenForm()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                    placeholder="Buscar por nome..."
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                />
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}

            {!isLoading && !isError && (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead className="hidden sm:table-cell">Email</TableHead>
                                <TableHead className="hidden md:table-cell">Função</TableHead>
                                {usuarioLogado?.role === 'admin_sistema' && (
                                    <TableHead className="hidden lg:table-cell">Município</TableHead>
                                )}
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuariosData?.length > 0 ? (
                                usuariosData.map((usuario) => (
                                    <TableRow key={usuario.id}>
                                        <TableCell className="font-medium">{usuario.nome_completo}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{usuario.email}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                {usuario.role}
                                                {usuario.role === 'admin_sistema' && (
                                                    <Shield className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        {usuarioLogado?.role === 'admin_sistema' && (
                                            <TableCell className="hidden lg:table-cell">
                                                {usuario.municipio_nome ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{usuario.municipio_nome}</span>
                                                        {usuario.municipio_estado && (
                                                            <span className="text-sm text-gray-500">{usuario.municipio_estado}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline">Sem município</Badge>
                                                )}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Badge variant={usuario.ativo ? 'success' : 'destructive'}>
                                                {usuario.ativo ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {shouldShowActions(usuario) ? (
                                                <div className="space-x-2">
                                                    {canManageUser(usuario, 'edit') && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleEditUser(usuario)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {canManageUser(usuario, 'delete') && usuarioLogado?.id !== usuario.id && (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => handleOpenDeleteConfirm(usuario)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant="secondary">Sem permissão</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={usuarioLogado?.role === 'admin_sistema' ? 6 : 5}
                                        className="text-center"
                                    >
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <UsuarioForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSuccess={handleCloseForm}
                initialData={selectedUser}
                mutation={mutation}
            />

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={() => deleteMutation.mutate(selectedUser.id)}
                title="Confirmar Deleção"
                description={`Tem certeza que deseja deletar o usuário "${selectedUser?.nome_completo}"?`}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}