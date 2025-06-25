/**
 * @file gci-frontend/src/services/anexoService.js
 * @description Serviço para gerenciar as operações da API relacionadas a anexos.
 */
import apiClient from './apiClient.js';

// CORREÇÃO: Usando 'export const'
export const anexoApiService = {
    /**
     * Realiza o upload de um único arquivo.
     * @param {FormData} formData - O objeto FormData contendo o arquivo e os dados de referência.
     * @param {function(import('axios').AxiosProgressEvent): void} [onUploadProgress] - Callback opcional.
     * @returns {Promise<any>}
     */
    uploadAnexo: async (formData, onUploadProgress) => {
        try {
            const response = await apiClient.post('/anexos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress,
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao fazer upload do anexo:', error.response?.data || error.message);
            throw error.response?.data || new Error('Falha no upload do anexo');
        }
    },

    // ... todos os outros métodos (getAnexosPorReferencia, downloadAnexo, deleteAnexo) permanecem os mesmos ...
};