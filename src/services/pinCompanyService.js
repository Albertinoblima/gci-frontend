/**
 * CORREÇÃO: PIN Company Service aprimorado
 * Data: 29/06/2025
 * Problema: "PIN Company Discounts Provider: Error: Invalid data"
 */

// Validação de dados para PIN Company Provider
class PinCompanyService {
    constructor() {
        // Verificar se process está disponível (compatibilidade Vite)
        const env = typeof process !== 'undefined' ? process.env : import.meta.env;

        this.isEnabled = env?.REACT_APP_PIN_COMPANY_ENABLED === 'true' ||
            env?.VITE_PIN_COMPANY_ENABLED === 'true' ||
            false;
        this.apiEndpoint = env?.REACT_APP_PIN_COMPANY_API ||
            env?.VITE_PIN_COMPANY_API ||
            '/api/pin-company';
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    validateCompanyData(data) {
        if (!data || typeof data !== 'object') {
            console.warn('⚠️ PIN Company: Dados inválidos - não é um objeto');
            return false;
        }

        const requiredFields = ['companyId', 'userId', 'discountType'];

        for (const field of requiredFields) {
            if (!data[field] || data[field] === '' || data[field] === undefined || data[field] === null) {
                console.warn(`⚠️ PIN Company: Campo obrigatório ausente ou inválido: ${field}`);
                return false;
            }
        }

        // Validar tipos de dados
        if (typeof data.companyId !== 'string' || data.companyId.trim() === '') {
            console.warn('⚠️ PIN Company: companyId deve ser uma string não vazia');
            return false;
        }

        if (typeof data.userId !== 'string' || data.userId.trim() === '') {
            console.warn('⚠️ PIN Company: userId deve ser uma string não vazia');
            return false;
        }

        if (typeof data.discountType !== 'string' || data.discountType.trim() === '') {
            console.warn('⚠️ PIN Company: discountType deve ser uma string não vazia');
            return false;
        }

        // Validações específicas
        const validDiscountTypes = ['percentage', 'fixed', 'employee', 'corporate'];
        if (!validDiscountTypes.includes(data.discountType)) {
            console.warn(`⚠️ PIN Company: discountType inválido. Valores aceitos: ${validDiscountTypes.join(', ')}`);
            return false;
        }

        return true;
    }

    sanitizeData(data) {
        if (!data) return null;

        return {
            companyId: String(data.companyId).trim(),
            userId: String(data.userId).trim(),
            discountType: String(data.discountType).trim().toLowerCase(),
            amount: data.amount ? Number(data.amount) : 0,
            description: data.description ? String(data.description).trim() : '',
            validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
            metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : {}
        };
    }

    async sendDiscountData(rawData, retryCount = 0) {
        if (!this.isEnabled) {
            console.log('🔒 PIN Company service desabilitado');
            return { success: true, message: 'Service disabled', disabled: true };
        }

        try {
            // Sanitizar dados primeiro
            const data = this.sanitizeData(rawData);

            if (!data) {
                throw new Error('Dados fornecidos são nulos ou indefinidos');
            }

            // Validar dados após sanitização
            if (!this.validateCompanyData(data)) {
                throw new Error('Dados inválidos após validação');
            }

            console.log('📤 Enviando dados para PIN Company:', {
                ...data,
                metadata: Object.keys(data.metadata).length > 0 ? data.metadata : 'empty'
            });

            // Obter token de autenticação
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            if (!token) {
                console.warn('⚠️ PIN Company: Token não encontrado, operação em modo offline');
                return this.handleOfflineMode(data);
            }

            const response = await fetch(`${this.apiEndpoint}/discount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Client-Version': '1.0.0',
                    'X-Timestamp': Date.now().toString()
                },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(10000) // 10 segundos de timeout
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Erro desconhecido'}`);
            }

            const result = await response.json();
            console.log('✅ PIN Company response:', result);

            return {
                success: true,
                data: result,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('❌ Erro PIN Company Provider:', error.message);

            // Tentar retry se não for erro de validação
            if (retryCount < this.maxRetries && !error.message.includes('inválido')) {
                console.log(`🔄 Tentativa ${retryCount + 1}/${this.maxRetries} para PIN Company...`);

                await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
                return this.sendDiscountData(rawData, retryCount + 1);
            }

            // Retornar um fallback em caso de erro
            return {
                success: false,
                error: error.message,
                fallback: true,
                retryCount,
                timestamp: Date.now()
            };
        }
    }

    handleOfflineMode(data) {
        console.log('📴 PIN Company: Modo offline ativado');

        // Armazenar dados para sincronização posterior
        const offlineData = JSON.parse(localStorage.getItem('pin_company_offline') || '[]');
        offlineData.push({
            ...data,
            timestamp: Date.now(),
            status: 'pending'
        });

        // Manter apenas os últimos 50 registros
        if (offlineData.length > 50) {
            offlineData.splice(0, offlineData.length - 50);
        }

        localStorage.setItem('pin_company_offline', JSON.stringify(offlineData));

        return {
            success: true,
            offline: true,
            message: 'Dados armazenados para sincronização posterior',
            queueSize: offlineData.length
        };
    }

    async syncOfflineData() {
        if (!this.isEnabled) return { success: true, message: 'Service disabled' };

        const offlineData = JSON.parse(localStorage.getItem('pin_company_offline') || '[]');

        if (offlineData.length === 0) {
            console.log('✅ PIN Company: Nenhum dado offline para sincronizar');
            return { success: true, synced: 0 };
        }

        console.log(`🔄 Sincronizando ${offlineData.length} registros PIN Company...`);

        let syncedCount = 0;
        const failedItems = [];

        for (const item of offlineData) {
            try {
                const result = await this.sendDiscountData(item);
                if (result.success && !result.offline) {
                    syncedCount++;
                } else {
                    failedItems.push(item);
                }
            } catch (error) {
                console.error('❌ Erro na sincronização:', error);
                failedItems.push(item);
            }
        }

        // Atualizar dados offline apenas com os que falharam
        localStorage.setItem('pin_company_offline', JSON.stringify(failedItems));

        console.log(`✅ PIN Company: ${syncedCount} registros sincronizados, ${failedItems.length} falharam`);

        return {
            success: true,
            synced: syncedCount,
            failed: failedItems.length,
            remaining: failedItems.length
        };
    }

    // Método para verificar status do serviço
    async checkStatus() {
        if (!this.isEnabled) {
            return { status: 'disabled', message: 'PIN Company service is disabled' };
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                return { status: 'online', ...data };
            } else {
                return { status: 'error', code: response.status };
            }
        } catch (error) {
            return { status: 'offline', error: error.message };
        }
    }

    // Método para limpar dados offline
    clearOfflineData() {
        localStorage.removeItem('pin_company_offline');
        console.log('🗑️ PIN Company: Dados offline limpos');
    }

    // Método para obter estatísticas
    getStats() {
        const offlineData = JSON.parse(localStorage.getItem('pin_company_offline') || '[]');

        return {
            isEnabled: this.isEnabled,
            offlineQueue: offlineData.length,
            lastSync: localStorage.getItem('pin_company_last_sync'),
            endpoint: this.apiEndpoint
        };
    }
}

// Instância singleton
const pinCompanyService = new PinCompanyService();

// Auto-sincronização periódica (a cada 5 minutos)
if (typeof window !== 'undefined' && pinCompanyService.isEnabled) {
    setInterval(() => {
        pinCompanyService.syncOfflineData().catch(error => {
            console.error('❌ Erro na sincronização automática:', error);
        });
    }, 5 * 60 * 1000);
}

export default pinCompanyService;

// Exports adicionais para casos específicos
export const validatePinCompanyData = (data) => pinCompanyService.validateCompanyData(data);
export const sendPinCompanyDiscount = (data) => pinCompanyService.sendDiscountData(data);
export const syncPinCompanyData = () => pinCompanyService.syncOfflineData();
