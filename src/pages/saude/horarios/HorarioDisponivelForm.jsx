import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import horarioDisponivelSaudeService from '@/services/saude/horarioDisponivelSaudeService';
import { Loader2, CalendarPlus } from 'lucide-react';

const tiposServico = [
    { value: 'consulta', label: 'Consulta' },
    { value: 'exame', label: 'Exame' },
    { value: 'outro', label: 'Outro' }
];

export default function HorarioDisponivelForm({ isOpen, onClose, onSuccess, profissionalId }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        data_inicio: '',
        data_fim: '',
        unidade_id: '',
        especialidade_id: '',
        tipo_servico: '',
        intervalo_minutos: 30
    });
    const [error, setError] = useState(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setForm({
                data_inicio: '',
                data_fim: '',
                unidade_id: '',
                especialidade_id: '',
                tipo_servico: '',
                intervalo_minutos: 30
            });
            setError(null);
        }
    }, [isOpen]);

    // Busca vínculos do profissional (unidades e especialidades)
    const { data: vinculos, isLoading: loadingVinculos } = useQuery({
        queryKey: ['vinculosProfissional', profissionalId],
        queryFn: () => horarioDisponivelSaudeService.getVinculosProfissional(profissionalId),
        enabled: isOpen && !!profissionalId
    });

    // Mutação para criar horários
    const { mutate: criarHorarios, isLoading: isSaving } = useMutation({
        mutationFn: (dados) => horarioDisponivelSaudeService.createBatch(profissionalId, dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['horariosDisponiveis'] });
            queryClient.invalidateQueries({ queryKey: ['horariosProfissional'] });
            if (onSuccess) onSuccess();
            setError(null);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Erro ao cadastrar horários.';
            setError(errorMessage);
            console.error('Erro ao criar horários:', error);
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }; const handleSubmit = (e) => {
        e.preventDefault();

        // Verificar se os valores não são os placeholders especiais
        const validUnidadeId = form.unidade_id && form.unidade_id !== 'loading' && form.unidade_id !== 'empty';
        const validEspecialidadeId = form.especialidade_id && form.especialidade_id !== 'loading' && form.especialidade_id !== 'empty';

        if (!form.data_inicio || !form.data_fim || !validUnidadeId || !validEspecialidadeId || !form.tipo_servico) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        console.log('🚀 Enviando dados:', { profissionalId, form });
        criarHorarios(form);
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Cadastrar Horários Disponíveis</DialogTitle>
                    <DialogDescription>
                        Gere horários para o profissional selecionado em lote.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Data de Início*</Label>
                        <Input type="datetime-local" name="data_inicio" value={form.data_inicio} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label>Data de Fim*</Label>
                        <Input type="datetime-local" name="data_fim" value={form.data_fim} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label>Unidade de Saúde*</Label>
                        {loadingVinculos && <p className="text-sm text-gray-500">Carregando unidades...</p>}
                        {!loadingVinculos && vinculos && (
                            <p className="text-xs text-gray-400 mb-1">
                                {vinculos.unidades?.length || 0} unidade(s) encontrada(s)
                            </p>
                        )}
                        <Select
                            value={form.unidade_id || ''}
                            onValueChange={v => {
                                // Só atualizar se não for um valor especial
                                if (v !== 'loading' && v !== 'empty') {
                                    setForm(f => ({ ...f, unidade_id: v }));
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loadingVinculos ? 'Carregando...' : 'Selecione'} />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingVinculos ? (
                                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                ) : !vinculos?.unidades || vinculos.unidades.length === 0 ? (
                                    <SelectItem value="empty" disabled>Nenhuma unidade encontrada</SelectItem>
                                ) : (
                                    vinculos.unidades.map(u => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Especialidade*</Label>
                        {loadingVinculos && <p className="text-sm text-gray-500">Carregando especialidades...</p>}
                        {!loadingVinculos && vinculos && (
                            <p className="text-xs text-gray-400 mb-1">
                                {vinculos.especialidades?.length || 0} especialidade(s) encontrada(s)
                            </p>
                        )}
                        <Select
                            value={form.especialidade_id || ''}
                            onValueChange={v => {
                                // Só atualizar se não for um valor especial
                                if (v !== 'loading' && v !== 'empty') {
                                    setForm(f => ({ ...f, especialidade_id: v }));
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loadingVinculos ? 'Carregando...' : 'Selecione'} />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingVinculos ? (
                                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                ) : !vinculos?.especialidades || vinculos.especialidades.length === 0 ? (
                                    <SelectItem value="empty" disabled>Nenhuma especialidade encontrada</SelectItem>
                                ) : (
                                    vinculos.especialidades.map(e => (
                                        <SelectItem key={e.id} value={String(e.id)}>{e.nome_especialidade}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Tipo de Serviço*</Label>
                        <Select value={form.tipo_servico || ''} onValueChange={v => setForm(f => ({ ...f, tipo_servico: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {tiposServico.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Gerar horários de X em X minutos*</Label>
                        <Input type="number" name="intervalo_minutos" min={5} max={240} step={5} value={form.intervalo_minutos} onChange={handleChange} required />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving} className="gap-2">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                            Gerar Horários
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
