// src/components/saude/tiposexames/TipoExameSaudeForm.jsx
import React, { useState, useEffect } from 'react';
import { tipoExameSaudeApiService } from '../../../services/saude/tipoExameSaudeService.js';
import { useNotifier, NOTIFICATION_TYPES } from '../../../hooks/useNotifier.js';
import { Button, Input, Label, Textarea, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Save } from 'lucide-react';

export default function TipoExameSaudeForm({
    isOpen, onClose, onSuccess, initialData,
    isUserAdminSistema, listaMunicipios, defaultMunicipioId
}) {
    const [formData, setFormData] = useState({
        municipio_id: '', nome_exame: '', codigo_referencia: '',
        descricao_detalhada: '', instrucoes_preparo: '', ativo: true,
    });
    // ... (lógica de estado, useEffect, handleChange, handleSubmit similar a EscolaForm) ...
    // Certifique-se que municipio_id é tratado corretamente (select para admin_sistema, fixo para outros)

    const handleSubmit = async (e) => {
        e.preventDefault(); /* ... */
        if (!formData.nome_exame || !formData.municipio_id) {
            setError("Nome do Exame e Município são obrigatórios."); /* ... */ return;
        }
        const dataToSubmit = { ...formData, municipio_id: parseInt(formData.municipio_id) };
        try {
            if (isEditing) { await tipoExameSaudeApiService.update(initialData.id, dataToSubmit); }
            else { await tipoExameSaudeApiService.create(dataToSubmit); }
            /* ... notificar e onSuccess ... */
        } catch (err) { /* ... tratar erro ... */ }
        finally { /* ... setIsLoading(false) ... */ }
    };


    if (!isOpen) return null;
    const isEditing = !!initialData?.id; // Adicionado para clareza

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg dark:bg-slate-850">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Tipo de Exame' : 'Novo Tipo de Exame'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Edite as informações do tipo de exame.' : 'Preencha as informações para cadastrar um novo tipo de exame.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Select de Município para admin_sistema (similar a EscolaForm) */}
                    <div><Label htmlFor="nome_exame_form">Nome do Exame*</Label><Input id="nome_exame_form" name="nome_exame" value={formData.nome_exame} onChange={handleChange} required /></div>
                    <div><Label htmlFor="codigo_referencia_form">Código de Referência (TUSS, SIGTAP)</Label><Input id="codigo_referencia_form" name="codigo_referencia" value={formData.codigo_referencia} onChange={handleChange} /></div>
                    <div><Label htmlFor="descricao_detalhada_form_exame">Descrição Detalhada</Label><Textarea id="descricao_detalhada_form_exame" name="descricao_detalhada" value={formData.descricao_detalhada} onChange={handleChange} rows={3} /></div>
                    <div><Label htmlFor="instrucoes_preparo_form">Instruções de Preparo</Label><Textarea id="instrucoes_preparo_form" name="instrucoes_preparo" value={formData.instrucoes_preparo} onChange={handleChange} rows={3} /></div>
                    {/* Checkbox Ativo */}
                    {/* Error e Footer similar a outros forms */}
                </form>
            </DialogContent>
        </Dialog>
    );
}
// Adicionar handleChange e outros estados/lógicas que faltam no exemplo simplificado acima.