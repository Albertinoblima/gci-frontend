// src/services/saude/agendamentoSaudeService.js
import apiClient from '../apiClient.js'; // Ajuste o caminho

const resourcePath = '/agendamentos-saude';

const listAgendamentos = async (params) => {
    try {
        const response = await apiClient.get(resourcePath, { params });
        return response.data;
    } catch (error) {
        console.error("Erro ao listar agendamentos:", error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao listar agendamentos');
    }
};

const getById = async (id) => {
    try {
        const response = await apiClient.get(`${resourcePath}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar agendamento ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao buscar agendamento');
    }
};

const create = async (data) => {
    try {
        const response = await apiClient.post(resourcePath, data);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar agendamento:", error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao criar agendamento');
    }
};

// Atualiza o status de um agendamento (cancelar, confirmar, realizado, etc.)
const updateStatus = async (id, statusData) => { // statusData: { status_agendamento, observacoes_unidade }
    try {
        const response = await apiClient.put(`${resourcePath}/${id}/status`, statusData); // Rota específica para status
        // Ou, se for uma rota PUT genérica: await apiClient.put(`${resourcePath}/${id}`, statusData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar status do agendamento ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Falha ao atualizar status do agendamento');
    }
};

// Se houver uma rota PUT genérica para atualizar outros campos:
// const update = async (id, data) => { ... };

export const agendamentoSaudeApiService = {
    listAgendamentos,
    getById,
    create,
    updateStatus,
    // Adicionar alias para compatibilidade
    getAll: listAgendamentos
};

// Export default para compatibilidade
export default agendamentoSaudeApiService;