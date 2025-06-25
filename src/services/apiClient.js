// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de requisição básico que sempre verifica o localStorage
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Esta função será chamada de dentro de um componente React para configurar o interceptor de resposta
export const setupAxiosInterceptors = (hooks) => {
    const notification = hooks.notification;
    const { logout } = hooks.auth;

    // Verificar se as funções existem, senão usar notify genérico
    const notifyError = notification.notifyError || ((msg) => notification.notify(msg, 'error'));
    const notifyWarning = notification.notifyWarning || ((msg) => notification.notify(msg, 'warning'));

    // Interceptor de Resposta (versão aprimorada)
    apiClient.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            const { response } = error;
            const originalRequest = error.config;

            if (!response) {
                notifyError('Não foi possível conectar ao servidor. Verifique sua conexão.');
                return Promise.reject(error);
            }

            const message = response.data?.message || 'Ocorreu um erro inesperado.';
            switch (response.status) {
                case 400:
                    notifyError(message || 'Dados inválidos ou requisição malformada.');
                    break;
                case 401:
                    if (!originalRequest.url.includes('/auth/login')) {
                        notifyWarning('Sua sessão expirou. Por favor, faça login novamente.');
                        // Limpar token do localStorage
                        localStorage.removeItem('authToken');
                        logout();
                    }
                    break;
                case 403:
                    notifyError('Acesso negado. Você não tem permissão para esta ação.');
                    break;
                case 404:
                    notifyError('Recurso não encontrado no servidor.');
                    break;
                case 409:
                case 422:
                    notifyError(message);
                    break;
                case 500:
                default:
                    notifyError('Erro interno do servidor. A equipe técnica foi notificada.');
                    break;
            }
            return Promise.reject(error);
        }
    );
};

export default apiClient;