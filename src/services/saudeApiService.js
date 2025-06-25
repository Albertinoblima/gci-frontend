// gci-frontend/src/services/saudeApiService.js
import apiClient from './apiClient';

const saudeApiService = {
    getOpcoesAgendamento: () => apiClient.get('/saude/opcoes-agendamento'),
    getHorariosDisponiveis: (params) => apiClient.get('/saude/horarios-disponiveis', { params }),
    createAgendamento: (data) => apiClient.post('/agendamentos_saude', data), // Usando a rota de agendamento que já existe
};

export default saudeApiService;