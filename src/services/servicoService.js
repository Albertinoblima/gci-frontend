// src/services/servicoService.js
import apiClient from './apiClient';

const getResourceUrl = (municipioId, secretariaId) => `/municipios/${municipioId}/secretarias/${secretariaId}/servicos`;

const servicoService = {
    getAllBySecretaria: (municipioId, secretariaId) => apiClient.get(getResourceUrl(municipioId, secretariaId)),
    create: (municipioId, secretariaId, data) => apiClient.post(getResourceUrl(municipioId, secretariaId), data),
    update: (municipioId, secretariaId, servicoId, data) => apiClient.put(`${getResourceUrl(municipioId, secretariaId)}/${servicoId}`, data),
    remove: (municipioId, secretariaId, servicoId) => apiClient.delete(`${getResourceUrl(municipioId, secretariaId)}/${servicoId}`),
};

export default servicoService;