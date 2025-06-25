// src/services/usuarioService.js
import apiClient from './apiClient';

const resource = '/usuarios';

const usuarioService = {
    // Retorna a promessa completa do Axios para o TanStack Query gerenciar
    getAll: (params) => apiClient.get(resource, { params }),
    getById: (id) => apiClient.get(`${resource}/${id}`),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`, data),
    remove: (id) => apiClient.delete(`${resource}/${id}`),
};

export default usuarioService;