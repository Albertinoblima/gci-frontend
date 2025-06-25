// src/services/educacao/matriculaService.js
import apiClient from '../apiClient';

const resource = '/solicitacoes-matricula';

const matriculaService = {
    getAll: (params) => apiClient.get(resource, { params }),
    getById: (id) => apiClient.get(`${resource}/${id}`),
    // A criação seria feita pelo cidadão, mas mantemos aqui para possíveis usos futuros
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.patch(`${resource}/${id}/status`, data),
};

export default matriculaService;