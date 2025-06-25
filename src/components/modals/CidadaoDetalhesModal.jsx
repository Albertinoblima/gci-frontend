// src/components/modals/CidadaoDetalhesModal.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { X, User, Phone, Mail, MapPin, Calendar, MessageCircle, Clock } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CidadaoDetalhesModal = ({
    isOpen,
    onClose,
    cidadao,
    isLoading = false,
    error = null
}) => {
    if (!isOpen) return null;

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        try {
            return format(parseISO(dataString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    const getChannelColor = (canal) => {
        const colors = {
            whatsapp: 'bg-green-100 text-green-800',
            messenger: 'bg-blue-100 text-blue-800',
            instagram: 'bg-purple-100 text-purple-800',
            webform: 'bg-gray-100 text-gray-800'
        };
        return colors[canal] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-500" />
                        Detalhes do Cidadão
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                        <span className="ml-2 text-slate-600">Carregando detalhes...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">❌ {error}</p>
                    </div>
                )}

                {!isLoading && !error && cidadao && (
                    <div className="space-y-6">
                        {/* Informações Básicas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Informações Básicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-500">ID Interno</label>
                                    <p className="text-slate-900">{cidadao.id || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Nome no Canal</label>
                                    <p className="text-slate-900">{cidadao.nome_perfil_canal || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">ID do Canal de Origem</label>
                                    <p className="text-slate-900 font-mono text-sm">{cidadao.id_canal_origem || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Canal de Comunicação</label>
                                    <Badge className={`mt-1 ${getChannelColor(cidadao.canal_comunicacao)}`}>
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        {cidadao.canal_comunicacao?.toUpperCase() || 'N/A'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contatos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Informações de Contato
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Telefone Principal</label>
                                    <p className="text-slate-900 flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        {cidadao.telefone_principal || 'Não informado'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Email Principal</label>
                                    <p className="text-slate-900 flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        {cidadao.email_principal || 'Não informado'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Localização */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Localização
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Último Município de Interação</label>
                                    <p className="text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        {cidadao.ultimo_municipio_interacao_nome || 'Não identificado'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Histórico */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Histórico
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Primeira Interação</label>
                                    <p className="text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        {formatarData(cidadao.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500">Última Atualização</label>
                                    <p className="text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        {formatarData(cidadao.updated_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Placeholder para futuras implementações */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <p className="text-blue-700 text-sm">
                                    🚧 <strong>Em desenvolvimento:</strong> Histórico de atendimentos, mensagens trocadas e interações detalhadas serão implementados em uma próxima versão.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!isLoading && !error && !cidadao && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700">⚠️ Nenhum dado do cidadão foi carregado.</p>
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CidadaoDetalhesModal;
