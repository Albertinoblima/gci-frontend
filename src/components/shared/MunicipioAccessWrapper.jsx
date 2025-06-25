// src/components/shared/MunicipioAccessWrapper.jsx
import React from 'react';
import { useMunicipioAccess } from '@/hooks/useMunicipioAccess';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

/**
 * Wrapper para páginas que precisam validar acesso ao município
 * @param {string|number} municipioId - ID do município
 * @param {ReactNode} children - Componentes filhos
 * @param {ReactNode} fallback - Componente a ser mostrado em caso de erro
 */
export default function MunicipioAccessWrapper({
    municipioId,
    children,
    fallback = null
}) {
    const { hasAccess, isLoading, error } = useMunicipioAccess(municipioId);

    if (isLoading) {
        return <LoadingSpinner text="Verificando permissões..." />;
    }

    if (error || !hasAccess) {
        return fallback || (
            <ErrorMessage
                message="Você não tem permissão para acessar este município"
                showRetry={false}
            />
        );
    }

    return children;
}
