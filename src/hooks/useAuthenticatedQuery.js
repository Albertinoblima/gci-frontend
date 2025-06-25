// src/hooks/useAuthenticatedQuery.js
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Hook personalizado que só executa queries quando o usuário está autenticado.
 * Evita erros 401/403 em requisições feitas antes da autenticação.
 */
export const useAuthenticatedQuery = (queryKey, queryFn, options = {}) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey,
        queryFn,
        enabled: isAuthenticated && (options.enabled !== false), // Só executa se autenticado
        ...options, // Permite sobrescrever outras opções
    });
};

export default useAuthenticatedQuery;
