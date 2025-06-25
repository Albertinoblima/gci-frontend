// src/hooks/useMunicipioAccess.js
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Hook para validar se o usuário tem acesso ao município especificado
 * @param {string|number} municipioId - ID do município a ser acessado
 * @param {boolean} redirectOnError - Se deve redirecionar em caso de erro (default: true)
 * @returns {Object} { hasAccess, isLoading, error }
 */
export const useMunicipioAccess = (municipioId, redirectOnError = true) => {
    const { user, isLoadingAuth } = useAuth();
    const navigate = useNavigate();

    // Verifica se o usuário tem acesso ao município
    const hasAccess = () => {
        if (isLoadingAuth || !user) return false;

        // admin_sistema pode acessar qualquer município
        if (user.role === 'admin_sistema') return true;

        // admin_municipio só pode acessar o próprio município
        if (user.role === 'admin_municipio') {
            return String(user.municipio_id) === String(municipioId);
        }

        // Outros roles com municipio_id devem acessar apenas o próprio
        if (user.municipio_id) {
            return String(user.municipio_id) === String(municipioId);
        }

        return false;
    };

    const access = hasAccess();
    const error = !isLoadingAuth && !access ? 'Acesso negado ao município' : null;

    // Redireciona para dashboard se não tem acesso
    useEffect(() => {
        if (!isLoadingAuth && !access && redirectOnError && municipioId) {
            console.warn(`Usuário ${user?.email} (${user?.role}) tentou acessar município ${municipioId} sem permissão`);
            navigate('/dashboard', { replace: true });
        }
    }, [isLoadingAuth, access, redirectOnError, municipioId, navigate, user]);

    return {
        hasAccess: access,
        isLoading: isLoadingAuth,
        error
    };
};

/**
 * Hook para validar se o usuário pode gerenciar recursos do município atual
 * Baseado no municipio_id do usuário logado
 * @returns {Object} { canManage, municipioId, isLoading }
 */
export const useCurrentMunicipioAccess = () => {
    const { user, isLoadingAuth } = useAuth();

    const canManage = !isLoadingAuth && user && (
        user.role === 'admin_sistema' ||
        (user.municipio_id && ['admin_municipio', 'gestor_secretaria'].includes(user.role))
    );

    return {
        canManage,
        municipioId: user?.municipio_id,
        isLoading: isLoadingAuth,
        userRole: user?.role
    };
};
