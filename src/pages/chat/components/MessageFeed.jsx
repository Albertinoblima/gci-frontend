import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem.jsx';

const MessageFeed = ({ mensagens }) => {
    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Rola para o final sempre que as mensagens mudam
        scrollToBottom();
    }, [mensagens]);

    return (
        <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
                {mensagens.map((msg) => (
                    <MessageItem key={msg.id} mensagem={msg} />
                ))}
                {/* Elemento invisível para ajudar a rolar para o final */}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};

export default MessageFeed;