// gci-frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient.js';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const hasVerified = useRef(false); // Usar ref para controlar verificação única
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }, [token]); const verifyAuthOnLoad = useCallback(async () => {
        // Verificar uma única vez por sessão
        if (hasVerified.current) {
            return;
        }

        hasVerified.current = true;
        const currentToken = localStorage.getItem('authToken');

        if (currentToken) {
            // Sempre sincronizar com localStorage
            setToken(currentToken);

            try {
                const response = await authService.getMe();
                setUser(response.data.data.usuario);
            } catch (error) {
                // Sessão inválida, limpar tokens silenciosamente
                setToken(null);
                setUser(null);
                localStorage.removeItem('authToken');
            }
        } else {
            setToken(null);
            setUser(null);
        }
        setIsLoadingAuth(false);
    }, []); // Sem dependências

    useEffect(() => {
        verifyAuthOnLoad();
    }, []); // Executar apenas uma vez no mount

    const login = async (email, senhaOrPassword) => {
        try {
            // authService.login faz a chamada apiClient.post('/auth/login', ...)
            const response = await authService.login({ email, senha: senhaOrPassword });

            // ** A CORREÇÃO CRÍTICA ESTÁ AQUI **
            // O axios aninha a resposta em `data`. Nossa API aninha os dados em outro `data`.
            // E o token está no nível superior da resposta da API.
            const apiData = response.data; // Resposta completa do axios

            const newToken = apiData.token; // Pega o token do corpo da resposta
            const userData = apiData.data?.usuario; // Pega o usuário de dentro do 'data'

            if (!newToken || typeof newToken !== 'string') {
                throw new Error("Token não recebido ou inválido do servidor.");
            }

            if (!userData) {
                throw new Error("Dados do usuário não recebidos do servidor.");
            }

            setToken(newToken);
            setUser(userData);

            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });

        } catch (error) {
            console.error("Falha no login (AuthContext):", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Falha no login');
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    const value = { user, token, isAuthenticated: !!user, isLoadingAuth, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {!isLoadingAuth && children}
        </AuthContext.Provider>
    );
};