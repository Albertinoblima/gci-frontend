// src/hooks/useToggle.js
import { useState, useCallback } from 'react';

/**
 * Custom hook para gerenciar um estado booleano (on/off).
 * @param {boolean} [initialState=false] - O estado inicial.
 * @returns {[boolean, function, function, function]} Um array com:
 *  - O estado booleano atual.
 *  - Uma função para alternar (toggle) o estado.
 *  - Uma função para definir o estado como true (setOn).
 *  - Uma função para definir o estado como false (setOff).
 */
export const useToggle = (initialState = false) => {
    const [state, setState] = useState(initialState);

    const toggle = useCallback(() => setState(prevState => !prevState), []);
    const setOn = useCallback(() => setState(true), []);
    const setOff = useCallback(() => setState(false), []);

    return [state, toggle, setOn, setOff];
};