// src/services/atendimentoApiService.js
import apiClient from './apiClient';

const atendimentoApiService = {
    /**
     * Busca atendimentos com base em filtros.
     * @param {object} params - Parâmetros de query (ex: { status: 'aberto,em_andamento' })
     */
    getAll: (params) => {
        return apiClient.get('/atendimentos', { params });
    },

    /**
     * Busca um único atendimento pelo seu ID.
     * @param {string|number} id - O ID do atendimento.
     */
    getById: (id) => {
        // A rota no backend é /api/atendimentos/:idOrProtocolo
        return apiClient.get(`/atendimentos/${id}`);
    },

    // Você pode adicionar outros métodos aqui conforme necessário
};

export default atendimentoApiService;