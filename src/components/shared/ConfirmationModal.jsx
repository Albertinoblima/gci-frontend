// src/components/shared/ConfirmationModal.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Componente ConfirmationModal genérico.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla a visibilidade do modal.
 * @param {function} props.onClose - Função para fechar o modal.
 * @param {function} props.onConfirm - Função a ser executada ao confirmar.
 * @param {string} props.title - Título do modal.
 * @param {React.ReactNode | string} props.description - Descrição/corpo do modal.
 * @param {string} [props.confirmText="Confirmar"] - Texto do botão de confirmação.
 * @param {string} [props.cancelText="Cancelar"] - Texto do botão de cancelar.
 * @param {'destructive' | 'primary' | 'default'} [props.confirmVariant="primary"] - Variante do botão de confirmação.
 * @param {React.ElementType} [props.icon] - Ícone opcional para o cabeçalho.
 * @param {boolean} [props.isLoading=false] - Para mostrar loading no botão de confirmar.
 */
export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmVariant = "primary", // 'destructive' para ações perigosas, 'primary' para normais
    icon: IconComponent,
    isLoading = false,
}) {
    if (!isOpen) return null;

    let confirmButtonClasses = "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"; // Primary
    if (confirmVariant === "destructive") {
        confirmButtonClasses = "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white";
    } else if (confirmVariant === "default") {
        confirmButtonClasses = "bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900";
    }

    let IconToShow = Info;
    if (IconComponent) {
        IconToShow = IconComponent;
    } else if (confirmVariant === "destructive") {
        IconToShow = AlertTriangle;
    } else if (confirmVariant === "primary") {
        IconToShow = CheckCircle;
    }


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md dark:bg-slate-850 dark:border-slate-700">
                <DialogHeader className="sm:flex sm:flex-row sm:items-start sm:gap-4">
                    {IconToShow && (
                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10
              ${confirmVariant === 'destructive' ? 'bg-red-100 dark:bg-red-800/30' :
                                confirmVariant === 'primary' ? 'bg-emerald-100 dark:bg-emerald-800/30' :
                                    'bg-slate-100 dark:bg-slate-700/30'}`}>
                            <IconToShow
                                className={`h-6 w-6 
                ${confirmVariant === 'destructive' ? 'text-red-600 dark:text-red-400' :
                                        confirmVariant === 'primary' ? 'text-emerald-600 dark:text-emerald-400' :
                                            'text-slate-600 dark:text-slate-400'}`}
                                aria-hidden="true"
                            />
                        </div>
                    )}
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                        <DialogTitle className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100">
                            {title || "Confirmar Ação"}
                        </DialogTitle>
                        {description && (
                            <div className="mt-2">
                                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                    {description}
                                </DialogDescription>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <DialogFooter className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className={cn(confirmButtonClasses, "w-full sm:w-auto")}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {confirmText}
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto mt-2 sm:mt-0 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                            {cancelText}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}