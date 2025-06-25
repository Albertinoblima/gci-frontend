// gci-frontend/src/components/dashboard/MunicipioInfo.jsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth.js';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Hash } from 'lucide-react';

const MunicipioInfo = ({ municipioContext }) => {
    const { user } = useAuth();

    // Mostrar informações do município se disponível
    if (!municipioContext && user?.role !== 'admin_sistema') {
        return null;
    }

    // Para admin_sistema, mostrar informações contextuais
    if (user?.role === 'admin_sistema') {
        return (
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Contexto Administrativo
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Administrador do Sistema
                        </Badge>
                        <span className="text-sm text-blue-600">
                            Acesso global a todos os municípios
                        </span>
                    </div>
                    {municipioContext && (
                        <div className="mt-2 text-sm text-blue-700">
                            <strong>Contexto atual:</strong> {municipioContext.municipio_nome}
                            {municipioContext.municipio_estado && ` - ${municipioContext.municipio_estado}`}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Para outros usuários, mostrar informações do município
    return (
        <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Município
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">
                            {municipioContext?.municipio_nome || 'Não especificado'}
                        </span>
                    </div>
                    {municipioContext?.municipio_estado && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700">
                                {municipioContext.municipio_estado}
                            </span>
                        </div>
                    )}
                    {municipioContext?.municipio_codigo_ibge && (
                        <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700">
                                IBGE: {municipioContext.municipio_codigo_ibge}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default MunicipioInfo;
