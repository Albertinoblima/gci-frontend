// src/services/dashboardService.js
import apiClient from './apiClient';

const resource = '/dashboard';

const dashboardService = {
    getStats: () => apiClient.get(`${resource}/stats`),
    getAtendimentosPorSecretaria: () => apiClient.get(`${resource}/atendimentos-por-secretaria`),
    getAtendimentosRecentes: () => apiClient.get(`${resource}/atendimentos-recentes`),
};

export default dashboardService;