// src/pages/saude/EspecialidadesMedicasPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import especialidadeMedicaService from '@/services/saude/especialidadeMedicaService';
import { useNotifier } from '@/contexts/NotificationContext.jsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Stethoscope, PlusCircle, Edit, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

// Formulário simples para Especialidade
function EspecialidadeForm({ initialData, mutation, onFinished }) {
    const [nome, setNome] = useState(initialData?.nome_especialidade || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { nome_especialidade: nome };
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nome_especialidade" className="block text-sm font-medium mb-1">Nome da Especialidade</label>
                <Input id="nome_especialidade" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" onClick={onFinished}>Cancelar</Button></DialogClose>
                <Button type="submit" disabled={mutation.isPending}>{initialData ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
        </form>
    );
}


export default function EspecialidadesMedicasPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { notify } = useNotifier();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: especialidades, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['especialidadesMedicas'],
        queryFn: () => especialidadeMedicaService.getAll().then(res => res.data?.data?.especialidades || []),
    });

    const mutation = useMutation({
        mutationFn: (data) => {
            return selectedItem ? especialidadeMedicaService.update(selectedItem.id, data) : especialidadeMedicaService.create(data);
        },
        onSuccess: () => {
            notify(`Especialidade ${selectedItem ? 'atualizada' : 'criada'}!`, 'success');
            queryClient.invalidateQueries({ queryKey: ['especialidadesMedicas'] });
            setIsFormOpen(false);
        },
        onError: (err) => notify(err.response?.data?.message || "Ocorreu um erro.", 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => especialidadeMedicaService.remove(id),
        onSuccess: () => {
            notify("Especialidade deletada!", 'success');
            queryClient.invalidateQueries({ queryKey: ['especialidadesMedicas'] });
        },
        onError: (err) => notify(err.response?.data?.message || "Falha ao deletar.", 'error'),
        onSettled: () => setIsDeleteConfirmOpen(false),
    });

    const handleOpenForm = (item = null) => { setSelectedItem(item); setIsFormOpen(true); };
    const handleOpenDeleteConfirm = (item) => { setSelectedItem(item); setIsDeleteConfirmOpen(true); };

    // Verificação de segurança para usuário não autenticado
    if (!user) {
        return <div className="p-8 text-center">Carregando dados do usuário...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><Stethoscope className="w-8 h-8" /><h1 className="text-2xl font-bold">Especialidades Médicas</h1></div>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Nova Especialidade</Button>
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error.message} onRetry={refetch} />}

            {!isLoading && !isError && (
                <div className="border rounded-lg"><Table>
                    <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {especialidades?.length > 0 ? (
                            especialidades.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.nome_especialidade}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleOpenDeleteConfirm(item)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (<TableRow><TableCell colSpan="2" className="text-center">Nenhuma especialidade cadastrada.</TableCell></TableRow>)}
                    </TableBody>
                </Table></div>
            )}

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Editar' : 'Nova'} Especialidade</DialogTitle>
                        <DialogDescription>
                            {selectedItem ? 'Edite as informações da especialidade médica.' : 'Preencha as informações para cadastrar uma nova especialidade médica.'}
                        </DialogDescription>
                    </DialogHeader>
                    <EspecialidadeForm initialData={selectedItem} mutation={mutation} onFinished={() => setIsFormOpen(false)} />
                </DialogContent>
            </Dialog>

            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={() => deleteMutation.mutate(selectedItem.id)} title="Confirmar Deleção" description={`Deletar "${selectedItem?.nome_especialidade}"?`} isLoading={deleteMutation.isPending} />
        </div>
    );
}