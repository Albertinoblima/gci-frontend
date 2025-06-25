// src/components/municipios/MunicipioForm.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient.js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Para o campo 'ativo'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose, // Para o botão de fechar padrão do dialog
} from "@/components/ui/dialog";
import { Loader2, Save } from 'lucide-react';

export default function MunicipioForm({ isOpen, onClose, onSuccess, initialData }) {
    const [formData, setFormData] = useState({
        nome: '',
        estado: '', // Obrigatório
        codigo_ibge: '',
        logo_url: '',
        cor_primaria: '#16a34a', // Default do schema
        cor_secundaria: '#0ea5e9', // Default do schema
        texto_boas_vindas_geral: '',
        config_meta_api: { // Estrutura básica, pode ser expandida
            whatsapp_phone_number_id: '',
            messenger_page_id: '',
            instagram_page_id: '',
            access_token: ''
        },
        sigla_protocolo: '',
        ativo: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = Boolean(initialData && initialData.id);

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                nome: initialData.nome || '',
                estado: initialData.estado || '',
                codigo_ibge: initialData.codigo_ibge || '',
                logo_url: initialData.logo_url || '',
                cor_primaria: initialData.cor_primaria || '#16a34a',
                cor_secundaria: initialData.cor_secundaria || '#0ea5e9',
                texto_boas_vindas_geral: initialData.texto_boas_vindas_geral || '',
                config_meta_api: initialData.config_meta_api && typeof initialData.config_meta_api === 'object'
                    ? { ...formData.config_meta_api, ...initialData.config_meta_api }
                    : { whatsapp_phone_number_id: '', messenger_page_id: '', instagram_page_id: '', access_token: '' },
                sigla_protocolo: initialData.sigla_protocolo || '',
                ativo: initialData.ativo !== undefined ? initialData.ativo : true,
            });
        } else {
            // Reset para valores padrão ao criar novo
            setFormData({
                nome: '', estado: '', codigo_ibge: '', logo_url: '',
                cor_primaria: '#16a34a', cor_secundaria: '#0ea5e9', texto_boas_vindas_geral: '',
                config_meta_api: { whatsapp_phone_number_id: '', messenger_page_id: '', instagram_page_id: '', access_token: '' },
                sigla_protocolo: '', ativo: true,
            });
        }
    }, [isOpen, isEditing, initialData]); // Recarregar form quando initialData ou isOpen mudar

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleConfigMetaChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            config_meta_api: {
                ...prev.config_meta_api,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validação obrigatória
        if (!formData.nome) {
            setError("Nome é obrigatório.");
            setIsLoading(false);
            return;
        }
        if (!formData.estado || formData.estado.length !== 2) {
            setError("Selecione a sigla do estado (UF) corretamente.");
            setIsLoading(false);
            return;
        }
        if (!formData.codigo_ibge || !/^[0-9]{6,7}$/.test(formData.codigo_ibge)) {
            setError("Informe o código IBGE válido (6 ou 7 dígitos).");
            setIsLoading(false);
            return;
        }

        // Monta config_meta_api apenas com os campos permitidos pelo schema
        let finalConfigMeta = null;
        if (formData.config_meta_api && Object.values(formData.config_meta_api).some(val => val && val.trim() !== '')) {
            finalConfigMeta = {
                whatsapp_phone_number_id: formData.config_meta_api.whatsapp_phone_number_id || undefined,
                messenger_page_id: formData.config_meta_api.messenger_page_id || undefined,
                instagram_page_id: formData.config_meta_api.instagram_page_id || undefined,
                access_token: formData.config_meta_api.access_token || undefined
            };
        }

        // Monta o payload apenas com os campos aceitos pelo schema
        const dataToSubmit = {
            nome: formData.nome,
            estado: formData.estado,
            codigo_ibge: formData.codigo_ibge,
            sigla_protocolo: formData.sigla_protocolo,
            ativo: formData.ativo,
            logo_url: formData.logo_url || undefined,
            cor_primaria: formData.cor_primaria || undefined,
            cor_secundaria: formData.cor_secundaria || undefined,
            texto_boas_vindas_geral: formData.texto_boas_vindas_geral || undefined,
            config_meta_api: finalConfigMeta
        };

        try {
            if (isEditing) {
                await apiClient.put(`/municipios/${initialData.id}`, dataToSubmit);
            } else {
                await apiClient.post('/municipios', dataToSubmit);
            }
            onSuccess();
        } catch (err) {
            // Corrige exibição de erro para qualquer formato de resposta
            let msg = 'Falha ao salvar município.';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                } else if (err.response.data.error) {
                    msg = err.response.data.error;
                } else if (err.response.data.message) {
                    msg = err.response.data.message;
                }
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> {/* Chama onClose quando o dialog tenta fechar */}
            <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-850 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {isEditing ? 'Editar Município' : 'Novo Município'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        {isEditing ? 'Atualize os dados do município.' : 'Preencha os dados para cadastrar um novo município.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 p-1"> {/* Removido p-0 se DialogContent já tem */}
                    {/* Campos Principais */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="nome" className="dark:text-slate-300">Nome do Município*</Label>
                            <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <Label htmlFor="estado" className="dark:text-slate-300">Estado (UF)*</Label>
                            <Input id="estado" name="estado" value={formData.estado} onChange={handleChange} required maxLength="2" placeholder="Ex: SP" className="uppercase dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <Label htmlFor="codigo_ibge" className="dark:text-slate-300">Código IBGE*</Label>
                            <Input id="codigo_ibge" name="codigo_ibge" value={formData.codigo_ibge} onChange={handleChange} required minLength="6" maxLength="7" pattern="[0-9]{6,7}" placeholder="Ex: 2611606" className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="sigla_protocolo" className="dark:text-slate-300">Sigla para Protocolo (até 10 chars)</Label>
                        <Input id="sigla_protocolo" name="sigla_protocolo" value={formData.sigla_protocolo} onChange={handleChange} maxLength="10" className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                    </div>

                    {/* Configurações Visuais */}
                    <h3 className="text-md font-semibold pt-2 border-t dark:border-slate-700 dark:text-slate-200">Identidade Visual e Boas-vindas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="logo_url" className="dark:text-slate-300">URL do Logo</Label>
                            <Input id="logo_url" name="logo_url" type="url" value={formData.logo_url} onChange={handleChange} placeholder="https://..." className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cor_primaria" className="dark:text-slate-300">Cor Primária</Label>
                            <Input id="cor_primaria" name="cor_primaria" type="color" value={formData.cor_primaria} onChange={handleChange} className="h-10 dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                        <div>
                            <Label htmlFor="cor_secundaria" className="dark:text-slate-300">Cor Secundária</Label>
                            <Input id="cor_secundaria" name="cor_secundaria" type="color" value={formData.cor_secundaria} onChange={handleChange} className="h-10 dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="texto_boas_vindas_geral" className="dark:text-slate-300">Texto de Boas-vindas (Chatbot)</Label>
                        <Textarea id="texto_boas_vindas_geral" name="texto_boas_vindas_geral" value={formData.texto_boas_vindas_geral} onChange={handleChange} rows={3} className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200" />
                    </div>

                    {/* Configurações da API da Meta */}
                    <h3 className="text-md font-semibold pt-2 border-t dark:border-slate-700 dark:text-slate-200">Configurações API da Meta</h3>
                    <div className="space-y-3 p-3 border rounded-md dark:border-slate-700">
                        <div>
                            <Label htmlFor="whatsapp_phone_number_id" className="text-sm dark:text-slate-300">ID do Número WhatsApp</Label>
                            <Input id="whatsapp_phone_number_id" name="whatsapp_phone_number_id" value={formData.config_meta_api.whatsapp_phone_number_id} onChange={handleConfigMetaChange} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <Label htmlFor="messenger_page_id" className="text-sm dark:text-slate-300">ID da Página do Messenger</Label>
                            <Input id="messenger_page_id" name="messenger_page_id" value={formData.config_meta_api.messenger_page_id} onChange={handleConfigMetaChange} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <Label htmlFor="instagram_page_id" className="text-sm dark:text-slate-300">ID da Conta Profissional Instagram</Label>
                            <Input id="instagram_page_id" name="instagram_page_id" value={formData.config_meta_api.instagram_page_id} onChange={handleConfigMetaChange} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <Label htmlFor="access_token" className="text-sm dark:text-slate-300">Token de Acesso da Página/App Meta</Label>
                            <Input id="access_token" name="access_token" type="password" value={formData.config_meta_api.access_token} onChange={handleConfigMetaChange} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="Manter vazio para não alterar" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="ativo" name="ativo" checked={formData.ativo} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))} />
                        <Label htmlFor="ativo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300">
                            Município ativo no sistema
                        </Label>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Salvar Alterações' : 'Criar Município'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}