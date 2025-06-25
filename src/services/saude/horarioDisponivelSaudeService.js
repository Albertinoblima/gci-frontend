// src/services/saude/horarioDisponivelSaudeService.js
import apiClient from '../apiClient';

const resource = '/horarios-disponiveis-saude';

const horarioDisponivelSaudeService = {
    getAll: (params) => apiClient.get(resource, { params }),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`, data),
    remove: (id) => apiClient.delete(`${resource}/${id}`),
    getVinculosProfissional: (profissionalId) => apiClient.get(`/profissionais-saude/${profissionalId}/vinculos`).then(res => res.data?.data || res.data),
    createBatch: (profissionalId, data) => apiClient.post(`${resource}/batch`, { profissionalId, ...data }).then(res => res.data?.data || res.data),
};

export default horarioDisponivelSaudeService;