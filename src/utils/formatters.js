// src/utils/formatters.js
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma string de data ISO ou objeto Date para o formato dd/MM/yyyy.
 * @param {string | Date | number} dateInput - A data a ser formatada.
 * @param {string} [formatString='dd/MM/yyyy'] - O formato desejado.
 * @returns {string} A data formatada ou uma string vazia/placeholder se inválida.
 */
export const formatDate = (dateInput, formatString = 'dd/MM/yyyy') => {
    if (!dateInput) return '';
    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
        if (!isValidDate(date)) { // Verifica se a data resultante é válida
            // console.warn("Data inválida fornecida para formatDate:", dateInput);
            return 'Data inválida';
        }
        return format(date, formatString, { locale: ptBR });
    } catch (error) {
        // console.error("Erro ao formatar data:", dateInput, error);
        return String(dateInput); // Retorna a entrada original em caso de erro inesperado
    }
};

/**
 * Formata uma string de data ISO ou objeto Date para o formato dd/MM/yyyy HH:mm.
 * @param {string | Date | number} dateInput - A data e hora a serem formatadas.
 * @returns {string} A data e hora formatadas ou uma string vazia/placeholder se inválida.
 */
export const formatDateTime = (dateInput) => {
    return formatDate(dateInput, 'dd/MM/yyyy HH:mm');
};

/**
 * Formata um número para uma string com duas casas decimais (ex: para moeda, sem símbolo).
 * @param {number | string} numberInput - O número a ser formatado.
 * @param {number} [decimalPlaces=2] - Número de casas decimais.
 * @returns {string} O número formatado ou uma string vazia se inválido.
 */
export const formatNumber = (numberInput, decimalPlaces = 2) => {
    const num = parseFloat(numberInput);
    if (isNaN(num)) return '';
    return num.toFixed(decimalPlaces).replace('.', ','); // Exemplo de formatação pt-BR
};

/**
 * Formata um valor booleano para "Sim" ou "Não".
 * @param {boolean} value - O valor booleano.
 * @returns {string} "Sim" ou "Não".
 */
export const formatBoolean = (value) => {
    return value ? 'Sim' : 'Não';
};

/**
 * Capitaliza a primeira letra de cada palavra em uma string.
 * @param {string} str - A string a ser capitalizada.
 * @returns {string}
 */
export const capitalizeWords = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Trunca uma string para um comprimento máximo e adiciona reticências.
 * @param {string} str - A string a ser truncada.
 * @param {number} maxLength - O comprimento máximo.
 * @returns {string}
 */
export const truncateText = (str, maxLength = 100) => {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
};

/**
 * Formata um número de telefone para o padrão brasileiro (simplificado).
 * Ex: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param {string} phoneNumberString - O número de telefone como string (apenas dígitos).
 * @returns {string} O número formatado ou a string original se não puder formatar.
 */
export const formatPhoneNumber = (phoneNumberString) => {
    if (!phoneNumberString || typeof phoneNumberString !== 'string') return phoneNumberString || '';
    const cleaned = phoneNumberString.replace(/\D/g, ''); // Remove não dígitos
    const length = cleaned.length;

    if (length === 11) { // Celular (XX) XXXXX-XXXX
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (length === 10) { // Fixo (XX) XXXX-XXXX
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    // Adicionar mais formatos se necessário (ex: DDI +55)
    return phoneNumberString; // Retorna original se não corresponder aos padrões
};


// Adicione outros formatadores conforme necessário