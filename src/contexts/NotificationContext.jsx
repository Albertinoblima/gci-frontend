// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
    DEFAULT: 'default',
};

// 1. Crie e EXPORTE o contexto
export const NotificationContext = createContext(null);

// 2. Crie e EXPORTE o hook customizado para consumir o contexto
export const useNotifier = () => {
    const context = useContext(NotificationContext); // Consome o NotificationContext exportado
    if (context === undefined || context === null) {
        throw new Error('useNotifier deve ser usado dentro de um NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const defaultOptions = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
    };

    const notify = useCallback((message, type = NOTIFICATION_TYPES.INFO, options = {}) => {
        const toastOptions = { ...defaultOptions, ...options };
        switch (type) {
            case NOTIFICATION_TYPES.SUCCESS:
                toast.success(message, toastOptions);
                break;
            case NOTIFICATION_TYPES.ERROR:
                toast.error(message, toastOptions);
                break;
            case NOTIFICATION_TYPES.WARNING:
                toast.warn(message, toastOptions);
                break;
            case NOTIFICATION_TYPES.INFO:
                toast.info(message, toastOptions);
                break;
            default:
                toast(message, toastOptions);
                break;
        }
    }, []); // defaultOptions é estável, não precisa estar na dependência

    // Funções de conveniência para diferentes tipos de notificação
    const notifySuccess = useCallback((message, options = {}) => {
        notify(message, NOTIFICATION_TYPES.SUCCESS, options);
    }, [notify]);

    const notifyError = useCallback((message, options = {}) => {
        notify(message, NOTIFICATION_TYPES.ERROR, options);
    }, [notify]);

    const notifyWarning = useCallback((message, options = {}) => {
        notify(message, NOTIFICATION_TYPES.WARNING, options);
    }, [notify]);

    const notifyInfo = useCallback((message, options = {}) => {
        notify(message, NOTIFICATION_TYPES.INFO, options);
    }, [notify]);

    const contextValue = {
        notify,
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo,
        NOTIFICATION_TYPES // Exportar os tipos também pode ser útil
    };

    return (
        <NotificationContext.Provider value={contextValue}> {/* Usa o NotificationContext exportado */}
            {children}
            <ToastContainer />
        </NotificationContext.Provider>
    );
};