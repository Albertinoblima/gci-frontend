// src/services/secretariaService.js
import apiClient from './apiClient';

const getResourceUrl = (municipioId) => `/municipios/${municipioId}/secretarias`;

const secretariaService = {
    getAllByMunicipio: (municipioId) => apiClient.get(getResourceUrl(municipioId)),
    create: (municipioId, data) => apiClient.post(getResourceUrl(municipioId), data),
    update: (municipioId, secretariaId, data) => apiClient.put(`${getResourceUrl(municipioId)}/${secretariaId}`, data),
    remove: (municipioId, secretariaId) => apiClient.delete(`${getResourceUrl(municipioId)}/${secretariaId}`),
};

export default secretariaService;