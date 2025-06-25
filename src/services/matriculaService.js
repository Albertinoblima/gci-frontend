// src/services/matriculaService.js
import apiClient from './apiClient';

const resource = '/matriculas';

const matriculaService = {
    // Retorna a promessa completa do Axios para o TanStack Query gerenciar
    getAll: (params) => apiClient.get(resource, { params }),
    getById: (id) => apiClient.get(`${resource}/${id}`),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`, data),
    remove: (id) => apiClient.delete(`${resource}/${id}`),

    // Método específico para solicitações
    getSolicitacoes: (params) => apiClient.get(`${resource}/solicitacoes`, { params }),
    updateStatus: (id, status) => apiClient.patch(`${resource}/${id}/status`, { status }),
};

export default matriculaService;
