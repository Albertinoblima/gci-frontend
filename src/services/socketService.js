/**
 * CORREÇÃO: Serviço Socket.IO robusto com reconexão
 * Data: 29/06/2025
 * Problema: "WebSocket is closed before the connection is established"
 */

import io from 'socket.io-client';
import { getSecureToken } from '../utils/auth.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 2000;
        this.isConnecting = false;
        this.connectionPromise = null;
        this.listeners = new Map();
        this.connectionStatus = 'disconnected'; // disconnected, connecting, connected
    }

    async connect() {
        // Evitar múltiplas conexões simultâneas
        if (this.isConnecting || this.connectionStatus === 'connected') {
            console.log('🔌 Conexão já em andamento ou conectado');
            return this.connectionPromise;
        }

        this.isConnecting = true;
        this.connectionStatus = 'connecting';

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                console.log('🔌 Iniciando conexão WebSocket...');

                // Limpar conexão anterior se existir
                if (this.socket) {
                    this.socket.disconnect();
                    this.socket = null;
                }

                // Obter token para autenticação
                const token = getSecureToken();

                // Configurar opções de conexão
                const socketOptions = {
                    transports: ['websocket', 'polling'], // Tentar WebSocket primeiro, depois polling
                    timeout: 10000, // 10 segundos
                    reconnection: false, // Controlar reconexão manualmente
                    autoConnect: false, // Conectar manualmente
                    forceNew: true,
                    auth: {
                        token: token
                    }
                };

                this.socket = io(BACKEND_URL, socketOptions);

                // Event listeners
                this.socket.on('connect', () => {
                    console.log('✅ Socket.IO Conectado:', this.socket.id);
                    this.connectionStatus = 'connected';
                    this.reconnectAttempts = 0;
                    this.isConnecting = false;

                    // Re-registrar listeners
                    this.reregisterListeners();

                    resolve(this.socket);
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('🔌 Socket.IO Desconectado:', reason);
                    this.connectionStatus = 'disconnected';

                    // Tentar reconectar se não foi desconexão manual
                    if (reason !== 'io client disconnect') {
                        this.handleReconnection();
                    }
                });

                this.socket.on('connect_error', (error) => {
                    console.warn('❌ Erro de conexão WebSocket:', error.message);
                    this.connectionStatus = 'disconnected';
                    this.isConnecting = false;

                    if (this.reconnectAttempts === 0) {
                        // Primeira tentativa falhou, tentar com polling apenas
                        this.tryPollingConnection()
                            .then(resolve)
                            .catch(() => {
                                this.handleConnectionError();
                                reject(error);
                            });
                    } else {
                        reject(error);
                    }
                });

                this.socket.on('reconnect_error', (error) => {
                    console.warn('❌ Erro de reconexão:', error.message);
                });

                // Iniciar conexão
                this.socket.connect();

            } catch (error) {
                console.error('❌ Erro ao inicializar WebSocket:', error);
                this.isConnecting = false;
                this.connectionStatus = 'disconnected';
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    async tryPollingConnection() {
        console.log('🔄 Tentando conexão via polling como fallback...');

        return new Promise((resolve, reject) => {
            if (this.socket) {
                this.socket.disconnect();
            }

            const token = getSecureToken();

            // Tentar com polling apenas
            this.socket = io(BACKEND_URL, {
                transports: ['polling'], // Apenas polling
                timeout: 15000, // Mais tempo para polling
                reconnection: false,
                auth: {
                    token: token
                }
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket.IO Conectado via polling:', this.socket.id);
                this.connectionStatus = 'connected';
                this.isConnecting = false;
                resolve(this.socket);
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Falha na conexão via polling:', error);
                reject(error);
            });

            this.socket.connect();
        });
    }

    handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('⚠️ Máximo de tentativas de reconexão atingido');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Backoff exponencial

        console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);

        setTimeout(() => {
            this.connect().catch(error => {
                console.error('❌ Falha na reconexão:', error);
            });
        }, delay);
    }

    handleConnectionError() {
        console.error('❌ Falha completa na conexão WebSocket');
        this.isConnecting = false;
        this.connectionStatus = 'disconnected';

        // Implementar modo offline ou fallback
        this.enableOfflineMode();
    }

    enableOfflineMode() {
        console.log('📴 Ativando modo offline para Socket.IO');

        // Criar mock socket para evitar erros
        this.socket = {
            emit: (event, data) => {
                console.log('📤 [OFFLINE] Evento Socket:', event, data);
                // Armazenar eventos para sincronizar quando conectar
                this.queueOfflineEvent(event, data);
            },
            on: () => { }, // Listener vazio
            off: () => { }, // Listener vazio
            disconnect: () => { }
        };
    }

    queueOfflineEvent(event, data) {
        if (!this.offlineQueue) this.offlineQueue = [];

        this.offlineQueue.push({
            event,
            data,
            timestamp: Date.now()
        });

        // Manter apenas os últimos 50 eventos
        if (this.offlineQueue.length > 50) {
            this.offlineQueue.splice(0, this.offlineQueue.length - 50);
        }
    }

    // Registrar listener com fallback
    on(event, callback) {
        // Armazenar listener para re-registro
        this.listeners.set(event, callback);

        if (this.socket && this.connectionStatus === 'connected') {
            this.socket.on(event, callback);
        }
    }

    // Remover listener
    off(event, callback) {
        this.listeners.delete(event);

        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Emit com verificação de conexão
    emit(event, data, callback) {
        if (!this.socket || this.connectionStatus !== 'connected') {
            console.warn('⚠️ Socket não conectado, armazenando evento para envio posterior');
            this.queueOfflineEvent(event, data);

            if (callback) {
                callback({ error: 'Socket não conectado' });
            }
            return;
        }

        this.socket.emit(event, data, callback);
    }

    // Re-registrar todos os listeners após reconexão
    reregisterListeners() {
        console.log('🔄 Re-registrando listeners do Socket...');

        for (const [event, callback] of this.listeners) {
            this.socket.on(event, callback);
        }

        // Enviar eventos da fila offline
        this.processOfflineQueue();
    }

    processOfflineQueue() {
        if (!this.offlineQueue || this.offlineQueue.length === 0) return;

        console.log(`📤 Processando ${this.offlineQueue.length} eventos offline...`);

        this.offlineQueue.forEach(({ event, data }) => {
            this.socket.emit(event, data);
        });

        this.offlineQueue = [];
    }

    // Desconectar
    disconnect() {
        if (this.socket) {
            console.log('🔌 Desconectando WebSocket...');
            this.socket.disconnect();
            this.socket = null;
        }

        this.connectionStatus = 'disconnected';
        this.isConnecting = false;
        this.reconnectAttempts = 0;
    }

    // Obter status da conexão
    getStatus() {
        return {
            status: this.connectionStatus,
            socketId: this.socket?.id,
            reconnectAttempts: this.reconnectAttempts,
            isConnecting: this.isConnecting
        };
    }

    // Verificar se está conectado
    isConnected() {
        return this.connectionStatus === 'connected' && this.socket?.connected;
    }
}

// Instância singleton
const socketService = new SocketService();

export default socketService;
