// src/utils/urls.js

/**
 * Cria uma URL padronizada para uma página da aplicação.
 * Converte o nome da página para minúsculas e substitui espaços por hífens.
 * Adiciona uma barra "/" no início.
 * @param {string} pageName - O nome da página (ex: "Dashboard", "Gerenciar Municípios").
 * @returns {string} A URL formatada (ex: "/dashboard", "/gerenciar-municipios").
 */
export const createPageUrl = (pageName) => {
    if (!pageName || typeof pageName !== 'string') {
        console.warn("createPageUrl: pageName inválido ou ausente. Retornando '/' por padrão.");
        return '/'; // Retorna a raiz como fallback se o nome da página for inválido
    }
    return `/${pageName.trim().toLowerCase().replace(/\s+/g, '-')}`;
};

// Você pode adicionar outras funções utilitárias relacionadas a URLs aqui no futuro, se necessário.
// Por exemplo, para construir URLs de API com parâmetros de forma padronizada, etc.
