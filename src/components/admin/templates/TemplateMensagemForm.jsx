// src/components/admin/templates/TemplateMensagemForm.jsx
import React, { useState, useEffect } from 'react';
import { templateMensagemApiService } from '../../../services/templateMensagemService.js';
import { useNotifier, NOTIFICATION_TYPES } from '../../../hooks/useNotifier.js';
import { Button, Input, Label, Textarea, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Save } from 'lucide-react';

// Estas listas devem ser consistentes com a página e, idealmente, vir de uma fonte única
const EVENTOS_GATILHO_EXEMPLO_FORM = ["BOT_BEM_VINDO_INICIAL", "BOT_MENU_SERVICOS", "AGENDAMENTO_CONFIRMADO", "LEMBRETE_CONSULTA_24H"];
const CANAIS_DESTINO_EXEMPLO_FORM = [{ value: "todos", label: "Todos os Canais" }, { value: "whatsapp", label: "WhatsApp" }, { value: "messenger", label: "Messenger" }, { value: "instagram", label: "Instagram" }, { value: "email", label: "Email" }];


export default function TemplateMensagemForm({
    isOpen, onClose, onSuccess, initialData,
    isUserAdminSistema, listaMunicipios, listaSecretarias, listaServicos, defaultMunicipioId
}) {
    const [formData, setFormData] = useState({
        municipio_id: '', secretaria_id: '', servico_id: '',
        nome_template: '', canal_destino: 'todos', evento_gatilho: '',
        conteudo_template: '', ativo: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { notify } = useNotifier();
    const isEditing = Boolean(initialData && initialData.id);

    useEffect(() => {
        if (isOpen) {
            let currentMunicipioId = defaultMunicipioId === null ? 'global' : String(defaultMunicipioId || '');

            if (isEditing && initialData) {
                currentMunicipioId = initialData.municipio_id === null ? 'global' : String(initialData.municipio_id || '');
                setFormData({
                    municipio_id: currentMunicipioId,
                    secretaria_id: String(initialData.secretaria_id || ''),
                    servico_id: String(initialData.servico_id || ''),
                    nome_template: initialData.nome_template || '',
                    canal_destino: initialData.canal_destino || 'todos',
                    evento_gatilho: initialData.evento_gatilho || '',
                    conteudo_template: initialData.conteudo_template || '',
                    ativo: initialData.ativo !== undefined ? initialData.ativo : true,
                });
            } else { // Novo
                setFormData({
                    municipio_id: currentMunicipioId, secretaria_id: '', servico_id: '',
                    nome_template: '', canal_destino: 'todos', evento_gatilho: '',
                    conteudo_template: '', ativo: true,
                });
            }
            setError(null);
        }
    }, [isOpen, isEditing, initialData, defaultMunicipioId]);

    const handleChange = (e) => { /* ... */ };
    const handleSelectChange = (name, value) => {
        const newValue = value === 'global' ? null : (value === 'nenhum' ? null : value);
        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            if (name === 'municipio_id') { updated.secretaria_id = ''; updated.servico_id = ''; }
            if (name === 'secretaria_id') { updated.servico_id = ''; }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true); setError(null);
        if (!formData.nome_template || !formData.evento_gatilho || !formData.conteudo_template) {
            setError("Nome, Evento Gatilho e Conteúdo são obrigatórios."); setIsLoading(false); return;
        }

        const dataToSubmit = {
            ...formData,
            municipio_id: formData.municipio_id === 'global' || !formData.municipio_id ? null : parseInt(formData.municipio_id),
            secretaria_id: formData.secretaria_id ? parseInt(formData.secretaria_id) : null,
            servico_id: formData.servico_id ? parseInt(formData.servico_id) : null,
            canal_destino: formData.canal_destino === 'todos' ? null : formData.canal_destino,
        };

        try {
            if (isEditing) {
                await templateMensagemApiService.update(initialData.id, dataToSubmit);
                notify("Template atualizado!", NOTIFICATION_TYPES.SUCCESS);
            } else {
                await templateMensagemApiService.create(dataToSubmit);
                notify("Template criado!", NOTIFICATION_TYPES.SUCCESS);
            }
            onSuccess();
        } catch (err) { /* ... (tratamento de erro) ... */ } finally { setIsLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl dark:bg-slate-850">
                <DialogHeader><DialogTitle>{isEditing ? 'Editar Template' : 'Novo Template de Mensagem'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-2">
                    <div><Label htmlFor="nome_template_form">Nome do Template*</Label><Input id="nome_template_form" name="nome_template" value={formData.nome_template} onChange={handleChange} required /></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="evento_gatilho_form">Evento Gatilho* (ex: BOT_NOME_EVENTO)</Label><Input id="evento_gatilho_form" name="evento_gatilho" value={formData.evento_gatilho} onChange={handleChange} required />
                            {/* Ou um Select com eventos pré-definidos */}
                        </div>
                        <div><Label htmlFor="canal_destino_form">Canal Destino</Label>
                            <Select value={formData.canal_destino || 'todos'} onValueChange={(val) => handleSelectChange('canal_destino', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{CANAIS_DESTINO_EXEMPLO_FORM.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                            </Select></div>
                    </div>

                    <h4 className="text-sm font-medium dark:text-slate-300 pt-2">Contexto do Template (Opcional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded dark:border-slate-700">
                        <div><Label htmlFor="template_municipio_id">Município</Label>
                            <Select value={formData.municipio_id === null ? 'global' : String(formData.municipio_id || '')} onValueChange={(val) => handleSelectChange('municipio_id', val)} disabled={!isUserAdminSistema && !!defaultMunicipioId}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="global">Global (Sem Município)</SelectItem>
                                    {listaMunicipios?.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>)}
                                </SelectContent>
                            </Select></div>
                        <div><Label htmlFor="template_secretaria_id">Secretaria</Label>
                            <Select value={String(formData.secretaria_id || '')} onValueChange={(val) => handleSelectChange('secretaria_id', val)} disabled={!formData.municipio_id || formData.municipio_id === 'global' || listaSecretarias.length === 0}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent><SelectItem value="nenhum">Nenhuma</SelectItem>{listaSecretarias?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}</SelectContent>
                            </Select></div>
                        <div><Label htmlFor="template_servico_id">Serviço</Label>
                            <Select value={String(formData.servico_id || '')} onValueChange={(val) => handleSelectChange('servico_id', val)} disabled={!formData.secretaria_id || listaServicos.length === 0}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent><SelectItem value="nenhum">Nenhum</SelectItem>{listaServicos?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}</SelectContent>
                            </Select></div>
                    </div>

                    <div><Label htmlFor="conteudo_template_form">Conteúdo do Template* (Use placeholders como {"{{nome_cidadao}}"})</Label>
                        <Textarea id="conteudo_template_form" name="conteudo_template" value={formData.conteudo_template} onChange={handleChange} required rows={6} /></div>

                    <div className="flex items-center space-x-2"><Checkbox id="template_ativo" name="ativo" checked={formData.ativo} onCheckedChange={val => handleSelectChange('ativo', Boolean(val))} /><Label htmlFor="template_ativo">Template ativo</Label></div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <DialogFooter className="mt-4">
                        <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                            {isLoading ? <Loader2 /> : <Save />} {isEditing ? 'Salvar' : 'Criar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}