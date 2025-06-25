// src/components/saude/especialidades/EspecialidadeMedicaForm.jsx
import React, { useState, useEffect } from 'react';
import { especialidadeMedicaApiService } from '../../../services/saude/especialidadeMedicaService.js';
import { useNotifier, NOTIFICATION_TYPES } from '../../../hooks/useNotifier.js';
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Save } from 'lucide-react';

export default function EspecialidadeMedicaForm({ isOpen, onClose, onSuccess, initialData }) {
    const [formData, setFormData] = useState({ nome_especialidade: '', descricao: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { notify } = useNotifier();
    const isEditing = Boolean(initialData && initialData.id);

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    nome_especialidade: initialData.nome_especialidade || '',
                    descricao: initialData.descricao || ''
                });
            } else {
                setFormData({ nome_especialidade: '', descricao: '' });
            }
            setError(null);
        }
    }, [isOpen, isEditing, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        if (!formData.nome_especialidade) {
            setError("Nome da especialidade é obrigatório.");
            setIsLoading(false); return;
        }
        try {
            if (isEditing) {
                await especialidadeMedicaApiService.update(initialData.id, formData);
                notify("Especialidade atualizada!", NOTIFICATION_TYPES.SUCCESS);
            } else {
                await especialidadeMedicaApiService.create(formData);
                notify("Especialidade criada!", NOTIFICATION_TYPES.SUCCESS);
            }
            onSuccess();
        } catch (err) {
            const apiError = err.error || `Falha ao ${isEditing ? 'atualizar' : 'criar'} especialidade.`;
            setError(apiError); notify(apiError, NOTIFICATION_TYPES.ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg dark:bg-slate-850">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Especialidade Médica' : 'Nova Especialidade Médica'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div>
                        <Label htmlFor="nome_especialidade_form">Nome da Especialidade*</Label>
                        <Input id="nome_especialidade_form" name="nome_especialidade" value={formData.nome_especialidade} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="descricao_form_especialidade">Descrição (Opcional)</Label>
                        <Textarea id="descricao_form_especialidade" name="descricao" value={formData.descricao} onChange={handleChange} rows={3} />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <DialogFooter className="mt-4">
                        <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white">
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            {isEditing ? 'Salvar' : 'Criar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}