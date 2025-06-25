// src/pages/MunicipiosPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import apiClient from '../services/apiClient.js'; // Seu cliente Axios configurado
import { AuthContext } from '../contexts/AuthContext.jsx'; // Para verificar permissões
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    PlusCircle, // Ícone para Adicionar
    Edit,       // Ícone para Editar
    Trash2,     // Ícone para Deletar
    Search,
    Building2,
    ToggleLeft, // Para status inativo
    ToggleRight, // Para status ativo
    AlertTriangle, // Para erros
    RotateCcw, // Para refresh
    Eye // Para visualizar
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"; // Para modal de confirmação de deleção

// Componente do Formulário (será criado abaixo ou em arquivo separado)
import MunicipioForm from '../components/municipios/MunicipioForm.jsx';
import { useAuth } from '@/hooks/useAuth';

export default function MunicipiosPage() {
    const { user, isLoading: isLoadingAuth } = useAuth(); // Suporte para isLoadingAuth se existir

    // LINHA DE DEPURAÇÃO: Anexa o usuário à janela global quando em modo de teste
    if (window.Cypress) {
        window.testUser = user;
    }

    const [municipios, setMunicipios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Estado para o formulário/modal de edição/criação
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingMunicipio, setEditingMunicipio] = useState(null); // null para novo, objeto para editar

    // Estado para o modal de confirmação de deleção
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [municipioToDelete, setMunicipioToDelete] = useState(null);


    const loadMunicipios = useCallback(async (search = searchTerm) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (search) params.search = search;
            const response = await apiClient.get('/municipios', { params });
            const lista = response.data?.data?.municipios || [];
            setMunicipios(lista);
        } catch (err) {
            console.error("Erro ao carregar municípios:", err);
            setError(err.response?.data?.error || "Falha ao carregar municípios.");
            setMunicipios([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]); // Adicionar searchTerm como dependência se a busca for feita aqui

    useEffect(() => {
        if (!isLoadingAuth && user?.role === 'admin_sistema') {
            loadMunicipios();
        } else if (!isLoadingAuth && user) {
            setError("Você não tem permissão para gerenciar municípios.");
            setIsLoading(false);
        }
    }, [user, isLoadingAuth, loadMunicipios]);

    const handleOpenFormModal = (municipio = null) => {
        setEditingMunicipio(municipio); // Se 'municipio' for null, é para criar um novo
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingMunicipio(null);
    };

    const handleFormSuccess = () => {
        handleCloseFormModal();
        loadMunicipios(); // Recarrega a lista após sucesso
    };

    const handleOpenDeleteConfirmModal = (municipio) => {
        setMunicipioToDelete(municipio);
        setIsDeleteConfirmModalOpen(true);
    };

    const handleCloseDeleteConfirmModal = () => {
        setMunicipioToDelete(null);
        setIsDeleteConfirmModalOpen(false);
    };

    const handleDeleteMunicipio = async () => {
        if (!municipioToDelete) return;
        try {
            await apiClient.delete(`/municipios/${municipioToDelete.id}`);
            // Idealmente, mostrar uma notificação de sucesso (toast)
            handleCloseDeleteConfirmModal();
            loadMunicipios(); // Recarrega a lista
        } catch (err) {
            console.error("Erro ao deletar município:", err);
            setError(err.response?.data?.error || "Falha ao deletar o município.");
            // Manter o modal de confirmação aberto para o usuário ver o erro ou fechar
        }
    };

    // Se não for admin_sistema, não mostrar nada ou uma mensagem de acesso negado.
    // O ProtectedRoute já deve barrar o acesso à rota, mas uma verificação aqui é uma camada extra.
    if (user && user.role !== 'admin_sistema') {
        return (
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Acesso Negado</h2>
                <p className="text-slate-600 dark:text-slate-400">Você não tem permissão para acessar esta página.</p>
            </div>
        );
    }


    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Gerenciar Municípios
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                            Adicione, edite ou visualize os municípios do sistema.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => loadMunicipios()} variant="outline" size="icon" title="Atualizar Lista" className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                        <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => handleOpenFormModal(null)} data-cy="novo-municipio-btn" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white w-full sm:w-auto">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Novo Município
                    </Button>
                </div>
            </div>

            <Card className="dark:bg-slate-850 dark:border-slate-700">
                <CardContent className="p-4 sm:p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <Input
                            placeholder="Buscar por nome, estado ou código IBGE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // Idealmente, a busca aconteceria ao digitar com um debounce, ou com um botão de busca
                            // Por simplicidade, vamos recarregar ao mudar o foco ou com o botão de refresh
                            onBlur={() => loadMunicipios(searchTerm)} // Recarrega ao perder o foco
                            onKeyPress={(e) => e.key === 'Enter' && loadMunicipios(searchTerm)} // Recarrega com Enter
                            className="pl-10 w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                        />
                    </div>
                </CardContent>
            </Card>

            {isLoading && <div className="text-center py-4">Carregando municípios... <Loader2 className="inline w-5 h-5 animate-spin" /></div>}
            {error && !isLoading && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-400 text-center">
                    <AlertTriangle className="inline w-5 h-5 mr-2" /> {error}
                </div>
            )}

            {!isLoading && !error && municipios.length === 0 && (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum município encontrado.</p>
                    <p className="text-sm">Clique em "Novo Município" para adicionar o primeiro.</p>
                </div>
            )}

            {!isLoading && !error && municipios.length > 0 && (
                <Card className="dark:bg-slate-850 dark:border-slate-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="dark:border-slate-700">
                                <TableHead className="dark:text-slate-300">Nome</TableHead>
                                <TableHead className="dark:text-slate-300">Estado</TableHead>
                                <TableHead className="dark:text-slate-300 hidden md:table-cell">Código IBGE</TableHead>
                                <TableHead className="dark:text-slate-300 text-center">Status</TableHead>
                                <TableHead className="dark:text-slate-300 text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {municipios.map((municipio) => (
                                <TableRow key={municipio.id} className="dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">{municipio.nome}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{municipio.estado}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 hidden md:table-cell">{municipio.codigo_ibge || '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={municipio.ativo ? 'default' : 'outline'}
                                            className={municipio.ativo
                                                ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600'
                                                : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600'}>
                                            {municipio.ativo ? <ToggleRight className="w-4 h-4 mr-1 inline" /> : <ToggleLeft className="w-4 h-4 mr-1 inline" />}
                                            {municipio.ativo ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenFormModal(municipio)} title="Editar Município" className="dark:border-slate-600 dark:hover:bg-slate-700">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        {/* Implementar visualização se necessário */}
                                        {/* <Button variant="outline" size="icon" title="Visualizar Município" className="dark:border-slate-600 dark:hover:bg-slate-700">
                      <Eye className="w-4 h-4" />
                    </Button> */}
                                        <Button variant="destructiveOutline" size="icon" onClick={() => handleOpenDeleteConfirmModal(municipio)} title="Deletar Município" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Modal/Formulário para Adicionar/Editar Município */}
            {isFormModalOpen && (
                <MunicipioForm
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    onSuccess={handleFormSuccess}
                    initialData={editingMunicipio}
                />
            )}

            {/* Modal de Confirmação de Deleção */}
            {isDeleteConfirmModalOpen && municipioToDelete && (
                <Dialog open={isDeleteConfirmModalOpen} onOpenChange={handleCloseDeleteConfirmModal}>
                    <DialogContent className="dark:bg-slate-850 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirmar Deleção</DialogTitle>
                            <DialogDescription className="text-slate-600 dark:text-slate-400">
                                Tem certeza que deseja deletar o município "{municipioToDelete.nome}"?
                                Esta ação não pode ser desfeita. Se houver secretarias, usuários ou outros dados vinculados, a deleção pode ser impedida.
                            </DialogDescription>
                        </DialogHeader>
                        {error && municipioToDelete && ( // Mostra erro específico da deleção aqui
                            <p className="my-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                                {error}
                            </p>
                        )}
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant="outline" onClick={handleCloseDeleteConfirmModal} className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">Cancelar</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={handleDeleteMunicipio}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Deletar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
}