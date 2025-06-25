import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatHeader = ({ atendimento }) => {
    const nome = atendimento.nome_perfil_canal;
    const iniciais = nome?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'C';

    return (
        <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Avatar>
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${nome}`} alt={nome} />
                <AvatarFallback>{iniciais}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
                <p className="font-semibold text-gray-900 dark:text-white">{nome}</p>
                <p className="text-xs text-green-500">Online</p> {/* Placeholder */}
            </div>
        </div>
    );
};

export default ChatHeader;