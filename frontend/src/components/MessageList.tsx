import React, { useRef, useEffect } from 'react';

interface Message {
    text: string;
    origin: 'server' | 'client' | 'self';
}

interface MessageListProps {
    messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const getMessagePrefix = (origin: 'server' | 'client' | 'self') => {
        switch (origin) {
            case 'server':
                return 'Bot:';
            case 'client':
                return 'Anonymous:';
            case 'self':
                return 'You:';
            default:
                return '';
        }
    };

    const getBackgroundColor = (origin: 'server' | 'client' | 'self') => {
        switch (origin) {
            case 'server':
                return 'bg-blue-100';
            case 'client':
                return 'bg-green-100';
            case 'self':
                return 'bg-red-100';
            default:
                return '';
        }
    };

    return (
        <div className="flex flex-col overflow-auto">
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`p-2 mb-2 rounded ${getBackgroundColor(message.origin)}`}
                >
                    <span className="font-bold">{getMessagePrefix(message.origin)}</span> {message.text}
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default MessageList;
