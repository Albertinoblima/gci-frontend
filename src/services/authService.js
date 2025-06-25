// src/services/authService.js
import apiClient from './apiClient';

const authService = {
    login(credentials) {
        return apiClient.post('/auth/login', credentials);
    },
    getMe() {
        return apiClient.get('/auth/me');
    },
};

// GARANTIR QUE ESTEJA USANDO EXPORT DEFAULT
export default authService;