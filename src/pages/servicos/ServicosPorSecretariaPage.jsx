// src/pages/servicos/ServicosPorSecretariaPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { servicoApiService } from '../../services/servicoService.js'; // Assegure-se que este service exista
import { secretariaApiService } from '../../services/secretariaService.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { Button, Input, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { PlusCircle, Edit, Trash2, ListChecks, Loader2, AlertTriangle, RotateCcw, Search, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import ConfirmationModal from '../../components/shared/ConfirmationModal.jsx';
import ServicoForm from '../../components/servicos/ServicoForm.jsx'; // O formulário que acabamos de detalhar
import { useNotifier, NOTIFICATION_TYPES } from '../../hooks/useNotifier.js';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ErrorMessage from '../../components/shared/ErrorMessage.jsx';
import { createPageUrl } from '../../utils/urls.js';


export default function ServicosPorSecretariaPage() {
    const { secretariaId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { notify } = useNotifier();

    const [secretaria, setSecretaria] = useState(null);
    const [servicos, setServicos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtros, setFiltros] = useState({
        ativo: "todos", // 'todos', 'true', 'false'
        search: "",
        tipoServico: "todos",
    });

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingServico, setEditingServico] = useState(null);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [servicoToDelete, setServicoToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadPaginaData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!secretariaId || isNaN(parseInt(secretariaId))) {
            setError("ID da Secretaria inválido.");
            setIsLoading(false);
            return;
        }

        try {
            const secretariaData = await secretariaApiService.getById(secretariaId);
            if (!secretariaData) throw { status: 404, message: `Secretaria ID ${secretariaId} não encontrada.` };
            setSecretaria(secretariaData);

            // Permissão para ver serviços desta secretaria
            if (user && user.role !== 'admin_sistema' && user.municipio_id !== secretariaData.municipio_id) {
                throw { status: 403, message: "Acesso negado aos serviços desta secretaria." };
            }

            const params = {};
            if (filtros.ativo !== 'todos') params.ativo = filtros.ativo === 'true';
            if (filtros.search) params.search = filtros.search;
            if (filtros.tipoServico !== 'todos') params.tipoServico = filtros.tipoServico;

            const servicosData = await servicoApiService.getBySecretariaId(secretariaId, params);
            setServicos(servicosData || []);

        } catch (err) {
            const apiError = err.error || err.message || "Falha ao carregar dados.";
            setError(apiError);
            if (err.status !== 404 || !err.message.includes('Secretaria')) setSecretaria(null);
            setServicos([]);
        } finally {
            setIsLoading(false);
        }
    }, [secretariaId, user, filtros.ativo, filtros.search, filtros.tipoServico]);

    useEffect(() => {
        loadPaginaData();
    }, [loadPaginaData]);

    const handleFiltroChange = (name, value) => setFiltros(prev => ({ ...prev, [name]: value }));
    const handleOpenFormModal = (item = null) => { setEditingServico(item); setIsFormModalOpen(true); };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setEditingServico(null); };
    const handleFormSuccess = () => { handleCloseFormModal(); loadPaginaData(); };
    const handleOpenDeleteConfirmModal = (item) => { setServicoToDelete(item); setIsDeleteConfirmModalOpen(true); };
    const handleCloseDeleteConfirmModal = () => { setServicoToDelete(null); setIsDeleteConfirmModalOpen(false); };

    const handleDeleteServico = async () => {
        if (!servicoToDelete) return;
        setIsDeleting(true);
        try {
            await servicoApiService.remove(servicoToDelete.id);
            notify("Serviço deletado com sucesso!", NOTIFICATION_TYPES.SUCCESS);
            handleCloseDeleteConfirmModal();
            loadPaginaData();
        } catch (err) {
            const apiError = err.error || "Falha ao deletar serviço.";
            notify(apiError, NOTIFICATION_TYPES.ERROR);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading && !secretaria) return <LoadingSpinner fullPage text="Carregando dados..." />;
    if (error && !secretaria) return <div className="p-8"><ErrorMessage title="Erro" message={error} onRetry={loadPaginaData} /> <Button onClick={() => navigate(-1)}>Voltar</Button> </div>;
    if (!secretaria) return <div className="p-8 text-center">Secretaria não encontrada.</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl(`Municipios/${secretaria?.municipio_id}/secretarias`))} title={`Voltar para Secretarias de ${secretaria?.municipio_nome}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <ListChecks className="w-8 h-8 text-purple-600 dark:text-purple-500" />
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Serviços: {secretaria?.nome}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                            Município: {secretaria?.municipio_nome}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={loadPaginaData} variant="outline" size="icon" title="Atualizar Lista"><RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /></Button>
                    <Button onClick={() => handleOpenFormModal(null)} className="bg-purple-600 hover:bg-purple-700 dark:text-white w-full sm:w-auto">
                        <PlusCircle className="w-4 h-4 mr-2" />Novo Serviço
                    </Button>
                </div>
            </div>

            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="relative flex-grow md:col-span-1"><Label htmlFor="searchServicoPage">Buscar Serviço</Label>
                    <Search className="absolute left-3 bottom-2.5 text-slate-400 w-4 h-4" />
                    <Input id="searchServicoPage" placeholder="Nome do serviço..." value={filtros.search} onChange={e => handleFiltroChange('search', e.target.value)} className="pl-10 w-full" />
                </div>
                <div><Label htmlFor="tipoServicoFiltroPage">Tipo de Serviço</Label>
                    <Select value={filtros.tipoServico} onValueChange={(val) => handleFiltroChange('tipoServico', val)}>
                        <SelectTrigger id="tipoServicoFiltroPage"><SelectValue placeholder="Todos os Tipos" /></SelectTrigger>
                        <SelectContent><SelectItem value="todos">Todos</SelectItem>{TIPOS_SERVICO_OPCOES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select></div>
                <div><Label htmlFor="ativoFiltroPage">Status</Label>
                    <Select value={filtros.ativo} onValueChange={(val) => handleFiltroChange('ativo', val)}>
                        <SelectTrigger id="ativoFiltroPage"><SelectValue placeholder="Todos" /></SelectTrigger>
                        <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="true">Ativos</SelectItem><SelectItem value="false">Inativos</SelectItem></SelectContent>
                    </Select></div>
            </CardContent></Card>

            {isLoading && servicos.length === 0 && <LoadingSpinner text="Carregando serviços..." />}
            {error && !isLoading && <ErrorMessage message={error} onRetry={loadPaginaData} />}
            {!isLoading && !error && servicos.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                    Nenhum serviço encontrado para os filtros selecionados.
                </div>
            )}

            {!isLoading && !error && servicos.length > 0 && (
                <Card>
                    <Table><TableHeader><TableRow>
                        <TableHead>Nome do Serviço</TableHead>
                        <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow></TableHeader>
                        <TableBody>
                            {servicos.map((serv) => (
                                <TableRow key={serv.id}>
                                    <TableCell className="font-medium">{serv.emoji} {serv.nome}</TableCell>
                                    <TableCell className="hidden sm:table-cell capitalize">{serv.tipo_servico?.replace('_', ' ') || '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={serv.ativo ? 'default' : 'outline'} className={serv.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                                            {serv.ativo ? <ToggleRight /> : <ToggleLeft />} {serv.ativo ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenFormModal(serv)} title="Editar"><Edit className="w-4 h-4" /></Button>
                                        <Button variant="destructiveOutline" size="icon" onClick={() => handleOpenDeleteConfirmModal(serv)} title="Deletar"><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {isFormModalOpen && (
                <ServicoForm
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    onSuccess={handleFormSuccess}
                    initialData={editingServico}
                    secretariaId={secretariaId}
                    secretariaNome={secretaria?.nome}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteConfirmModalOpen}
                onClose={handleCloseDeleteConfirmModal}
                onConfirm={handleDeleteServico}
                title="Confirmar Deleção de Serviço"
                description={`Tem certeza que deseja deletar o serviço "${servicoToDelete?.nome}"?`}
                confirmText="Sim, Deletar"
                confirmVariant="destructive"
                isLoading={isDeleting}
            />
        </div>
    );
}