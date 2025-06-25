// src/hooks/useAuth.js
import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx'; // Ajuste o caminho conforme sua estrutura
import { getSecureToken, isAuthenticated, clearAuth } from '../utils/auth.js';

// Cache global para evitar verificações duplicadas
const authCache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000, // 5 minutos
    isValidating: false,
    promise: null
};

/**
 * Custom hook para acessar o AuthContext.
 * Fornece uma maneira mais limpa de consumir o contexto de autenticação
 * e lança um erro se usado fora de um AuthProvider.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        // Se context for undefined, significa que AuthContext.Provider não está acima na árvore.
        // Se for null, significa que o valor inicial do context foi null e não foi provido.
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

/**
 * Hook aprimorado para verificação de autenticação com cache
 * Evita verificações duplicadas e melhora a performance
 */
export const useAuthVerification = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);
    const mountedRef = useRef(true);

    const isCacheValid = useCallback(() => {
        if (!authCache.data || !authCache.timestamp) return false;
        return (Date.now() - authCache.timestamp) < authCache.ttl;
    }, []);

    const verifyAuth = useCallback(async (force = false) => {
        // Se já está validando e não é forçado, aguardar a validação atual
        if (authCache.isValidating && !force && authCache.promise) {
            console.log('🔄 Verificação já em andamento, aguardando...');
            try {
                const result = await authCache.promise;
                if (mountedRef.current) {
                    setUser(result);
                    setLoading(false);
                }
                return result;
            } catch (err) {
                if (mountedRef.current) {
                    setError(err.message);
                    setLoading(false);
                }
                throw err;
            }
        }

        // Usar cache se válido e não forçado
        if (isCacheValid() && !force) {
            console.log('✅ Usando dados do cache de autenticação');
            if (mountedRef.current) {
                setUser(authCache.data);
                setLoading(false);
            }
            return authCache.data;
        }

        const token = getSecureToken();

        if (!token) {
            console.log('❌ Token inválido ou ausente');
            authCache.data = null;
            authCache.timestamp = null;
            if (mountedRef.current) {
                setUser(null);
                setLoading(false);
            }
            return null;
        }

        // Iniciar nova verificação
        authCache.isValidating = true;

        authCache.promise = new Promise(async (resolve, reject) => {
            try {
                if (mountedRef.current) {
                    setLoading(true);
                    setError(null);
                }

                // Cancelar requisição anterior se existir
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                abortControllerRef.current = new AbortController();

                console.log('📡 Verificando autenticação...');

                const response = await fetch('/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: abortControllerRef.current.signal
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Token inválido/expirado
                        clearAuth();
                        throw new Error('Token inválido ou expirado');
                    }
                    throw new Error(`Falha na verificação: ${response.status}`);
                }

                const userData = await response.json();

                // Atualizar cache
                authCache.data = userData;
                authCache.timestamp = Date.now();

                if (mountedRef.current) {
                    setUser(userData);
                    setError(null);
                }

                console.log('✅ Autenticação verificada com sucesso');
                resolve(userData);

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('🔄 Requisição de auth cancelada');
                    resolve(null);
                    return;
                }

                console.error('❌ Erro na verificação de auth:', error);

                // Limpar cache em caso de erro
                authCache.data = null;
                authCache.timestamp = null;

                if (mountedRef.current) {
                    setError(error.message);
                    setUser(null);
                }

                reject(error);

            } finally {
                authCache.isValidating = false;
                authCache.promise = null;

                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        });

        return authCache.promise;
    }, [isCacheValid]);

    const logout = useCallback(() => {
        clearAuth();
        authCache.data = null;
        authCache.timestamp = null;
        authCache.isValidating = false;
        authCache.promise = null;
        setUser(null);
        console.log('🔓 Logout realizado');
    }, []);

    const refreshAuth = useCallback(() => {
        return verifyAuth(true); // Forçar nova verificação
    }, [verifyAuth]);

    useEffect(() => {
        mountedRef.current = true;

        // Verificar autenticação inicial
        verifyAuth().catch(err => {
            console.error('Erro na verificação inicial:', err);
        });

        // Cleanup ao desmontar
        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [verifyAuth]);

    return {
        user,
        loading,
        error,
        verifyAuth,
        refreshAuth,
        logout,
        isAuthenticated: !!user && isAuthenticated()
    };
};