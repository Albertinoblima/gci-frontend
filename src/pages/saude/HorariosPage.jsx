// src/pages/saude/HorariosPage.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import municipioService from '@/services/municipioService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import profissionalSaudeService from '@/services/saude/profissionalSaudeService';
import horarioDisponivelSaudeService from '@/services/saude/horarioDisponivelSaudeService';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Calendar, Clock, PlusCircle } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import HorarioDisponivelForm from './horarios/HorarioDisponivelForm';


export default function HorariosPage() {
    const { user } = useAuth();
    const [selectedProfissionalId, setSelectedProfissionalId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const isUserAdminSistema = user?.role === 'admin_sistema';
    const [municipioSelecionadoId, setMunicipioSelecionadoId] = useState(null);

    // Carregar municípios para admin_sistema
    const { data: municipios } = useQuery({
        queryKey: ['municipios'],
        queryFn: async () => {
            const response = await municipioService.getAll();
            return response.data?.data?.municipios || [];
        },
        enabled: isUserAdminSistema,
    });

    // Busca a lista de profissionais para o select
    const { data: profissionais, isLoading: isLoadingProfissionais } = useQuery({
        queryKey: ['profissionaisSaude', isUserAdminSistema ? municipioSelecionadoId : user?.municipio_id],
        queryFn: () => {
            let params = {};
            if (isUserAdminSistema && municipioSelecionadoId) {
                params.municipio_id = municipioSelecionadoId;
            } else if (!isUserAdminSistema && user?.municipio_id) {
                params.municipio_id = user.municipio_id;
            }
            return profissionalSaudeService.getAll(params).then(res => res.data?.data?.profissionais || []);
        },
        enabled: isUserAdminSistema ? !!municipioSelecionadoId : !!user?.municipio_id,
    });

    // Busca os horários do profissional selecionado
    const { data: horarios, isLoading: isLoadingHorarios, refetch: refetchHorarios } = useQuery({
        queryKey: ['horariosDisponiveis', selectedProfissionalId, isUserAdminSistema ? municipioSelecionadoId : user?.municipio_id],
        queryFn: () => {
            let params = { profissionalId: selectedProfissionalId };
            if (isUserAdminSistema && municipioSelecionadoId) {
                params.municipio_id = municipioSelecionadoId;
            } else if (!isUserAdminSistema && user?.municipio_id) {
                params.municipio_id = user.municipio_id;
            }
            return horarioDisponivelSaudeService.getAll(params).then(res => res.data?.data?.horarios || []);
        },
        enabled: !!selectedProfissionalId && (isUserAdminSistema ? !!municipioSelecionadoId : !!user?.municipio_id),
    });

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    const handleFormSuccess = () => {
        refetchHorarios();
        setIsFormOpen(false);
    };

    // Verificação de segurança para usuário não autenticado
    if (!user) {
        return <div className="p-8 text-center">Carregando dados do usuário...</div>;
    }

    // Se admin_sistema e não selecionou município, força seleção
    if (isUserAdminSistema && !municipioSelecionadoId) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">Gerenciamento de Agendas</h1>
                </div>
                <div className="p-8 text-center space-y-4">
                    <p>Como Administrador do Sistema, selecione um município para gerenciar as agendas.</p>
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
            <div className="flex items-center gap-3"><Calendar className="w-8 h-8" /><h1 className="text-2xl font-bold">Gerenciamento de Agendas</h1></div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-80">
                    <label className="text-sm font-medium">Selecione o Profissional</label>
                    <Select onValueChange={setSelectedProfissionalId} value={selectedProfissionalId}>
                        <SelectTrigger disabled={isLoadingProfissionais}>
                            <SelectValue placeholder="Escolha um profissional..." />
                        </SelectTrigger>
                        <SelectContent>
                            {profissionais?.map(p => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.nome_completo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button disabled={!selectedProfissionalId} className="self-end" onClick={handleOpenForm}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Horário
                </Button>
            </div>

            {selectedProfissionalId && (
                <div className="mt-6">
                    {isLoadingHorarios && <LoadingSpinner text="Buscando agenda..." />}
                    {!isLoadingHorarios && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-4">Horários Cadastrados</h3>
                            {horarios?.length > 0 ? (
                                <ul className="space-y-2">
                                    {horarios.map(h => (
                                        <li key={h.id} className="flex items-center justify-between p-2 bg-slate-100 rounded">
                                            <span>
                                                <Clock className="inline mr-2 h-4 w-4" />
                                                {new Date(h.data_horario_inicio).toLocaleString()} - {new Date(h.data_horario_fim).toLocaleTimeString()}
                                            </span>
                                            <Badge variant={h.status_slot === 'disponivel' ? 'success' : 'outline'}>{h.status_slot}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-slate-500">Nenhum horário cadastrado para este profissional.</p>}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de formulário para adicionar horário */}
            <HorarioDisponivelForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSuccess={handleFormSuccess}
                profissionalId={selectedProfissionalId}
            />
        </div>
    );
}