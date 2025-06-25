// src/services/saude/tipoExameSaudeService.js
import apiClient from '../apiClient.js'; // Ajuste o caminho

const resourcePath = '/tipos-exames-saude';

const getAll = async (params) => {
    try {
        const response = await apiClient.get(resourcePath, { params });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar tipos de exames:", error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao buscar tipos de exames');
    }
};

const getById = async (id) => {
    try {
        const response = await apiClient.get(`${resourcePath}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar tipo de exame ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao buscar tipo de exame');
    }
};

const create = async (data) => {
    try {
        const response = await apiClient.post(resourcePath, data);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar tipo de exame:", error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao criar tipo de exame');
    }
};

const update = async (id, data) => {
    try {
        const response = await apiClient.put(`${resourcePath}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar tipo de exame ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao atualizar tipo de exame');
    }
};

const remove = async (id) => {
    try {
        const response = await apiClient.delete(`${resourcePath}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao deletar tipo de exame ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao deletar tipo de exame');
    }
};

export const tipoExameSaudeApiService = {
    getAll,
    getById,
    create,
    update,
    remove,
};