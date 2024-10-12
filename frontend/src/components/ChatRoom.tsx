import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import ExitButton from './ExitButton';

const backendIP = import.meta.env.VITE_BACKEND_IP;

interface Message {
    text: string;
    origin: 'server' | 'client' | 'self';
}

const ChatRoom: React.FC = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isInChatRoom, setIsInChatRoom] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const wsUrl = `ws://${backendIP}/randomchat`;
        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onmessage = (event) => {
            const data = event.data;
            let message: Message = { text: data, origin: 'server' };

            if (data === 'Moved to 1:1 Chat room') {
                setIsInChatRoom(true);
            } else {
                const origin = data.startsWith('You: ') ? 'self' : 'server';
                message = { text: data, origin };
            }

            setMessages((prevMessages) => [...prevMessages, message]);
        };

        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = (message: string) => {
        if (socket && message.trim()) {
            socket.send(message);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: message, origin: 'self' }
            ]);
        }
    };

    const disconnect = () => {
        if (socket) {
            socket.close();
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <MessageList messages={messages} />
            <div className="p-4 border-t flex items-center">
                <MessageInput
                    input={input}
                    onInputChange={(e) => setInput(e.target.value)}
                    onSubmit={() => {
                        sendMessage(input);
                        setInput('');
                    }}
                    isDisabled={!isInChatRoom}
                />
                <ExitButton onClick={disconnect} />
            </div>
        </div>
    );
};

export default ChatRoom;
