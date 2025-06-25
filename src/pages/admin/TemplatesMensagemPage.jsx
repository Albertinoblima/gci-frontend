// src/pages/admin/TemplatesMensagemPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { templateMensagemApiService } from '../../services/templateMensagemService.js'; // Criar este service no frontend
import { municipioApiService } from '../../services/municipioService.js'; // Para filtro de município
import { secretariaApiService } from '../../services/secretariaService.js'; // Para filtro de secretaria
import { servicoApiService } from '../../services/servicoService.js'; // Para filtro de serviço
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { Button, Input, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { PlusCircle, Edit, Trash2, MessageSquareQuote, Loader2, AlertTriangle, Filter, RotateCcw, ToggleLeft, ToggleRight } from "lucide-react";
import ConfirmationModal from '../../components/shared/ConfirmationModal.jsx';
import TemplateMensagemForm from '../../components/admin/templates/TemplateMensagemForm.jsx'; // Será criado
import { useNotifier, NOTIFICATION_TYPES } from '../../hooks/useNotifier.js';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ErrorMessage from '../../components/shared/ErrorMessage.jsx';

// Exemplo de eventos gatilho e canais (idealmente viriam de uma config ou do backend)
const EVENTOS_GATILHO_EXEMPLO = ["BOT_BEM_VINDO_INICIAL", "BOT_MENU_SERVICOS", "AGENDAMENTO_CONFIRMADO", "LEMBRETE_CONSULTA_24H"];
const CANAIS_DESTINO_EXEMPLO = ["todos", "whatsapp", "messenger", "instagram", "email"];

export default function TemplatesMensagemPage() {
    const { user } = useContext(AuthContext);
    const { notify } = useNotifier();

    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorPage, setErrorPage] = useState(null);

    const [municipiosFiltro, setMunicipiosFiltro] = useState([]);
    const [secretariasFiltro, setSecretariasFiltro] = useState([]);
    const [servicosFiltro, setServicosFiltro] = useState([]);

    const [filtros, setFiltros] = useState({
        municipioId: user?.role !== 'admin_sistema' ? (user?.municipio_id ? String(user.municipio_id) : '') : 'global', // 'global' para templates sem município
        secretariaId: '',
        servicoId: '',
        eventoGatilho: '',
        canalDestino: 'todos',
        ativo: 'todos', // 'todos', 'true', 'false'
        search: '',
    });

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isUserAdminSistema = user?.role === 'admin_sistema';

    const loadFiltroDados = useCallback(async () => {
        setIsLoading(true); // Loading para filtros
        try {
            if (isUserAdminSistema) {
                const munData = await municipioApiService.getAll({ ativo: true });
                setMunicipiosFiltro(munData || []);
            }
            const targetMunicipioId = isUserAdminSistema ? filtros.municipioId : user?.municipio_id;
            if (targetMunicipioId && targetMunicipioId !== 'global') {
                const [secData, servData] = await Promise.all([
                    secretariaApiService.getByMunicipioId(targetMunicipioId, { ativo: true }),
                    servicoApiService.listAllSystemServicos({ municipioId: targetMunicipioId, ativo: true }) // Assumindo que lista serviços de um município
                ]);
                setSecretariasFiltro(secData || []);
                setServicosFiltro(servData || []); // O servicoApiService.listAllSystemServicos pode precisar de ajuste
            } else {
                setSecretariasFiltro([]);
                setServicosFiltro([]);
            }
        } catch (err) {
            notify("Erro ao carregar opções de filtro para templates.", NOTIFICATION_TYPES.ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [isUserAdminSistema, filtros.municipioId, user?.municipio_id, notify]);

    useEffect(() => { loadFiltroDados(); }, [loadFiltroDados]);

    const loadTemplates = useCallback(async () => {
        setIsLoading(true); setErrorPage(null);
        try {
            let params = { ...filtros };
            if (params.ativo === 'todos') delete params.ativo;
            if (params.canalDestino === 'todos') delete params.canalDestino;
            if (params.eventoGatilho === 'todos') delete params.eventoGatilho;
            if (params.municipioId === 'todos_municipios' && isUserAdminSistema) delete params.municipioId; // Admin vê todos se não filtrar
            else if (params.municipioId === 'global') params.municipioId = null; // Enviar null para buscar globais
            else if (!isUserAdminSistema && user?.municipio_id) params.municipioId = String(user.municipio_id); // Força município
            else if (!params.municipioId && isUserAdminSistema) { /* Não envia municipioId, backend retorna todos */ }
            else if (!params.municipioId) { setTemplates([]); setIsLoading(false); return; } // Não buscar sem município se não for admin

            const data = await templateMensagemApiService.getAll(params);
            setTemplates(data || []); // Assumindo que a API retorna um array diretamente
        } catch (err) {
            setErrorPage(err.error || "Falha ao carregar templates de mensagens.");
            setTemplates([]);
        } finally { setIsLoading(false); }
    }, [filtros, user, isUserAdminSistema]);

    useEffect(() => { loadTemplates(); }, [loadTemplates]);

    const handleFiltroChange = (name, value) => {
        setFiltros(prev => {
            const novosFiltros = { ...prev, [name]: value };
            if (name === 'municipioId') { // Resetar secretaria e serviço se município mudar
                novosFiltros.secretariaId = ''; novosFiltros.servicoId = '';
                setSecretariasFiltro([]); setServicosFiltro([]);
            }
            if (name === 'secretariaId') { // Resetar serviço se secretaria mudar
                novosFiltros.servicoId = '';
                setServicosFiltro([]);
            }
            return novosFiltros;
        });
    };

    const handleOpenFormModal = (item = null) => {
        let defaultMunId = filtros.municipioId;
        if (!isUserAdminSistema && user?.municipio_id) defaultMunId = String(user.municipio_id);
        else if (isUserAdminSistema && filtros.municipioId === 'global') defaultMunId = null; // Para template global

        setEditingTemplate(item ? { ...item, municipio_id: item.municipio_id || defaultMunId } : { municipio_id: defaultMunId });
        setIsFormModalOpen(true);
    };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setEditingTemplate(null); };
    const handleFormSuccess = () => { handleCloseFormModal(); loadTemplates(); };
    const handleOpenDeleteConfirmModal = (item) => { setTemplateToDelete(item); setIsDeleteConfirmModalOpen(true); };
    const handleCloseDeleteConfirmModal = () => { setTemplateToDelete(null); setIsDeleteConfirmModalOpen(false); };
    const handleDeleteTemplate = async () => { /* ... (chamada a templateMensagemApiService.remove) ... */ };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><MessageSquareQuote className="w-8 h-8 text-cyan-500" /><div><h1 className="text-2xl font-bold">Templates de Mensagens</h1><p className="text-slate-500">Gerencie os modelos de mensagens para o chatbot e respostas.</p></div></div>
                <div className="flex gap-2">
                    <Button onClick={loadTemplates} variant="outline" size="icon" title="Atualizar"><RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /></Button>
                    <Button onClick={() => handleOpenFormModal(null)} className="bg-cyan-600 hover:bg-cyan-700 text-white"><PlusCircle className="w-4 h-4 mr-2" />Novo Template</Button>
                </div>
            </div>

            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                {isUserAdminSistema && (
                    <div><Label htmlFor="filtroMunTemp">Município</Label>
                        <Select value={filtros.municipioId} onValueChange={(val) => handleFiltroChange('municipioId', val)}>
                            <SelectTrigger id="filtroMunTemp"><SelectValue placeholder="Contexto do Template" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos_municipios">Todos os Municípios</SelectItem>
                                <SelectItem value="global">Templates Globais (Sem Município)</SelectItem>
                                {municipiosFiltro.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>)}
                            </SelectContent>
                        </Select></div>
                )}
                {/* Adicionar filtros para Secretaria, Serviço, Evento Gatilho, Canal, Ativo, Busca */}
                <div><Label htmlFor="filtroEventoTemp">Evento Gatilho</Label>
                    <Select value={filtros.eventoGatilho} onValueChange={(val) => handleFiltroChange('eventoGatilho', val)}>
                        <SelectTrigger id="filtroEventoTemp"><SelectValue placeholder="Todos Eventos" /></SelectTrigger>
                        <SelectContent><SelectItem value="todos">Todos</SelectItem>{EVENTOS_GATILHO_EXEMPLO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select></div>
                <div className="relative lg:col-span-1"><Label htmlFor="searchTemp">Busca</Label>
                    <Search className="absolute left-3 bottom-2.5 text-slate-400 w-4 h-4" />
                    <Input id="searchTemp" placeholder="Nome, conteúdo..." value={filtros.search} onChange={e => handleFiltroChange('search', e.target.value)} className="pl-10" />
                </div>
            </CardContent></Card>

            {isLoading && <LoadingSpinner text="Carregando templates..." />}
            {errorPage && !isLoading && <ErrorMessage message={errorPage} onRetry={loadTemplates} />}
            {/* ... (Mensagem lista vazia) ... */}

            {!isLoading && !errorPage && templates.length > 0 && (
                <Card>
                    <Table><TableHeader><TableRow>
                        <TableHead>Nome do Template</TableHead>
                        <TableHead>Evento Gatilho</TableHead>
                        <TableHead className="hidden md:table-cell">Contexto (Município/Secretaria)</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow></TableHeader>
                        <TableBody>
                            {templates.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.nome_template}</TableCell>
                                    <TableCell>{t.evento_gatilho}</TableCell>
                                    <TableCell className="hidden md:table-cell text-xs">
                                        {t.municipio_nome || 'Global'}
                                        {t.secretaria_nome && ` / ${t.secretaria_nome}`}
                                        {t.servico_nome && ` / ${t.servico_nome}`}
                                    </TableCell>
                                    <TableCell className="text-center"><Badge variant={t.ativo ? 'default' : 'outline'} className={t.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>{t.ativo ? <ToggleRight /> : <ToggleLeft />} {t.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenFormModal(t)} title="Editar"><Edit className="w-4 h-4" /></Button>
                                        <Button variant="destructiveOutline" size="icon" onClick={() => handleOpenDeleteConfirmModal(t)} title="Deletar"><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {isFormModalOpen && (
                <TemplateMensagemForm
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    onSuccess={handleFormSuccess}
                    initialData={editingTemplate}
                    isUserAdminSistema={isUserAdminSistema}
                    listaMunicipios={municipiosFiltro} // Para o select de município no form
                    // Passar lista de secretarias e serviços do município selecionado (se houver um) para o form
                    listaSecretarias={secretariasFiltro}
                    listaServicos={servicosFiltro}
                    defaultMunicipioId={!isUserAdminSistema ? user?.municipio_id : filtros.municipioId === 'global' ? null : filtros.municipioId}
                />
            )}
            <ConfirmationModal isOpen={isDeleteConfirmModalOpen} onClose={handleCloseDeleteConfirmModal} onConfirm={handleDeleteTemplate} title="Confirmar Deleção" description={`Deletar template "${templateToDelete?.nome_template}"?`} isLoading={isDeleting} confirmVariant="destructive" />
        </div>
    );
}