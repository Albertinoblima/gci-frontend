/**
 * CORREÇÃO CRÍTICA: Validação robusta de token
 * Data: 29/06/2025
 * Problema: "Empty token!" em pinComponent.js
 */

// Função para validar token antes do uso
export const validateToken = (token) => {
    if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
        // Limpar token inválido do localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        return false;
    }

    // Verificar formato JWT básico
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    if (!jwtRegex.test(token)) {
        return false;
    }

    try {
        // Verificar se o token está expirado
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;

        if (payload.exp && payload.exp < now) {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            return false;
        }
    } catch (error) {
        return false;
    }

    return true;
};

// Função para obter token seguro
export const getSecureToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    if (!validateToken(token)) {
        // Limpar todos os dados de autenticação
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');

        // Não redirecionar automaticamente para permitir que o componente trate
        return null;
    }

    return token;
};

// Função para definir token de forma segura
export const setSecureToken = (token) => {
    if (!validateToken(token)) {
        throw new Error('Token inválido fornecido');
    }

    localStorage.setItem('token', token);
};

// Função para limpar autenticação
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('refreshToken');
};

// Função para verificar se está autenticado
export const isAuthenticated = () => {
    const token = getSecureToken();
    return !!token;
};

// Função para obter payload do token
export const getTokenPayload = () => {
    const token = getSecureToken();
    if (!token) return null;

    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        console.error('❌ Erro ao obter payload do token:', error);
        return null;
    }
};

// Função para obter tempo restante do token
export const getTokenTimeRemaining = () => {
    const payload = getTokenPayload();
    if (!payload || !payload.exp) return 0;

    const now = Date.now() / 1000;
    return Math.max(0, payload.exp - now);
};

// Função para verificar se o token está próximo do vencimento (5 minutos)
export const isTokenNearExpiry = () => {
    const timeRemaining = getTokenTimeRemaining();
    return timeRemaining < 5 * 60; // 5 minutos em segundos
};

export default {
    validateToken,
    getSecureToken,
    setSecureToken,
    clearAuth,
    isAuthenticated,
    getTokenPayload,
    getTokenTimeRemaining,
    isTokenNearExpiry
};
