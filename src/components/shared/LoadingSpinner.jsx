// src/components/shared/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // Ícone de spinner do lucide-react
import { cn } from "@/lib/utils"; // Função utilitária do Shadcn/UI para mesclar classes Tailwind

/**
 * Componente LoadingSpinner para indicar estados de carregamento.
 * @param {object} props
 * @param {string} [props.size="md"] - Tamanho do spinner ('sm', 'md', 'lg', 'xl', ou um número para w/h).
 * @param {string} [props.text] - Texto opcional a ser exibido abaixo ou ao lado do spinner.
 * @param {string} [props.textColor="text-slate-600 dark:text-slate-400"] - Cor do texto.
 * @param {string} [props.spinnerColor="text-emerald-600 dark:text-emerald-500"] - Cor do spinner.
 * @param {string} [props.className] - Classes Tailwind adicionais para o container principal.
 * @param {boolean} [props.fullPage=false] - Se true, centraliza o spinner na tela inteira.
 */
export default function LoadingSpinner({
    size = "md",
    text,
    textColor = "text-slate-600 dark:text-slate-400",
    spinnerColor = "text-emerald-600 dark:text-emerald-500",
    className,
    fullPage = false
}) {
    let sizeClasses = "w-8 h-8"; // Default para 'md'
    if (size === "sm") sizeClasses = "w-5 h-5";
    else if (size === "lg") sizeClasses = "w-12 h-12";
    else if (size === "xl") sizeClasses = "w-16 h-16";
    else if (typeof size === 'number') sizeClasses = `w-${size} h-${size}`; // Ex: size={10} -> w-10 h-10 (se suas classes Tailwind estiverem configuradas para isso)

    const containerClasses = cn(
        "flex flex-col items-center justify-center",
        fullPage ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "py-4", // Para tela cheia
        className
    );

    return (
        <div className={containerClasses} role="status" aria-live="polite">
            <Loader2 className={cn("animate-spin", sizeClasses, spinnerColor)} />
            {text && <p className={cn("mt-3 text-sm", textColor)}>{text}</p>}
        </div>
    );
}