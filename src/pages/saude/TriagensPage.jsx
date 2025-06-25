// src/pages/saude/TriagensPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { triagemSaudeApiService } from '../../services/saude/triagemSaudeService.js'; // Criar este service
import { municipioApiService } from '../../services/municipioService.js';
import { unidadeSaudeApiService } from '../../services/saude/unidadeSaudeService.js';
import { cidadaoApiService } from '../../services/cidadaoService.js'; // Para buscar cidadãos
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { Button, Input, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { PlusCircle, Edit, Eye, ClipboardList, Loader2, AlertTriangle, Search, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import TriagemSaudeForm from '../../components/saude/triagens/TriagemSaudeForm.js'; // Será criado
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifier, NOTIFICATION_TYPES } from '../../hooks/useNotifier.js';

export default function TriagensPage() {
    const { user } = useContext(AuthContext);
    const { notify } = useNotifier();

    const [triagens, setTriagens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtros, setFiltros] = useState({
        municipioId: user?.role !== 'admin_sistema' ? user?.municipio_id || '' : '',
        unidadeId: '',
        cidadaoSearch: '', // Para buscar cidadão por nome/documento
        statusTriagem: 'todos',
        dataInicio: '',
        dataFim: '',
    });

    // Dados para os selects de filtro
    const [municipiosFiltro, setMunicipiosFiltro] = useState([]);
    const [unidadesFiltro, setUnidadesFiltro] = useState([]);

    // Função para montar params padronizado
    const getParamsWithMunicipioId = () => {
        let params = { ...filtros };
        if (isUserAdminSistema) params.municipio_id = filtros.municipioId;
        else params.municipio_id = user?.municipio_id;
        return params;
    };

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTriagem, setEditingTriagem] = useState(null);
    // Detalhes da triagem podem ser exibidos em um modal ou uma página separada
    // const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
    // const [selectedTriagemDetalhes, setSelectedTriagemDetalhes] = useState(null);


    const isUserAdminSistema = user?.role === 'admin_sistema';

    const loadFiltroDados = useCallback(async () => {
        try {
            if (isUserAdminSistema) {
                const munData = await municipioApiService.getAll();
                setMunicipiosFiltro(munData || []);
            }
            const targetMunicipioId = isUserAdminSistema ? filtros.municipioId : user?.municipio_id;
            if (targetMunicipioId) {
                const uniData = await unidadeSaudeApiService.getAll({ municipioId: targetMunicipioId, ativo: true });
                setUnidadesFiltro(uniData || []);
            } else {
                setUnidadesFiltro([]);
            }
        } catch (err) {
            console.error("Erro ao carregar dados para filtros de triagens:", err);
            notify("Erro ao carregar opções de filtro.", NOTIFICATION_TYPES.ERROR);
        }
    }, [isUserAdminSistema, filtros.municipioId, user?.municipio_id]);

    useEffect(() => {
        loadFiltroDados();
    }, [loadFiltroDados]);

    const loadTriagens = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { ...filtros };
            if (params.statusTriagem === 'todos') delete params.statusTriagem;
            if (!params.municipioId && isUserAdminSistema) delete params.municipioId;
            else if (!isUserAdminSistema && user?.municipio_id) params.municipioId = user.municipio_id;

            // Se cidadaoSearch for usado, o backend precisaria fazer um JOIN ou uma subconsulta
            // para buscar o cidadaoId correspondente, ou o frontend faz isso em duas etapas.
            // Por simplicidade, o service de triagem pode aceitar cidadaoSearch diretamente.

            const resultado = await triagemSaudeApiService.listTriagens(params);
            setTriagens(resultado.data || []);
            // Lidar com paginação
        } catch (err) {
            setError(err.error || "Falha ao carregar triagens.");
            setTriagens([]);
        } finally {
            setIsLoading(false);
        }
    }, [filtros, user]);

    useEffect(() => {
        if ((isUserAdminSistema && filtros.municipioId) || (!isUserAdminSistema && user?.municipio_id)) {
            loadTriagens();
        } else if (isUserAdminSistema && !filtros.municipioId) {
            setTriagens([]);
            setIsLoading(false);
        }
    }, [loadTriagens, isUserAdminSistema, filtros.municipioId, user?.municipio_id]);

    const handleFiltroChange = (name, value) => {
        setFiltros(prev => {
            const novosFiltros = { ...prev, [name]: value };
            if (name === 'municipioId') {
                novosFiltros.unidadeId = ''; // Resetar unidade se município mudar
                setUnidadesFiltro([]);
            }
            return novosFiltros;
        });
    };

    const handleOpenFormModal = (triagem = null) => {
        let targetMunicipioIdForForm = isUserAdminSistema ? filtros.municipioId : user?.municipio_id;
        if (!targetMunicipioIdForForm && !triagem?.municipio_id) {
            notify("Selecione um município nos filtros para registrar uma triagem.", NOTIFICATION_TYPES.WARNING);
            return;
        }
        setEditingTriagem(triagem ? { ...triagem, municipio_id: triagem.municipio_id || targetMunicipioIdForForm } : { municipio_id: targetMunicipioIdForForm });
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => { setIsFormModalOpen(false); setEditingTriagem(null); };
    const handleFormSuccess = () => { handleCloseFormModal(); loadTriagens(); };

    // const handleOpenDetalhes = (triagem) => { setSelectedTriagemDetalhes(triagem); setIsDetalhesModalOpen(true); }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <ClipboardList className="w-8 h-8 text-sky-600 dark:text-sky-500" />
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Triagens de Saúde
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                            Registre e acompanhe as triagens de pacientes.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={loadTriagens} variant="outline" size="icon" title="Atualizar Lista" className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                        <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        onClick={() => handleOpenFormModal(null)}
                        className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 dark:text-white w-full sm:w-auto"
                        disabled={(isUserAdminSistema && !filtros.municipioId) || (!isUserAdminSistema && !user?.municipio_id)}
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nova Triagem
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <Card className="dark:bg-slate-850 dark:border-slate-700">
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-end">
                    {isUserAdminSistema && (
                        <div className="w-full"><Label htmlFor="filtroMunicipioTriagem">Município</Label>
                            <Select value={filtros.municipioId} onValueChange={(val) => handleFiltroChange('municipioId', val === 'todos' ? '' : val)}>
                                <SelectTrigger id="filtroMunicipioTriagem"><SelectValue placeholder="Todos Municípios" /></SelectTrigger>
                                <SelectContent><SelectItem value="todos">Todos</SelectItem>{municipiosFiltro.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>)}</SelectContent>
                            </Select></div>
                    )}
                    <div className="w-full"><Label htmlFor="filtroUnidadeTriagem">Unidade de Saúde</Label>
                        <Select value={filtros.unidadeId} onValueChange={(val) => handleFiltroChange('unidadeId', val === 'todas' ? '' : val)} disabled={!unidadesFiltro.length && !!filtros.municipioId}>
                            <SelectTrigger id="filtroUnidadeTriagem"><SelectValue placeholder="Todas Unidades" /></SelectTrigger>
                            <SelectContent><SelectItem value="todas">Todas</SelectItem>{unidadesFiltro.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>)}</SelectContent>
                        </Select></div>

                    <div className="w-full"><Label htmlFor="filtroStatusTriagem">Status da Triagem</Label>
                        <Select value={filtros.statusTriagem} onValueChange={(val) => handleFiltroChange('statusTriagem', val)}>
                            <SelectTrigger id="filtroStatusTriagem"><SelectValue placeholder="Todos Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos Status</SelectItem>
                                <SelectItem value="aguardando_analise">Aguardando Análise</SelectItem>
                                <SelectItem value="em_analise">Em Análise</SelectItem>
                                <SelectItem value="analisada">Analisada</SelectItem>
                                <SelectItem value="encaminhada">Encaminhada</SelectItem>
                                <SelectItem value="finalizada_sem_agendamento">Finalizada (Sem Agend.)</SelectItem>
                                {/* Adicionar outros status */}
                            </SelectContent>
                        </Select></div>

                    <div className="w-full"><Label htmlFor="filtroCidadaoTriagem">Buscar Cidadão</Label>
                        <Input id="filtroCidadaoTriagem" placeholder="Nome, CPF, Telefone..." value={filtros.cidadaoSearch} onChange={e => handleFiltroChange('cidadaoSearch', e.target.value)} /></div>

                    {/* <Button onClick={loadTriagens} className="self-end">
                <Filter className="w-4 h-4 mr-2"/>Aplicar Filtros
            </Button> */}
                </CardContent>
            </Card>

            {isLoading && <div className="text-center py-4">Carregando triagens... <Loader2 className="inline w-5 h-5 animate-spin" /></div>}
            {error && !isLoading && (
                <div className="text-center py-4 text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {typeof error === 'string' ? error : 'Ocorreu um erro ao carregar as triagens.'}
                </div>
            )}
            {!isLoading && !error && triagens.length === 0 && (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    Nenhuma triagem encontrada para os filtros selecionados.
                </div>
            )}

            {!isLoading && !error && triagens.length > 0 && (
                <Card className="dark:bg-slate-850 dark:border-slate-700">
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Cidadão</TableHead>
                            <TableHead>Data Triagem</TableHead>
                            <TableHead className="hidden md:table-cell">Unidade</TableHead>
                            <TableHead className="hidden sm:table-cell">Queixa Principal</TableHead>
                            <TableHead>Class. Risco</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {triagens.map((t) => (
                                <TableRow key={t.id} className="dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <TableCell className="font-medium">{t.cidadao_nome || `ID ${t.cidadao_id}`}</TableCell>
                                    <TableCell>{format(parseISO(t.data_triagem), "dd/MM/yy HH:mm")}</TableCell>
                                    <TableCell className="hidden md:table-cell">{t.unidade_saude_nome || '-'}</TableCell>
                                    <TableCell className="hidden sm:table-cell truncate max-w-xs">{t.queixa_principal || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.classificacao_risco?.toLowerCase() === 'vermelho' ? 'destructive' : (t.classificacao_risco?.toLowerCase() === 'laranja' ? 'warning' : 'secondary')}>
                                            {t.classificacao_risco || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell><Badge>{t.status_triagem?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenFormModal(t)} title="Editar/Ver Triagem"><Edit className="w-4 h-4" /></Button>
                                        {/* <Button variant="outline" size="icon" onClick={() => handleOpenDetalhes(t)} title="Ver Detalhes"><Eye className="w-4 h-4" /></Button> */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {isFormModalOpen && (
                <TriagemSaudeForm
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    onSuccess={handleFormSuccess}
                    initialData={editingTriagem}
                    municipioIdParaForm={isUserAdminSistema ? filtros.municipioId : user?.municipio_id}
                    listaUnidades={unidadesFiltro} // Passar unidades do município selecionado/do usuário
                // Passar lista de profissionais (usuários do sistema com role de saúde) para profissional_triagem_id
                />
            )}
            {/* Modal de Detalhes ou Deleção, se necessário */}
        </div>
    );
}