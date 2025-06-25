// Filtros de console para suprimir avisos de extensões externas
// Este arquivo ajuda a limpar o console de desenvolvimento removendo logs irrelevantes

// Salva as funções originais do console
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

// Lista de mensagens que devem ser filtradas
const filteredWarnings = [
    'React DevTools',
    'Chrome extension',
    'Extension',
    'React Hook',
    'useEffect',
    'Warning: Failed prop type',
    'Warning: React does not recognize',
    'Download the React DevTools',
];

// Lista de erros que devem ser filtrados (adicione conforme necessário)
const filteredErrors = [
    'Chrome extension',
    'Extension',
];

// Função para verificar se uma mensagem deve ser filtrada
function shouldFilter(message, filters) {
    if (typeof message !== 'string') return false;
    return filters.some(filter => message.includes(filter));
}

// Sobrescreve console.warn
console.warn = function (...args) {
    const message = args.join(' ');
    if (!shouldFilter(message, filteredWarnings)) {
        originalWarn.apply(console, args);
    }
};

// Sobrescreve console.error
console.error = function (...args) {
    const message = args.join(' ');
    if (!shouldFilter(message, filteredErrors)) {
        originalError.apply(console, args);
    }
};

// Mantém console.log inalterado por padrão
// Descomente as linhas abaixo se quiser filtrar logs também
/*
const filteredLogs = [
  'React DevTools',
];

console.log = function(...args) {
  const message = args.join(' ');
  if (!shouldFilter(message, filteredLogs)) {
    originalLog.apply(console, args);
  }
};
*/

// Exporta as funções originais caso sejam necessárias
export { originalWarn, originalError, originalLog };
