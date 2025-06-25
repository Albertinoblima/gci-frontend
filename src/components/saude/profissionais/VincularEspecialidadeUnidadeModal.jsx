import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import profissionalSaudeService from '@/services/saude/profissionalSaudeService';
import { useNotifier } from '@/contexts/NotificationContext';
import { Loader2, Link2 } from 'lucide-react';

export default function VincularEspecialidadeUnidadeModal({ isOpen, onClose, profissional, municipioId }) {
    const queryClient = useQueryClient();
    const { notifySuccess, notifyError } = useNotifier();
    const [form, setForm] = useState({ especialidade_id: '', unidade_id: '' });
    const [error, setError] = useState(null);

    // Busca especialidades do município
    const { data: especialidades, isLoading: loadingEspecialidades } = useQuery({
        queryKey: ['especialidades', municipioId],
        queryFn: () => profissionalSaudeService.getEspecialidades(municipioId),
        enabled: isOpen && !!municipioId
    });

    // Busca unidades de saúde do município
    const { data: unidades, isLoading: loadingUnidades } = useQuery({
        queryKey: ['unidadesSaude', municipioId],
        queryFn: () => profissionalSaudeService.getUnidadesSaude(municipioId),
        enabled: isOpen && !!municipioId
    });

    // Busca vínculos já existentes
    const { data: vinculos, isLoading: loadingVinculos } = useQuery({
        queryKey: ['vinculosProfissional', profissional?.id],
        queryFn: () => profissionalSaudeService.getVinculos(profissional.id),
        enabled: isOpen && !!profissional?.id
    });

    // Mutação para criar vínculo
    const { mutate: criarVinculo, isLoading: isSaving } = useMutation({
        mutationFn: ({ especialidade_id, unidade_id }) => profissionalSaudeService.createLink(profissional.id, { especialidade_id, unidade_id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['vinculosProfissional', profissional.id]);
            setForm({ especialidade_id: '', unidade_id: '' });
            setError(null);
            notifySuccess('Vínculo criado com sucesso!');
        },
        onError: (err) => {
            const message = err.response?.data?.message || 'Erro ao vincular especialidade e unidade.';
            setError(message);
            notifyError(message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.especialidade_id || !form.unidade_id) {
            setError('Selecione uma especialidade e uma unidade.');
            return;
        }
        criarVinculo(form);
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Vincular Especialidade e Unidade</DialogTitle>
                    <DialogDescription>
                        Selecione uma especialidade e uma unidade de saúde para vincular ao profissional.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Especialidade</label>
                        <Select value={form.especialidade_id || ''} onValueChange={v => setForm(f => ({ ...f, especialidade_id: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingEspecialidades ? 'Carregando...' : 'Selecione'} />
                            </SelectTrigger>
                            <SelectContent>
                                {especialidades?.map(e => (
                                    <SelectItem key={e.id} value={String(e.id)}>{e.nome_especialidade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block mb-1">Unidade de Saúde</label>
                        <Select value={form.unidade_id || ''} onValueChange={v => setForm(f => ({ ...f, unidade_id: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingUnidades ? 'Carregando...' : 'Selecione'} />
                            </SelectTrigger>
                            <SelectContent>
                                {unidades?.map(u => (
                                    <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving} className="gap-2">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                            Vincular
                        </Button>
                    </DialogFooter>
                </form>
                <div className="mt-6">
                    <h4 className="font-semibold mb-2">Vínculos já existentes</h4>
                    {loadingVinculos ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ul className="list-disc pl-5 space-y-1">
                            {vinculos?.length ? vinculos.map(v => (
                                <li key={v.id}>{v.especialidade_nome} em {v.unidade_nome}</li>
                            )) : <li className="text-slate-500">Nenhum vínculo cadastrado.</li>}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
