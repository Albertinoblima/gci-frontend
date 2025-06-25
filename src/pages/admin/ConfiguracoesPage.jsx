// src/pages/admin/ConfiguracoesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import municipioService from '../../services/municipioService.js';
import { templateMensagemApiService } from '../../services/templateMensagemService.js';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Textarea, Checkbox } from "@/components/ui";
import { Settings, MessageSquareText, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useNotifier, NOTIFICATION_TYPES } from '../../contexts/NotificationContext.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ErrorMessage from '../../components/shared/ErrorMessage.jsx';
// import TemplateMensagemList from '../../components/configuracoes/TemplateMensagemList';
// import TemplateMensagemForm from '../../components/configuracoes/TemplateMensagemForm';

// Placeholder para o formulário de edição do município (poderia ser um componente separado)
function FormularioConfigMunicipio({ municipioData, onSave, isLoading }) {
    const [formData, setFormData] = useState(municipioData);

    useEffect(() => {
        setFormData(municipioData);
    }, [municipioData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleConfigMetaChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, config_meta_api: { ...prev.config_meta_api, [name]: value } }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!formData) return <Loader2 className="animate-spin" />;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="conf_nome">Nome do Município</Label><Input id="conf_nome" name="nome" value={formData.nome || ''} onChange={handleChange} /></div>
                <div><Label htmlFor="conf_estado">Estado (UF)</Label><Input id="conf_estado" name="estado" value={formData.estado || ''} onChange={handleChange} maxLength="2" /></div>
            </div>
            {/* Adicionar todos os campos editáveis da tabela municipios:
                logo_url, cor_primaria, cor_secundaria, texto_boas_vindas_geral, 
                config_meta_api (com sub-campos), sigla_protocolo, ativo 
            */}
            <div><Label htmlFor="conf_logo_url">URL do Logo</Label><Input id="conf_logo_url" name="logo_url" type="url" value={formData.logo_url || ''} onChange={handleChange} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="conf_cor_primaria">Cor Primária</Label><Input id="conf_cor_primaria" name="cor_primaria" type="color" value={formData.cor_primaria || '#000000'} onChange={handleChange} className="h-10" /></div>
                <div><Label htmlFor="conf_cor_secundaria">Cor Secundária</Label><Input id="conf_cor_secundaria" name="cor_secundaria" type="color" value={formData.cor_secundaria || '#000000'} onChange={handleChange} className="h-10" /></div>
            </div>
            <div><Label htmlFor="conf_texto_boas_vindas">Texto Boas-Vindas Chatbot</Label><Textarea id="conf_texto_boas_vindas" name="texto_boas_vindas_geral" value={formData.texto_boas_vindas_geral || ''} onChange={handleChange} rows={3} /></div>

            <fieldset className="border p-3 rounded-md"><legend>Config API Meta</legend>
                <div className="space-y-2">
                    <div><Label htmlFor="conf_meta_wa">ID Número WhatsApp</Label><Input id="conf_meta_wa" name="whatsapp_phone_number_id" value={formData.config_meta_api?.whatsapp_phone_number_id || ''} onChange={handleConfigMetaChange} /></div>
                    {/* ... outros campos da config_meta_api ... */}
                    <div><Label htmlFor="conf_meta_token">Token de Acesso Meta (se precisar atualizar)</Label><Input id="conf_meta_token" name="access_token" type="password" placeholder="Deixe em branco para não alterar" onChange={handleConfigMetaChange} /></div>
                </div>
            </fieldset>

            <div className="flex items-center space-x-2"><Checkbox id="conf_ativo" name="ativo" checked={formData.ativo} onCheckedChange={val => handleChange({ target: { name: 'ativo', type: 'checkbox', checked: val } })} /><Label htmlFor="conf_ativo">Município Ativo</Label></div>

            <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : <Save />} Salvar Configurações do Município
            </Button>
        </form>
    );
}


export default function ConfiguracoesPage() {
    const { user } = useContext(AuthContext);
    const { notify } = useNotifier();
    const [configMunicipio, setConfigMunicipio] = useState(null);
    const [isLoadingMunicipio, setIsLoadingMunicipio] = useState(false);
    const [errorMunicipio, setErrorMunicipio] = useState(null);

    // Estados para templates (se admin_sistema)
    // const [templates, setTemplates] = useState([]);
    // const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    const isUserAdminSistema = user?.role === 'admin_sistema';
    const isUserAdminMunicipio = user?.role === 'admin_municipio';
    const isUserWithMunicipio = user?.municipio_id && (isUserAdminMunicipio || user?.role === 'gestor_secretaria' || user?.role === 'agente_saude' || user?.role === 'agente_educacao' || user?.role === 'agente_atendimento');

    const loadConfigMunicipio = useCallback(async () => {
        if (user?.municipio_id) { // Admin de município ou outro role com município_id
            setIsLoadingMunicipio(true);
            setErrorMunicipio(null);
            try {
                const response = await municipioService.getById(user.municipio_id);
                setConfigMunicipio(response.data);
            } catch (err) {
                setErrorMunicipio(err.response?.data?.error || err.message || "Falha ao carregar configurações do município.");
            } finally {
                setIsLoadingMunicipio(false);
            }
        }
    }, [user]);

    useEffect(() => {
        if (!isUserAdminSistema && isUserWithMunicipio) {
            loadConfigMunicipio();
        }
        // Se admin_sistema, ele poderia ter um select para escolher qual município configurar,
        // ou esta página seria diferente para ele (ex: listar templates globais).
    }, [loadConfigMunicipio, isUserAdminSistema, isUserWithMunicipio]);

    const handleSaveConfigMunicipio = async (formData) => {
        if (!configMunicipio || !configMunicipio.id) return;
        setIsLoadingMunicipio(true);
        setErrorMunicipio(null);
        try {
            // Remover campos que não devem ser enviados ou que o usuário não pode alterar
            const { id, created_at, updated_at, ...dataToUpdate } = formData;
            const dataFormatada = {
                ...dataToUpdate,
                // Garantir que config_meta_api seja objeto ou null
                config_meta_api: (dataToUpdate.config_meta_api && Object.values(dataToUpdate.config_meta_api).some(v => v))
                    ? dataToUpdate.config_meta_api
                    : null,
            };
            await municipioService.update(configMunicipio.id, dataFormatada);
            notify("Configurações do município salvas!", NOTIFICATION_TYPES.SUCCESS);
            loadConfigMunicipio(); // Recarregar
        } catch (err) {
            const apiError = err.response?.data?.error || err.message || "Falha ao salvar configurações do município.";
            setErrorMunicipio(apiError);
            notify(apiError, NOTIFICATION_TYPES.ERROR);
        } finally {
            setIsLoadingMunicipio(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Configurações
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                        Gerencie as configurações do sistema e do seu município.
                    </p>
                </div>
            </div>

            {/* Seção para Admin de Município editar seu próprio município */}
            {isUserAdminMunicipio && user?.municipio_id && (
                <Card className="dark:bg-slate-850 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>Configurações do Seu Município</CardTitle>
                        <CardDescription>Altere as informações e personalizações do seu município.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMunicipio && <LoadingSpinner text="Carregando configurações..." />}
                        {errorMunicipio && <ErrorMessage message={errorMunicipio} onRetry={loadConfigMunicipio} />}
                        {!isLoadingMunicipio && !errorMunicipio && configMunicipio && (
                            <FormularioConfigMunicipio
                                municipioData={configMunicipio}
                                onSave={handleSaveConfigMunicipio}
                                isLoading={isLoadingMunicipio} // Loading específico do form de município
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Seção para outros usuários com município (visualização apenas) */}
            {!isUserAdminSistema && !isUserAdminMunicipio && isUserWithMunicipio && (
                <Card className="dark:bg-slate-850 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>Informações do Seu Município</CardTitle>
                        <CardDescription>Visualize as informações do município onde você trabalha.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMunicipio && <LoadingSpinner text="Carregando informações..." />}
                        {errorMunicipio && <ErrorMessage message={errorMunicipio} onRetry={loadConfigMunicipio} />}
                        {!isLoadingMunicipio && !errorMunicipio && configMunicipio && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Nome do Município</Label>
                                        <p className="text-sm text-gray-900">{configMunicipio.nome || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Estado (UF)</Label>
                                        <p className="text-sm text-gray-900">{configMunicipio.estado || 'Não informado'}</p>
                                    </div>
                                </div>

                                {configMunicipio.logo_url && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Logo do Município</Label>
                                        <div className="mt-2">
                                            <img src={configMunicipio.logo_url} alt="Logo do município" className="h-20 w-auto" />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Cor Primária</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: configMunicipio.cor_primaria || '#000000' }}
                                            ></div>
                                            <span className="text-sm text-gray-900">{configMunicipio.cor_primaria || '#000000'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Cor Secundária</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: configMunicipio.cor_secundaria || '#000000' }}
                                            ></div>
                                            <span className="text-sm text-gray-900">{configMunicipio.cor_secundaria || '#000000'}</span>
                                        </div>
                                    </div>
                                </div>

                                {configMunicipio.texto_boas_vindas_geral && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Texto de Boas-Vindas do Chatbot</Label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                                            {configMunicipio.texto_boas_vindas_geral}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                    <p className="text-sm text-blue-700">
                                        <strong>Nota:</strong> Para alterar essas configurações, entre em contato com o administrador do município.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Seção para Admin do Sistema (ex: gerenciar templates globais) */}
            {isUserAdminSistema && (
                <Card className="dark:bg-slate-850 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquareText /> Templates de Mensagens Globais</CardTitle>
                        <CardDescription>Gerencie templates de mensagens que não são específicos de um município.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Aqui entraria a listagem e CRUD de templates com municipio_id = NULL */}
                        {/* <Button onClick={() => navigate(createPageUrl('Configuracoes/TemplatesGlobais'))}>Gerenciar Templates Globais</Button> */}
                        <p className="text-sm text-slate-500">Funcionalidade de gerenciamento de templates globais a ser implementada.</p>
                        <p className="text-sm text-slate-500 mt-2">O gerenciamento de templates por município pode ser feito na página de "Municípios" ao editar um município específico (adicionar aba "Templates").</p>
                    </CardContent>
                </Card>
            )}

            {/* Seção padrão caso não se enquadre nas condições acima */}
            {!isUserAdminSistema && !isUserWithMunicipio && (
                <Card className="dark:bg-slate-850 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>Configurações Não Disponíveis</CardTitle>
                        <CardDescription>Suas configurações não estão disponíveis no momento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Para acessar as configurações, você precisa estar associado a um município.
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Entre em contato com o administrador do sistema para obter as permissões necessárias.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Adicionar outras seções de configuração conforme necessário */}

        </div>
    );
}