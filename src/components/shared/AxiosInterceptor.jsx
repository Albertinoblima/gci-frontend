import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Caminho corrigido
import { useNotifier } from '../../contexts/NotificationContext'; // Nome e caminho corrigidos
import { setupAxiosInterceptors } from '../../services/apiClient';

const AxiosInterceptor = ({ children }) => {
    const authHooks = useAuth();
    // O useNotifier retorna um objeto { notify }
    const notifierHooks = useNotifier();

    useEffect(() => {
        // setupAxiosInterceptors espera um objeto com chaves 'auth' e 'notification'
        setupAxiosInterceptors({ auth: authHooks, notification: notifierHooks });
    }, [authHooks, notifierHooks]);

    return children;
};

export default AxiosInterceptor;
