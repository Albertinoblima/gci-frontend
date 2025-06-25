// src/hooks/usePermissions.js
import { useAuth } from './useAuth';

/**
 * Hook centralizado para gerenciar permissões baseadas em roles
 */
export const usePermissions = () => {
    const { user } = useAuth();

    const hasRole = (requiredRoles) => {
        if (!user?.role) return false;
        if (typeof requiredRoles === 'string') {
            return user.role === requiredRoles;
        }
        if (Array.isArray(requiredRoles)) {
            return requiredRoles.includes(user.role);
        }
        return false;
    };

    const isAdminSistema = user?.role === 'admin_sistema';
    const isAdminMunicipio = user?.role === 'admin_municipio';
    const isGestorSecretaria = user?.role === 'gestor_secretaria';
    const isAgenteSaude = user?.role === 'agente_saude';
    const isAgenteEducacao = user?.role === 'agente_educacao';
    const isAgenteAtendimento = user?.role === 'agente_atendimento';

    // Funções auxiliares para verificações comuns
    const canManageUsers = isAdminSistema || isAdminMunicipio;
    const canManageMunicipios = isAdminSistema;
    const canManageSaude = isAdminSistema || isAdminMunicipio;
    const canManageEducacao = isAdminSistema || isAdminMunicipio || isAgenteEducacao;
    const canAccessSaudeAgendas = isAdminSistema || isAdminMunicipio || isAgenteSaude;

    return {
        user,
        hasRole,
        isAdminSistema,
        isAdminMunicipio,
        isGestorSecretaria,
        isAgenteSaude,
        isAgenteEducacao,
        isAgenteAtendimento,
        canManageUsers,
        canManageMunicipios,
        canManageSaude,
        canManageEducacao,
        canAccessSaudeAgendas,
    };
};
