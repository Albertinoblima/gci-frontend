// src/components/security/MunicipioGuard.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useMunicipioAccess } from '../../hooks/useMunicipioAccess';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';

/**
 * Componente de segurança que valida acesso baseado em município
 * Deve ser usado para proteger páginas que acessam dados específicos de um município
 */
export const MunicipioGuard = ({
    children,
    municipioId,
    requireExactMatch = true,
    fallbackRoute = '/dashboard'
}) => {
    const { user, isLoadingAuth } = useAuth();
    const { hasAccess, isLoading, error } = useMunicipioAccess(municipioId);

    // Aguardar carregamento da autenticação
    if (isLoadingAuth || isLoading) {
        return <LoadingSpinner text="Verificando permissões de acesso..." />;
    }

    // Usuário não autenticado
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // VALIDAÇÃO CRÍTICA: Verificar se tem acesso ao município
    if (!hasAccess) {
        console.warn(`🔒 Acesso negado: Usuário ${user.email} (${user.role}) tentou acessar município ${municipioId}`);
        return <Navigate to={fallbackRoute} replace />;
    }

    // Para admin_municipio, verificar se está tentando acessar o próprio município
    if (requireExactMatch && user.role === 'admin_municipio') {
        if (String(user.municipio_id) !== String(municipioId)) {
            console.warn(`🔒 Tentativa de acesso cross-município: ${user.email} tentou acessar município ${municipioId}`);
            return <Navigate to={fallbackRoute} replace />;
        }
    }

    return children;
};

/**
 * HOC para proteger componentes com validação de município
 */
export const withMunicipioGuard = (WrappedComponent, options = {}) => {
    return (props) => {
        const municipioId = props.municipioId || props.match?.params?.municipioId;

        return (
            <MunicipioGuard municipioId={municipioId} {...options}>
                <WrappedComponent {...props} />
            </MunicipioGuard>
        );
    };
};

export default MunicipioGuard;
