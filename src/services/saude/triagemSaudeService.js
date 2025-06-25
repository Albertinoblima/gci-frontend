// src/services/saude/triagemSaudeService.js
import apiClient from '../apiClient.js'; // Ajuste o caminho

const resourcePath = '/triagens-saude';

const listTriagens = async (params) => {
    try {
        const response = await apiClient.get(resourcePath, { params });
        return response.data;
    } catch (error) {
        console.error("Erro ao listar triagens:", error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao listar triagens');
    }
};

const getById = async (id) => {
    try {
        const response = await apiClient.get(`${resourcePath}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar triagem ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao buscar triagem');
    }
};

const create = async (data) => {
    try {
        const response = await apiClient.post(resourcePath, data);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar triagem:", error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao criar triagem');
    }
};

const update = async (id, data) => {
    try {
        const response = await apiClient.put(`${resourcePath}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar triagem ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao atualizar triagem');
    }
};

// Deleção de triagem é menos comum.
// const remove = async (id) => { ... };

export const triagemSaudeApiService = {
    listTriagens,
    getById,
    create,
    update,
};