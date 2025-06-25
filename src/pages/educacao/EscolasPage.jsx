// src/pages/educacao/EscolasPage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import escolaService from '@/services/educacao/escolaService';
import { useNotifier } from '@/contexts/NotificationContext.jsx';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { School, PlusCircle, Edit, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EscolaForm from '@/components/educacao/escolas/EscolaForm';

export default function EscolasPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { notify } = useNotifier();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const queryKey = useMemo(() => ['escolas', user?.role, user?.municipio_id], [user]);


    // Sempre filtra por município, exceto admin_sistema
    const { data: escolas, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: () => {
            if (user?.role === 'admin_sistema') {
                return escolaService.getAll().then(res => res.data?.data?.escolas || []);
            }
            return escolaService.getAll({ municipio_id: user?.municipio_id }).then(res => res.data?.data?.escolas || []);
        },
        enabled: !!user && (user?.role === 'admin_sistema' || !!user?.municipio_id),
    });

    const mutation = useMutation({
        mutationFn: (data) => selectedItem ? escolaService.update(selectedItem.id, data) : escolaService.create(data),
        onSuccess: () => {
            notify(`Escola ${selectedItem ? 'atualizada' : 'criada'}!`, 'success');
            queryClient.invalidateQueries({ queryKey });
            setIsFormOpen(false);
        },
        onError: (err) => notify(err.response?.data?.message || "Ocorreu um erro.", 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => escolaService.remove(id),
        onSuccess: () => {
            notify("Escola deletada!", 'success');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (err) => notify(err.response?.data?.message || "Falha ao deletar.", 'error'),
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (item = null) => { setSelectedItem(item); setIsFormOpen(true); };
    const handleOpenDeleteConfirm = (item) => { setSelectedItem(item); setIsDeleteConfirmOpen(true); };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><School className="w-8 h-8" /><h1 className="text-2xl font-bold">Gerenciar Escolas</h1></div>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Nova Escola</Button>
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}


            {!isLoading && !isError && (
                <div className="border rounded-lg"><Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            {user?.role === 'admin_sistema' && <TableHead>Município</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {escolas?.length > 0 ? (
                            escolas.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.nome}</TableCell>
                                    <TableCell>{item.tipo_escola || '-'}</TableCell>
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
                                    <TableCell><Badge variant={item.ativo ? 'success' : 'destructive'}>{item.ativo ? 'Ativa' : 'Inativa'}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleOpenDeleteConfirm(item)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (<TableRow><TableCell colSpan={user?.role === 'admin_sistema' ? 5 : 4} className="text-center">Nenhuma escola cadastrada.</TableCell></TableRow>)}
                    </TableBody>
                </Table></div>
            )}

            <EscolaForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={() => setIsFormOpen(false)} initialData={selectedItem} mutation={mutation} />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id)} title="Confirmar Deleção" description={`Deletar a escola "${selectedItem?.nome}"?`} isLoading={deleteMutation.isPending} />
        </div>
    );
}