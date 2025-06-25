// src/services/educacao/escolaService.js
import apiClient from '../apiClient';

const resource = '/escolas';

const escolaService = {
    getAll: (params) => apiClient.get(resource, { params }),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`, data),
    remove: (id) => apiClient.delete(`${resource}/${id}`),
};

export default escolaService;