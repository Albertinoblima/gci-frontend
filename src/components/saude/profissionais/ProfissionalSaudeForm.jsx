import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Save } from 'lucide-react';

export default function ProfissionalSaudeForm({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    mutation,
    defaultMunicipioId,
    isUserAdminSistema
}) {
    const [formData, setFormData] = useState({
        nome_completo: '',
        registro_conselho: '',
        ativo: true,
    });
    const [error, setError] = useState(null);

    const isEditing = Boolean(initialData && initialData.id);

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                nome_completo: initialData.nome_completo || '',
                registro_conselho: initialData.registro_conselho || '',
                ativo: initialData.ativo !== undefined ? initialData.ativo : true,
            });
        } else {
            setFormData({ nome_completo: '', registro_conselho: '', ativo: true });
        }
    }, [isOpen, isEditing, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.nome_completo || !formData.registro_conselho) {
            setError('Nome completo e registro do conselho são obrigatórios.');
            return;
        }

        try {
            await mutation.mutateAsync(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao salvar profissional.');
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-850 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {isEditing ? 'Editar Profissional de Saúde' : 'Novo Profissional de Saúde'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        {isEditing ? 'Atualize os dados do profissional.' : 'Preencha os dados para cadastrar um novo profissional.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-1">
                    <div>
                        <Label htmlFor="nome_completo" className="dark:text-slate-300">Nome Completo*</Label>
                        <Input id="nome_completo" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <Label htmlFor="registro_conselho" className="dark:text-slate-300">Registro no Conselho*</Label>
                        <Input id="registro_conselho" name="registro_conselho" value={formData.registro_conselho} onChange={handleChange} required className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="ativo" name="ativo" checked={formData.ativo} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))} />
                        <Label htmlFor="ativo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300">
                            Profissional ativo
                        </Label>
                    </div>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={mutation?.isPending} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white gap-2">
                            {mutation?.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Salvar Alterações' : 'Criar Profissional'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
