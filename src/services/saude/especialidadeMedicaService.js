// src/services/saude/especialidadeMedicaService.js
import apiClient from '../apiClient';

const resource = '/especialidades-medicas';

const especialidadeMedicaService = {
    getAll: () => apiClient.get(resource),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`, data),
    remove: (id) => apiClient.delete(`${resource}/${id}`),
};

export default especialidadeMedicaService;