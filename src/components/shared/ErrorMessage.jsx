// src/components/shared/ErrorMessage.jsx
import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react'; // Ícones para erro
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button'; // Se quiser um botão de retry ou fechar

/**
 * Componente ErrorMessage para exibir feedback de erro ao usuário.
 * @param {object} props
 * @param {string} props.title - Título do erro (opcional).
 * @param {string | string[] | object} props.message - A mensagem de erro principal ou um array de mensagens ou um objeto de erro com detalhes.
 * @param {'subtle' | 'prominent'} [props.variant='subtle'] - Variação visual.
 * @param {function} [props.onRetry] - Função callback para um botão "Tentar Novamente".
 * @param {string} [props.retryText="Tentar Novamente"] - Texto para o botão de retry.
 * @param {function} [props.onDismiss] - Função callback para fechar a mensagem de erro (se aplicável).
 * @param {string} [props.className] - Classes Tailwind adicionais.
 */
export default function ErrorMessage({
    title,
    message,
    variant = 'subtle',
    onRetry,
    retryText = "Tentar Novamente",
    onDismiss,
    className
}) {
    if (!message) return null; // Não renderizar nada se não houver mensagem

    const baseClasses = "p-4 rounded-md flex items-start gap-3";
    const variantClasses = {
        subtle: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/30",
        prominent: "bg-red-500 dark:bg-red-600 text-white p-6 rounded-lg shadow-lg",
    };

    const iconColor = variant === 'prominent' ? "text-white" : "text-red-500 dark:text-red-400";

    const renderMessage = (msg) => {
        if (typeof msg === 'string') {
            return <p>{msg}</p>;
        }
        if (Array.isArray(msg)) {
            return (
                <ul className="list-disc list-inside space-y-1">
                    {msg.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            );
        }
        if (typeof msg === 'object' && msg !== null) {
            // Tenta exibir detalhes do objeto de erro (ex: de validação AJV)
            if (msg.details && Array.isArray(msg.details)) {
                return (
                    <>
                        {msg.error && <p className="font-medium mb-1">{msg.error}</p>}
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {msg.details.map((detail, index) => (
                                <li key={index}>
                                    {detail.field && <strong>{detail.field}: </strong>}
                                    {detail.message}
                                </li>
                            ))}
                        </ul>
                    </>
                );
            }
            return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(msg, null, 2)}</pre>;
        }
        return <p>Ocorreu um erro desconhecido.</p>;
    };

    return (
        <div className={cn(baseClasses, variantClasses[variant], className)} role="alert">
            <AlertTriangle className={cn("w-5 h-5 shrink-0 mt-0.5", iconColor)} />
            <div className="flex-1">
                {title && <h3 className={`text-md font-semibold mb-1 ${variant === 'prominent' ? 'text-white' : 'text-red-800 dark:text-red-300'}`}>{title}</h3>}
                <div className={`text-sm ${variant === 'prominent' ? 'text-red-50' : ''}`}>
                    {renderMessage(message)}
                </div>
                {(onRetry || onDismiss) && (
                    <div className="mt-3 flex gap-2">
                        {onRetry && (
                            <Button onClick={onRetry} variant={variant === 'prominent' ? 'outlineWhite' : 'outline'} size="sm">
                                {retryText}
                            </Button>
                        )}
                        {onDismiss && (
                            <Button onClick={onDismiss} variant="ghost" size="icon" className="ml-auto">
                                <XCircle className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}