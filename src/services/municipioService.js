// src/services/municipioService.js
import apiClient from './apiClient';

const resource = '/municipios';

const municipioService = {
    // Retorna a promessa completa do Axios para o TanStack Query gerenciar
    getAll: (params) => apiClient.get(resource, { params }),
    getById: (id) => apiClient.get(`${resource}/${id}`),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`),
    remove: (id) => apiClient.delete(`${resource}/${id}`),
};

export default municipioService;
export const municipioApiService = municipioService;