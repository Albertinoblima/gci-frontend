// gci-frontend/src/components/security/HierarchyGuard.jsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth.js';

/**
 * Componente de guarda para controle de hierarquia de usuários
 * Protege ações baseadas na hierarquia de roles
 */

const ROLE_HIERARCHY = {
    'admin_sistema': 1,
    'admin_municipio': 2,
    'gestor_secretaria': 3,
    'agente_saude': 4,
    'agente_educacao': 4,
    'agente_atendimento': 4,
    'cidadao': 5
};

const getRoleLevel = (role) => {
    return ROLE_HIERARCHY[role] || 999;
};

const HierarchyGuard = ({
    children,
    targetUser,
    action = 'view',
    fallback = null,
    requireSameLevel = false
}) => {
    const { user: currentUser } = useAuth();

    if (!currentUser || !targetUser) {
        return fallback;
    }

    const currentUserLevel = getRoleLevel(currentUser.role);
    const targetUserLevel = getRoleLevel(targetUser.role);

    // Admin sistema pode fazer qualquer coisa
    if (currentUser.role === 'admin_sistema') {
        return children;
    }

    // Verificar se usuário pode realizar a ação no usuário alvo
    switch (action) {
        case 'view':
            // Não pode ver usuários de nível superior
            if (currentUserLevel >= targetUserLevel) {
                return fallback;
            }
            break;

        case 'edit':
            // Não pode editar usuários de nível superior ou igual
            if (currentUserLevel >= targetUserLevel) {
                return fallback;
            }
            break;

        case 'delete':
            // Não pode deletar usuários de nível superior ou igual
            if (currentUserLevel >= targetUserLevel) {
                return fallback;
            }

            // Admin município não pode deletar outros admin município
            if (currentUser.role === 'admin_municipio' &&
                targetUser.role === 'admin_municipio' &&
                currentUser.id !== targetUser.id) {
                return fallback;
            }
            break;

        case 'create':
            // Verificar se pode criar usuário com a role especificada
            if (currentUserLevel >= targetUserLevel) {
                return fallback;
            }
            break;

        default:
            return fallback;
    }

    // Verificar se usuários são do mesmo município (quando aplicável)
    if (currentUser.role !== 'admin_sistema' &&
        currentUser.municipio_id !== targetUser.municipio_id) {
        return fallback;
    }

    return children;
};

export default HierarchyGuard;

// Hook para usar a lógica de hierarquia
export const useHierarchy = () => {
    const { user: currentUser } = useAuth();

    const canManageUser = (targetUser, action = 'view') => {
        if (!currentUser || !targetUser) return false;

        const currentUserLevel = getRoleLevel(currentUser.role);
        const targetUserLevel = getRoleLevel(targetUser.role);

        // Admin sistema pode fazer qualquer coisa
        if (currentUser.role === 'admin_sistema') {
            return true;
        }

        // Verificar hierarquia
        switch (action) {
            case 'view':
                return currentUserLevel < targetUserLevel;
            case 'edit':
                return currentUserLevel < targetUserLevel;
            case 'delete':
                if (currentUserLevel >= targetUserLevel) return false;
                if (currentUser.role === 'admin_municipio' &&
                    targetUser.role === 'admin_municipio' &&
                    currentUser.id !== targetUser.id) return false;
                return true;
            default:
                return false;
        }
    };

    const canCreateRole = (targetRole) => {
        if (!currentUser) return false;

        const currentUserLevel = getRoleLevel(currentUser.role);
        const targetRoleLevel = getRoleLevel(targetRole);

        // Admin sistema pode criar qualquer role
        if (currentUser.role === 'admin_sistema') {
            return true;
        }

        // Outros só podem criar roles inferiores
        return currentUserLevel < targetRoleLevel;
    };

    const isUserVisible = (targetUser) => {
        if (!currentUser || !targetUser) return false;

        // Admin sistema vê todos
        if (currentUser.role === 'admin_sistema') {
            return true;
        }

        // Não pode ver admin_sistema
        if (targetUser.role === 'admin_sistema') {
            return false;
        }

        // Verificar se é do mesmo município
        if (currentUser.municipio_id !== targetUser.municipio_id) {
            return false;
        }

        return true;
    };

    return {
        canManageUser,
        canCreateRole,
        isUserVisible,
        currentUserLevel: getRoleLevel(currentUser?.role),
        getRoleLevel
    };
};
