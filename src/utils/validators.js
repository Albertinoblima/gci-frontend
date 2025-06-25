// src/utils/validators.js

/**
 * Verifica se um valor não é nulo, indefinido ou uma string vazia (após trim).
 * @param {*} value - O valor a ser verificado.
 * @param {string} fieldName - O nome do campo para a mensagem de erro.
 * @returns {string|null} Retorna uma mensagem de erro se inválido, ou null se válido.
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} é obrigatório.`;
    }
    return null;
};

/**
 * Valida um endereço de e-mail.
 * @param {string} email - O email a ser validado.
 * @returns {string|null} Retorna uma mensagem de erro se inválido, ou null se válido.
 */
export const validateEmail = (email) => {
    if (!email || email.trim() === '') return null; // Não é obrigatório, só valida se preenchido
    // Regex simples para validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Por favor, insira um endereço de e-mail válido.';
    }
    return null;
};

/**
 * Valida o comprimento mínimo de uma string.
 * @param {string} value - O valor da string.
 * @param {number} minLength - O comprimento mínimo exigido.
 * @param {string} fieldName - O nome do campo para a mensagem de erro.
 * @returns {string|null} Retorna uma mensagem de erro se inválido, ou null se válido.
 */
export const validateMinLength = (value, minLength, fieldName = 'Este campo') => {
    if (value && value.length < minLength) {
        return `${fieldName} deve ter pelo menos ${minLength} caracteres.`;
    }
    return null;
};

/**
 * Valida o comprimento máximo de uma string.
 * @param {string} value - O valor da string.
 * @param {number} maxLength - O comprimento máximo exigido.
 * @param {string} fieldName - O nome do campo para a mensagem de erro.
 * @returns {string|null} Retorna uma mensagem de erro se inválido, ou null se válido.
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Este campo') => {
    if (value && value.length > maxLength) {
        return `${fieldName} não pode exceder ${maxLength} caracteres.`;
    }
    return null;
};

/**
 * Verifica se um valor é um número positivo.
 * @param {*} value - O valor a ser verificado.
 * @param {string} fieldName - O nome do campo para a mensagem de erro.
 * @returns {string|null} Retorna uma mensagem de erro se inválido, ou null se válido.
 */
export const validatePositiveNumber = (value, fieldName = 'Este campo') => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return `${fieldName} deve ser um número positivo.`;
    }
    return null;
};

/**
 * Verifica se um valor é um número inteiro.
 * @param {*} value - O valor a ser verificado.
 * @param {string} fieldName - O nome do campo para a mensagem de erro.
 * @returns {string|null} Retorna uma mensagem de erro se inválido, ou null se válido.
 */
export const validateInteger = (value, fieldName = 'Este campo') => {
    if (value === null || value === undefined || String(value).trim() === '') return null; // Não obrigatório, só valida se preenchido
    const num = Number(value);
    if (!Number.isInteger(num)) {
        return `${fieldName} deve ser um número inteiro.`;
    }
    return null;
};


/**
 * Valida uma senha com critérios mínimos (exemplo).
 * @param {string} password - A senha a ser validada.
 * @returns {string|null} Retorna uma mensagem de erro se inválido, ou null se válido.
 */
export const validatePassword = (password) => {
    if (!password) return 'Senha é obrigatória.'; // Se a senha for obrigatória na criação
    if (password.length < 8) {
        return 'A senha deve ter pelo menos 8 caracteres.';
    }
    // Adicionar mais critérios: maiúsculas, minúsculas, números, símbolos
    // if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.';
    // if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.';
    // if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.';
    // if (!/[!@#$%^&*]/.test(password)) return 'A senha deve conter pelo menos um caractere especial.';
    return null;
};

/**
 * Verifica se dois valores são iguais (ex: para confirmação de senha).
 * @param {string} value1
 * @param {string} value2
 * @param {string} fieldName1 - Nome do primeiro campo.
 * @param {string} fieldName2 - Nome do segundo campo (para a mensagem de erro).
 * @returns {string|null}
 */
export const validateEquality = (value1, value2, fieldName1 = 'O campo', fieldName2 = 'Confirmação') => {
    if (value1 !== value2) {
        return `${fieldName2} não corresponde a ${fieldName1}.`;
    }
    return null;
};


// Você pode adicionar mais validadores conforme necessário (CPF, CNPJ, CEP, etc.)
// Para CPF, CNPJ, etc., geralmente é melhor usar bibliotecas dedicadas devido à complexidade dos algoritmos de validação.