// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom hook para "debouncing" de um valor.
 * Apenas atualiza o valor "debounced" após um certo tempo sem novas alterações.
 * @param {*} value - O valor a ser "debounced".
 * @param {number} delay - O atraso em milissegundos.
 * @returns {*} O valor "debounced".
 */
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Configura um timer para atualizar o valor "debounced"
        // apenas depois que o 'value' não mudar por 'delay' ms
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpa o timer se o 'value' mudar (ou no unmount)
        // Isso é crucial para o "debouncing" funcionar: se o valor muda
        // antes do delay, o timer anterior é cancelado e um novo é iniciado.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Re-executa apenas se 'value' ou 'delay' mudar

    return debouncedValue;
};