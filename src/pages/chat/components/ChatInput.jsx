import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip } from 'lucide-react';

const ChatInput = ({ atendimentoId }) => {
    // TODO: Implementar estado para o texto, lógica de envio e upload de anexo.
    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" disabled>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    placeholder="Digite uma mensagem..."
                    className="flex-1"
                    disabled
                />
                <Button disabled>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default ChatInput;