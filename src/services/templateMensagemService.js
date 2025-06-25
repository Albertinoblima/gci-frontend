// src/services/templateMensagemService.js
import apiClient from './apiClient.js';

const resourcePath = '/templates-mensagens';

export const templateMensagemApiService = {
    getAll: async (params) => {
        try {
            const response = await apiClient.get(resourcePath, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Falha ao buscar templates');
        }
    },
    // ... implementar o resto (getById, create, update, remove)
};