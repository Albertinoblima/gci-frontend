// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient.js'; // Seu cliente Axios configurado

/**
 * Custom hook para realizar chamadas de API e gerenciar estados de loading, error e data.
 * @param {function} apiFunc - A função do apiClient que fará a chamada (ex: apiClient.get, apiClient.post).
                               // Ou uma função que encapsula a chamada apiClient.
 * @returns {{
 *   data: any | null,
 *   error: string | null,
 *   isLoading: boolean,
 *   request: (...args: any[]) => Promise<any>
 * }}
 */
export const useApi = (apiFunc) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Executa a função da API.
     * @param  {...any} args - Argumentos a serem passados para a apiFunc (ex: URL, corpo da requisição).
     */
    const request = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);
        setData(null); // Limpa dados anteriores antes de uma nova requisição
        try {
            const response = await apiFunc(...args);
            setData(response.data); // Assumindo que o axios retorna os dados em response.data
            setIsLoading(false);
            return response.data; // Retorna os dados para o chamador poder usá-los diretamente se necessário
        } catch (err) {
            console.error("Erro na chamada da API (useApi hook):", err.response?.data || err.message);
            const errorMessage = err.response?.data?.error || err.message || 'Ocorreu um erro na requisição.';
            setError(errorMessage);
            setIsLoading(false);
            throw err; // Relança o erro para que o componente chamador possa tratá-lo se quiser
        }
    }, [apiFunc]); // apiFunc deve ser estável (ex: definida fora do componente ou memoizada)

    return { data, error, isLoading, request };
};

/**
 * Hook especializado para operações CRUD básicas usando useApi.
 * @param {string} resourcePath - O caminho base do recurso na API (ex: '/municipios').
 */
export const useCrudApi = (resourcePath) => {
    const getAll = useApi((params) => apiClient.get(resourcePath, { params }));
    const getById = useApi((id) => apiClient.get(`${resourcePath}/${id}`));
    const create = useApi((data) => apiClient.post(resourcePath, data));
    const update = useApi((id, data) => apiClient.put(`${resourcePath}/${id}`, data));
    const remove = useApi((id) => apiClient.delete(`${resourcePath}/${id}`)); // 'delete' é palavra reservada

    return {
        getAll,     // { data, error, isLoading, request as fetchAll }
        getById,    // { data, error, isLoading, request as fetchById }
        create,     // { data, error, isLoading, request as createItem }
        update,     // { data, error, isLoading, request as updateItem }
        remove,     // { data, error, isLoading, request as deleteItem }
    };
};