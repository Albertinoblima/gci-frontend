/**
 * INICIALIZAÇÃO AUTOMÁTICA DE SERVIÇOS
 * Data: 29/06/2025
 */

import socketService from '../services/socketService.js';
import pinCompanyService from '../services/pinCompanyService.js';

class ServiceInitializer {
    constructor() {
        this.services = {
            socket: socketService,
            pinCompany: pinCompanyService
        };
        this.initialized = false;
    }

    async initializeAll() {
        if (this.initialized) {
            return;
        }

        try {
            // Inicializar Socket.IO apenas se autenticado
            const token = localStorage.getItem('token');
            if (token) {
                await this.services.socket.connect();
            }

            // Verificar status do PIN Company
            const pinStatus = await this.services.pinCompany.checkStatus();

            // Sincronizar dados offline se houver
            if (pinStatus.status === 'online') {
                await this.services.pinCompany.syncOfflineData();
            }

            this.initialized = true;

        } catch (error) {
            console.error('❌ Erro na inicialização de serviços:', error);
        }
    }

    async reinitialize() {
        this.initialized = false;
        await this.initializeAll();
    }

    getServiceStatus() {
        return {
            socket: {
                connected: this.services.socket.isConnected(),
                status: this.services.socket.getStatus()
            },
            pinCompany: this.services.pinCompany.getStats()
        };
    }
}

const serviceInitializer = new ServiceInitializer();

// Auto-inicializar quando importado
if (typeof window !== 'undefined') {
    // Aguardar DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            serviceInitializer.initializeAll();
        });
    } else {
        serviceInitializer.initializeAll();
    }
}

export default serviceInitializer;
