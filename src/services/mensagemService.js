// src/services/mensagemService.js
import apiClient from './apiClient';

// A rota base para as mensagens já inclui o atendimentoId
const getResourceUrl = (atendimentoId) => `/atendimentos/${atendimentoId}/mensagens`;

const mensagemService = {
    /**
     * Busca as mensagens de um atendimento.
     * @param {string|number} atendimentoId 
     * @param {object} params - Parâmetros de paginação
     */
    getByAtendimentoId: (atendimentoId, params) => {
        return apiClient.get(getResourceUrl(atendimentoId), { params });
    },

    /**
     * Cria uma nova mensagem no atendimento.
     * @param {string|number} atendimentoId 
     * @param {object} data - O corpo da mensagem (ex: { conteudo_texto: '...' })
     */
    create: (atendimentoId, data) => {
        return apiClient.post(getResourceUrl(atendimentoId), data);
    },
};

export default mensagemService;