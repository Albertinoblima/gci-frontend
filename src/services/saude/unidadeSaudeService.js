// src/services/saude/unidadeSaudeService.js
import apiClient from '../apiClient';

const resource = '/unidades-saude';

const unidadeSaudeService = {
    // Lista unidades do município do usuário logado ou filtra por município (admin_sistema)
    getAll: (municipioId = null) => {
        const params = municipioId ? { municipio_id: municipioId } : {};
        return apiClient.get(resource, { params });
    },
    getAllByMunicipio: (municipioId) => apiClient.get(`${resource}/municipio/${municipioId}`),
    create: (data) => apiClient.post(resource, data),
    update: (id, data) => apiClient.put(`${resource}/${id}`, data),
    remove: (id) => apiClient.delete(`${resource}/${id}`),
};

export default unidadeSaudeService;