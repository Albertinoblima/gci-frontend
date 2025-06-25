// src/pages/CidadaosPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { cidadaoApiService } from '../services/cidadaoService.js';
import { municipioApiService } from '../services/municipioService.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { Button, Input, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/components/ui";
import { Users, UserCircle as UserIcon, Search, RotateCcw, Eye } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifier, NOTIFICATION_TYPES } from '../contexts/NotificationContext.jsx';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';
import ErrorMessage from '../components/shared/ErrorMessage.jsx';
import CidadaoDetalhesModal from '../components/modals/CidadaoDetalhesModal.jsx';

export default function CidadaosPage() {
    const { user } = useContext(AuthContext);
    const { notify } = useNotifier();

    const [cidadaos, setCidadaos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [municipiosFiltro, setMunicipiosFiltro] = useState([]);

    // Estados do modal de detalhes
    const [modalDetalhes, setModalDetalhes] = useState({
        isOpen: false,
        cidadao: null,
        isLoading: false,
        error: null
    });

    const [filtros, setFiltros] = useState({
        municipioId: user?.role !== 'admin_sistema' ? (user?.municipio_id ? String(user.municipio_id) : '') : '',
        canal: 'todos',
        search: '',
    });

    const isUserAdminSistema = user?.role === 'admin_sistema';

    const loadMunicipiosParaFiltro = useCallback(async () => {
        if (isUserAdminSistema) {
            try {
                const response = await municipioApiService.getAll({ ativo: true });
                const municipios = response.data || response || [];
                setMunicipiosFiltro(Array.isArray(municipios) ? municipios : []);
            } catch (err) {
                notify("Erro ao carregar municípios.", NOTIFICATION_TYPES.ERROR);
                setMunicipiosFiltro([]);
            }
        }
    }, [isUserAdminSistema, notify]);

    useEffect(() => {
        loadMunicipiosParaFiltro();
    }, [loadMunicipiosParaFiltro]);

    const loadCidadaos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { ...filtros };
            if (params.canal === 'todos') delete params.canal;
            if (isUserAdminSistema && !params.municipioId) delete params.municipioId;
            else if (!isUserAdminSistema && user?.municipio_id) params.municipioId = String(user.municipio_id);

            const resultado = await cidadaoApiService.listCidadaos(params);
            setCidadaos(resultado.data || []);
        } catch (err) {
            setError(err.message || "Falha ao carregar cidadãos.");
            setCidadaos([]);
        } finally {
            setIsLoading(false);
        }
    }, [filtros, user, isUserAdminSistema]);

    useEffect(() => {
        // Carregar apenas se admin_sistema e município selecionado, ou se não for admin_sistema (já tem município do usuário)
        if ((isUserAdminSistema && filtros.municipioId) || (!isUserAdminSistema && user?.municipio_id)) {
            loadCidadaos();
        } else if (isUserAdminSistema && !filtros.municipioId) {
            setCidadaos([]);
            setIsLoading(false);
        }
    }, [loadCidadaos, isUserAdminSistema, filtros.municipioId, user?.municipio_id]);

    const handleFiltroChange = (name, value) => setFiltros(prev => ({ ...prev, [name]: value === 'todos' ? '' : value }));

    // Funções do modal de detalhes
    const abrirModalDetalhes = async (cidadao) => {
        setModalDetalhes({
            isOpen: true,
            cidadao: null,
            isLoading: true,
            error: null
        });

        try {
            // Buscar dados completos do cidadão
            const dadosCompletos = await cidadaoApiService.getById(cidadao.id);
            setModalDetalhes(prev => ({
                ...prev,
                cidadao: dadosCompletos,
                isLoading: false
            }));
        } catch (err) {
            console.error('Erro ao carregar detalhes do cidadão:', err);
            setModalDetalhes(prev => ({
                ...prev,
                error: err.message || 'Erro ao carregar detalhes do cidadão',
                isLoading: false
            }));
        }
    };

    const fecharModalDetalhes = () => {
        setModalDetalhes({
            isOpen: false,
            cidadao: null,
            isLoading: false,
            error: null
        });
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-teal-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Cidadãos</h1>
                        <p className="text-slate-500">Visualize os cidadãos que interagiram com o sistema.</p>
                    </div>
                </div>
                <Button onClick={loadCidadaos} variant="outline" size="icon" title="Atualizar Lista">
                    <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                    {isUserAdminSistema && (
                        <div>
                            <Label htmlFor="filtroMunicipioCid">Município (Última Interação)</Label>
                            <Select value={filtros.municipioId} onValueChange={(val) => handleFiltroChange('municipioId', val)}>
                                <SelectTrigger id="filtroMunicipioCid">
                                    <SelectValue placeholder="Todos Municípios" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(municipiosFiltro) && municipiosFiltro.map(m =>
                                        <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>
                                    )}
                                    <SelectItem value="todos">Todos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="filtroCanalCid">Canal de Comunicação</Label>
                        <Select value={filtros.canal} onValueChange={(val) => handleFiltroChange('canal', val)}>
                            <SelectTrigger id="filtroCanalCid">
                                <SelectValue placeholder="Todos Canais" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="messenger">Messenger</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="webform">Formulário Web</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative md:col-span-2 lg:col-span-1">
                        <Label htmlFor="searchCid">Busca</Label>
                        <Search className="absolute left-3 bottom-2.5 text-slate-400 w-4 h-4" />
                        <Input
                            id="searchCid"
                            placeholder="Nome, ID Canal, Tel, Email..."
                            value={filtros.search}
                            onChange={e => handleFiltroChange('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {isLoading && <LoadingSpinner text="Carregando cidadãos..." />}

            {!isLoading && error && <ErrorMessage message={error} />}

            {!isLoading && !error && cidadaos.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">Nenhum cidadão encontrado</p>
                        <p className="text-slate-400 text-sm mt-2">
                            {filtros.search || filtros.canal !== 'todos' || (isUserAdminSistema && filtros.municipioId)
                                ? 'Tente ajustar os filtros de busca.'
                                : 'Aguarde as primeiras interações dos cidadãos.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && cidadaos.length > 0 && (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome no Canal</TableHead>
                                <TableHead>Canal</TableHead>
                                <TableHead className="hidden md:table-cell">Telefone Principal</TableHead>
                                <TableHead className="hidden lg:table-cell">Email Principal</TableHead>
                                <TableHead className="hidden sm:table-cell">Última Interação (Município)</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cidadaos.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-slate-400" />
                                        {c.nome_perfil_canal || `ID ${c.id_canal_origem}` || 'N/A'}
                                    </TableCell>
                                    <TableCell className="capitalize">{c.canal_comunicacao}</TableCell>
                                    <TableCell className="hidden md:table-cell">{c.telefone_principal || '-'}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{c.email_principal || '-'}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{c.ultimo_municipio_interacao_nome || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => abrirModalDetalhes(c)}
                                            title="Ver Detalhes do Cidadão"
                                        >
                                            <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Detalhes</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Modal de detalhes do cidadão */}
            <CidadaoDetalhesModal
                isOpen={modalDetalhes.isOpen}
                onClose={fecharModalDetalhes}
                cidadao={modalDetalhes.cidadao}
                isLoading={modalDetalhes.isLoading}
                error={modalDetalhes.error}
            />
        </div>
    );
}