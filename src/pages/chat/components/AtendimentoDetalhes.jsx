import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Phone, Mail, Hash, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusVariantMap = {
    aguardando_atendimento: 'default',
    em_atendimento: 'secondary',
    resolvido: 'success', // Supondo que você crie esta variante no Badge
    encerrado: 'destructive',
};

const DetalheItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start text-sm mb-3">
        <Icon className="h-4 w-4 mr-3 mt-0.5 text-gray-500 dark:text-gray-400" />
        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-gray-600 dark:text-gray-300">{value || 'Não informado'}</p>
        </div>
    </div>
);

const AtendimentoDetalhes = ({ atendimento }) => {
    return (
        <div className="p-4 h-full overflow-y-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2" /> Detalhes do Atendimento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant={statusVariantMap[atendimento.status] || 'default'} className="mb-4">
                        {atendimento.status.replace(/_/g, ' ')}
                    </Badge>

                    <DetalheItem icon={Hash} label="Protocolo" value={atendimento.protocolo_str} />
                    <DetalheItem icon={User} label="Cidadão" value={atendimento.nome_perfil_canal} />
                    <DetalheItem icon={Phone} label="Telefone" value={atendimento.telefone_principal} />
                    <DetalheItem icon={Mail} label="E-mail" value={atendimento.email_principal} />
                    <DetalheItem icon={Layers} label="Canal de Origem" value={atendimento.canal_origem} />
                    <DetalheItem
                        icon={Layers}
                        label="Aberto em"
                        value={format(new Date(atendimento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AtendimentoDetalhes;