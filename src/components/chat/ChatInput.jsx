import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, X } from 'lucide-react';
import { useNotifier } from '@/hooks/useNotifier';
import mensagemApiService from '@/services/mensagemApiService';

const SelectedFileChip = ({ file, onRemove }) => (
    <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm pl-3 pr-2 py-1 rounded-full">
        <Paperclip className="h-4 w-4" />
        <span className="truncate max-w-xs">{file.name}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/10 p-0.5">
            <X className="h-4 w-4" />
        </button>
    </div>
);

const ChatInput = ({ atendimentoId }) => {
    const [texto, setTexto] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const notify = useNotifier();
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleInput = (e) => { /* ... (mesma lógica de antes) ... */ };
    const handleKeyDown = (e) => { /* ... (mesma lógica de antes) ... */ };

    const handleAnexoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                notify.error('O arquivo excede o limite de 10MB.');
                return;
            }
            setArquivo(file);
        }
    };

    const removerAnexo = () => {
        setArquivo(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reseta o input de arquivo
    };

    const handleEnviarMensagem = async (e) => {
        if (e) e.preventDefault();
        if ((texto.trim() === '' && !arquivo) || enviando) return;

        setEnviando(true);
        try {
            await mensagemApiService.enviarMensagem(atendimentoId, {
                conteudo_texto: texto,
                anexo: arquivo,
            });

            // Limpa os estados após o envio bem-sucedido
            setTexto('');
            removerAnexo();
            if (textareaRef.current) textareaRef.current.style.height = 'auto';

        } catch (error) {
            notify.error('Falha ao enviar a mensagem. Por favor, tente novamente.');
        } finally {
            setEnviando(false);
            textareaRef.current?.focus();
        }
    };

    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {/* Chip para exibir o arquivo selecionado */}
            {arquivo && (
                <div className="mb-2">
                    <SelectedFileChip file={arquivo} onRemove={removerAnexo} />
                </div>
            )}
            <form onSubmit={handleEnviarMensagem} className="flex items-end space-x-2">
                <input type="file" ref={fileInputRef} onChange={handleAnexoChange} className="hidden" />
                <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current.click()} disabled={enviando}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                    ref={textareaRef}
                    value={texto}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite uma mensagem..."
                    rows={1}
                    className="flex-1 resize-none max-h-40"
                    disabled={enviando}
                />
                <Button type="submit" disabled={enviando || (texto.trim() === '' && !arquivo)}>
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
    );
};

export default ChatInput;