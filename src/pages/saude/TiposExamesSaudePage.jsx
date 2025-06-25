// src/pages/saude/TiposExamesSaudePage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { tipoExameSaudeApiService } from '../../services/saude/tipoExameSaudeService.js'; // Criar
import { municipioApiService } from '../../services/municipioService.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { Button, Input, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { PlusCircle, Edit, Trash2, FlaskConical, Loader2, AlertTriangle, RotateCcw, Search, ToggleLeft, ToggleRight } from "lucide-react";
import ConfirmationModal from '../../components/shared/ConfirmationModal.jsx';
import TipoExameSaudeForm from '../../components/saude/tiposexames/TipoExameSaudeForm.js'; // Será criado
import { useNotifier, NOTIFICATION_TYPES } from '../../hooks/useNotifier.js';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ErrorMessage from '../../components/shared/ErrorMessage.jsx';

export default function TiposExamesSaudePage() {
    const { user } = useContext(AuthContext);
    const { notify } = useNotifier();

    const [tiposExames, setTiposExames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [municipios, setMunicipios] = useState([]);
    const [selectedMunicipioId, setSelectedMunicipioId] = useState(user?.role !== 'admin_sistema' ? user?.municipio_id || '' : '');
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroAtivo, setFiltroAtivo] = useState("todos");

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTipoExame, setEditingTipoExame] = useState(null);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [tipoExameToDelete, setTipoExameToDelete] = useState(null);

    const isUserAdminSistema = user?.role === 'admin_sistema';

    // ... (loadMunicipiosParaFiltro similar a outras páginas) ...
    const loadMunicipiosParaFiltro = useCallback(async () => { /* ... */ }, [isUserAdminSistema]);
    useEffect(() => { loadMunicipiosParaFiltro(); }, [loadMunicipiosParaFiltro]);

    const loadTiposExames = useCallback(async (search = searchTerm, ativo = filtroAtivo) => {
        setIsLoading(true); setError(null);
        try {
            const params = {};
            let targetMunicipioId = selectedMunicipioId;
            if (!isUserAdminSistema && user?.municipio_id) targetMunicipioId = String(user.municipio_id);

            if (targetMunicipioId) params.municipio_id = targetMunicipioId;
            else if (isUserAdminSistema && !targetMunicipioId) { /* Admin sem filtro, pode listar todos ou exigir filtro */ }
            else { setTiposExames([]); setIsLoading(false); return; } // Sem município, sem busca

            if (search) params.search = search;
            if (ativo !== 'todos') params.ativo = ativo === 'true';

            const data = await tipoExameSaudeApiService.getAll(params);
            setTiposExames(data || []);
        } catch (err) { setError(err.error || "Falha ao carregar tipos de exames."); setTiposExames([]); }
        finally { setIsLoading(false); }
    }, [user, selectedMunicipioId, searchTerm, filtroAtivo, isUserAdminSistema]);

    useEffect(() => { loadTiposExames(); }, [loadTiposExames]);

    // ... (handlers de modal e deleção, adaptados para tipoExameSaudeApiService) ...
    const handleOpenFormModal = (item = null) => { /* ... similar, mas passa selectedMunicipioId ou user.municipio_id para o form ... */ };
    const handleCloseFormModal = () => { /* ... */ };
    const handleFormSuccess = () => { /* ... */ };
    const handleOpenDeleteConfirmModal = (item) => { /* ... */ };
    const handleCloseDeleteConfirmModal = () => { /* ... */ };
    const handleDeleteTipoExame = async () => { /* ... chamada a tipoExameSaudeApiService.remove ... */ };


    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><FlaskConical className="w-8 h-8 text-fuchsia-600" /><div><h1 className="text-2xl font-bold">Tipos de Exames de Saúde</h1><p className="text-slate-500">Gerencie os tipos de exames oferecidos.</p></div></div>
                {/* Botão Novo e Refresh */}
            </div>
            {/* Filtros (Município para admin_sistema, Ativo, Busca) */}
            {/* Tabela listando tipos de exames (Nome, Código Ref, Município, Ativo, Ações) */}
            {/* Modais */}
            {isFormModalOpen && (
                <TipoExameSaudeForm
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    onSuccess={handleFormSuccess}
                    initialData={editingTipoExame}
                    isUserAdminSistema={isUserAdminSistema}
                    listaMunicipios={municipios}
                    defaultMunicipioId={!isUserAdminSistema ? user?.municipio_id : selectedMunicipioId}
                />
            )}
            {/* ConfirmationModal para delete */}
        </div>
    );
}