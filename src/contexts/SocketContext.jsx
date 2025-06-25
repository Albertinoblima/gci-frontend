// gci-frontend/src/contexts/SocketContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.js'; // Hook para acessar o token de autenticação

// 1. Cria o contexto. O valor inicial é null, pois não há socket sem autenticação.
const SocketContext = createContext(null);

/**
 * Hook customizado para fornecer acesso fácil à instância do socket.
 * Garante que o hook seja usado dentro do provider.
 * @returns {import('socket.io-client').Socket | null} A instância do socket ou null.
 */
export const useSocket = () => {
    // Apenas retorna o contexto. Simples e direto.
    return useContext(SocketContext);
};

// ** CORREÇÃO IMPORTANTE **
// A URL do servidor backend para a conexão do Socket.IO.
// Ela deve apontar para a raiz do servidor Node.js, não para o /api.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';


/**
 * Provider que gerencia o ciclo de vida da conexão do Socket.IO.
 * Ele conecta quando o usuário faz login (token aparece) e desconecta no logout.
 */
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token } = useAuth(); // Pega apenas o token do nosso AuthContext.

    useEffect(() => {
        // A conexão SÓ deve ser estabelecida se houver um token válido.
        if (token) {
            // Cria a instância do socket usando a URL correta.
            const newSocket = io(BACKEND_URL, {
                // 'auth' é o método padrão e recomendado para enviar credenciais de autenticação.
                auth: {
                    token,
                },
                reconnectionAttempts: 5,   // Tenta reconectar 5 vezes em caso de falha.
                transports: ['websocket'], // Força o uso de WebSockets para melhor performance.
            });

            // Listeners para depuração e monitoramento do estado da conexão.
            newSocket.on('connect', () => {
                console.log(`Socket.IO Conectado com sucesso: ${newSocket.id}`);
            });

            newSocket.on('connect_error', (err) => {
                console.error(`Socket.IO Erro de Conexão: ${err.message}. Verifique se o backend está rodando em ${BACKEND_URL} e se o CORS está configurado corretamente.`);
            });

            newSocket.on('disconnect', (reason) => {
                console.log(`Socket.IO Desconectado: ${reason}`);
            });

            // Define a instância do socket no estado para que os componentes possam usá-la.
            setSocket(newSocket);

            // Função de limpeza (cleanup) do useEffect: essencial!
            // É executada quando o componente é desmontado ou quando o `token` muda.
            return () => {
                console.log("Limpando conexão do socket...");
                newSocket.disconnect();
            };
        } else {
            // Se não há token (usuário deslogou) e um socket ainda existe, desconecta.
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }

        // A dependência deste efeito é apenas o token.
        // Se ele mudar (de null para string no login, ou de string para null no logout),
        // o efeito é re-executado, limpando a conexão antiga e criando uma nova se necessário.
    }, [token]);

    // O valor fornecido pelo provider é a própria instância do socket (ou null).
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};