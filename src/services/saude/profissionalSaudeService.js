// src/services/saude/profissionalSaudeService.js
import apiClient from '../apiClient';

const resource = '/profissionais-saude';

const profissionalSaudeService = {
    getAll: (params) => apiClient.get(resource, { params }),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`, data),
    remove: (id) => apiClient.delete(`${resource}/${id}`),

    // Para os vínculos
    getLinks: (profissionalId) => apiClient.get(`${resource}/${profissionalId}/vinculos`),
    createLink: (profissionalId, data) => apiClient.post(`${resource}/${profissionalId}/vinculos`, data),
};

export default profissionalSaudeService;