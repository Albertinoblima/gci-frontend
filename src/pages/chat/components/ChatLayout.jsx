import React from 'react';
import AtendimentoDetalhes from './AtendimentoDetalhes.jsx';
import ChatHeader from './ChatHeader.jsx';
import MessageFeed from './MessageFeed.jsx';
import ChatInput from './ChatInput.jsx';

const ChatLayout = ({ atendimento, mensagens }) => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Coluna Principal do Chat */}
            <div className="flex flex-col flex-1">
                <ChatHeader atendimento={atendimento} />
                <MessageFeed mensagens={mensagens} />
                <ChatInput atendimentoId={atendimento.id} />
            </div>

            {/* Coluna de Detalhes (Sidebar Direita) */}
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <AtendimentoDetalhes atendimento={atendimento} />
            </div>
        </div>
    );
};

export default ChatLayout;