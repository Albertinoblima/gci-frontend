// src/routes/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loader2 } from 'lucide-react';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoadingAuth } = useAuth();

    if (isLoadingAuth) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (isAuthenticated) {
        // Se o usuário já está logado, redireciona para o dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;