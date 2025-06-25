// gci-frontend/src/services/cidadaoService.js
import apiClient from './apiClient';

const resource = '/cidadaos';

const cidadaoService = {
    /**
     * Lista todos os cidadãos com filtros
     * @param {object} params - Parâmetros de filtro (municipioId, canal, search, page, limit)
     * @returns {Promise<object>} Lista paginada de cidadãos
     */
    async listCidadaos(params = {}) {
        const searchParams = new URLSearchParams();

        if (params.municipioId) searchParams.append('municipioId', params.municipioId);
        if (params.canal) searchParams.append('canal', params.canal);
        if (params.search) searchParams.append('search', params.search);
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);

        const url = searchParams.toString() ? `${resource}?${searchParams.toString()}` : resource;
        const response = await apiClient.get(url);
        return response.data;
    },

    /**
     * Busca um cidadão por ID
     * @param {number} id - ID do cidadão
     * @returns {Promise<object>} Dados do cidadão
     */
    async getById(id) {
        const response = await apiClient.get(`${resource}/${id}`);
        return response.data;
    },

    /**
     * Lista todos os cidadãos (método legado)
     * @returns {Promise<object>} Lista de cidadãos
     */
    async getAll() {
        const response = await apiClient.get(resource);
        return response.data;
    }
};

// Exportar tanto o serviço quanto um alias para compatibilidade
export default cidadaoService;
export const cidadaoApiService = cidadaoService;