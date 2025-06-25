// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Hook customizado para usar o context
import LoadingSpinner from '../components/shared/LoadingSpinner'; // Um componente de loading genérico

/**
 * Um componente de rota que protege o acesso a certas páginas.
 * 1. Verifica se a autenticação inicial já foi concluída.
 * 2. Se não estiver autenticado, redireciona para a página de login.
 * 3. Se estiver autenticado, verifica se o usuário tem a permissão (role) necessária.
 * 4. CORREÇÃO CRÍTICA: Valida se usuário tem município válido quando necessário.
 * 5. Se não tiver permissão, redireciona para uma página de "Não Autorizado" ou para o dashboard.
 *
 * @param {object} props
 * @param {JSX.Element} props.children O componente/página a ser renderizado se o usuário estiver autorizado.
 * @param {string[]} [props.roles] Um array opcional de roles permitidas para acessar a rota.
 * @param {boolean} [props.requireMunicipio] Se a rota exige que o usuário tenha município válido.
 */
export const ProtectedRoute = ({ children, roles = [], requireMunicipio = false }) => {
    const { isAuthenticated, user, isLoadingAuth } = useAuth();
    const location = useLocation();

    // 1. Enquanto a verificação inicial do token está acontecendo, exibe um loader.
    // Isso previne o "flash" da página de login antes de redirecionar para o dashboard.
    if (isLoadingAuth) {
        return <LoadingSpinner fullScreen />; // Ou qualquer componente de loading de sua preferência
    }

    // 2. Após o carregamento, se não estiver autenticado, redireciona para o login.
    // Guardamos a localização atual para que possamos redirecionar de volta após o login.
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Se estiver autenticado, mas a rota exige uma role específica e o usuário não a possui.
    if (roles.length > 0 && !roles.includes(user.role)) {
        console.warn(`Acesso negado para o usuário ${user.email} na rota ${location.pathname}. Role necessária: ${roles}. Role do usuário: ${user.role}`);
        return <Navigate to="/dashboard" replace />;
    }

    // CORREÇÃO CRÍTICA: 4. Validar se usuário tem município válido quando necessário
    if (requireMunicipio) {
        const rolesQueExigemMunicipio = ['admin_municipio', 'gestor_secretaria', 'agente_saude', 'agente_educacao', 'agente_atendimento'];
        if (rolesQueExigemMunicipio.includes(user.role) && !user.municipio_id) {
            console.warn(`Usuário ${user.email} com role ${user.role} não tem município válido para acessar ${location.pathname}`);
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 5. Se passou por todas as verificações, renderiza a página solicitada.
    return children;
};