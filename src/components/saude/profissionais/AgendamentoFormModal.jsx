// src/components/saude/profissionais/AgendamentoFormModal.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
// Importar todos os serviços necessários
import unidadeSaudeService from '@/services/saude/unidadeSaudeService';
import especialidadeMedicaService from '@/services/saude/especialidadeMedicaService';
import profissionalSaudeService from '@/services/saude/profissionalSaudeService';
import horarioDisponivelSaudeService from '@/services/saude/horarioDisponivelSaudeService';
import { agendamentoSaudeApiService as agendamentoSaudeService } from '@/services/saude/agendamentoSaudeService';
import { useNotifier } from '@/contexts/NotificationContext';
import { useAuth } from '@/hooks/useAuth';

export default function AgendamentoFormModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { notify } = useNotifier();

    const [unidadeId, setUnidadeId] = useState('');
    const [especialidadeId, setEspecialidadeId] = useState('');
    const [profissionalId, setProfissionalId] = useState('');
    const [horarioId, setHorarioId] = useState('');
    const [cidadaoId, setCidadaoId] = useState(''); // Agente precisaria buscar o cidadão

    // --- Lógica de busca em cascata ---
    const { data: unidades } = useQuery({ queryKey: ['unidadesSaude', user?.municipio_id], queryFn: () => unidadeSaudeService.getAllByMunicipio(user.municipio_id).then(res => res.data.data.unidades), enabled: !!user?.municipio_id });
    const { data: especialidades } = useQuery({ queryKey: ['especialidadesMedicas'], queryFn: () => especialidadeMedicaService.getAll().then(res => res.data.data.especialidades) });
    const { data: profissionais } = useQuery({ queryKey: ['profissionaisPorUnidadeEspecialidade', unidadeId, especialidadeId], queryFn: () => profissionalSaudeService.getAll({ unidadeId, especialidadeId }).then(res => res.data.data.profissionais), enabled: !!unidadeId && !!especialidadeId });
    const { data: horarios } = useQuery({ queryKey: ['horariosDisponiveis', profissionalId], queryFn: () => horarioDisponivelSaudeService.getAll({ profissionalId, status_slot: 'disponivel' }).then(res => res.data.data.horarios), enabled: !!profissionalId });

    const mutation = useMutation({
        mutationFn: (agendamentoData) => agendamentoSaudeService.create(agendamentoData),
        onSuccess: () => {
            notify('Agendamento realizado com sucesso!', 'success');
            queryClient.invalidateQueries(['agendamentos']);
            onSuccess();
        },
        onError: (err) => notify(err.response?.data?.message || 'Falha ao agendar.', 'error')
    });

    const handleSubmit = () => {
        // TODO: Adicionar busca de cidadão para obter o ID
        if (!horarioId || !cidadaoId) {
            notify('Por favor, preencha todos os campos.', 'warning');
            return;
        }
        mutation.mutate({ horario_disponivel_id: horarioId, cidadao_id: cidadaoId });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para agendar uma consulta ou exame para o cidadão selecionado.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Passo 1: Buscar Cidadão (simplificado com um input por agora) */}
                    <div><label>ID do Cidadão</label><input onChange={(e) => setCidadaoId(e.target.value)} className="w-full p-2 border rounded" /></div>

                    {/* Passo 2: Filtros em Cascata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select onValueChange={setUnidadeId}><SelectTrigger><SelectValue placeholder="Selecione a Unidade" /></SelectTrigger><SelectContent>{unidades?.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>)}</SelectContent></Select>
                        <Select onValueChange={setEspecialidadeId}><SelectTrigger><SelectValue placeholder="Selecione a Especialidade" /></SelectTrigger><SelectContent>{especialidades?.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.nome_especialidade}</SelectItem>)}</SelectContent></Select>
                        <Select onValueChange={setProfissionalId} disabled={!profissionais}><SelectTrigger><SelectValue placeholder="Selecione o Profissional" /></SelectTrigger><SelectContent>{profissionais?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome_completo}</SelectItem>)}</SelectContent></Select>
                    </div>

                    {/* Passo 3: Selecionar o Horário */}
                    {horarios && (
                        <div>
                            <label>Horários Disponíveis</label>
                            <Select onValueChange={setHorarioId}><SelectTrigger><SelectValue placeholder="Selecione um horário" /></SelectTrigger><SelectContent>
                                {horarios.map(h => <SelectItem key={h.id} value={String(h.id)}>{new Date(h.data_horario_inicio).toLocaleString('pt-BR')}</SelectItem>)}
                            </SelectContent></Select>
                        </div>
                    )}

                    <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Agendamento
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}