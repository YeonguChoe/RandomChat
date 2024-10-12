import React, { useState, useEffect, useCallback, useRef } from 'react';
import MessageInput from './components/MessageInput';
import MessageList from './components/MessageList';

const backendIP = import.meta.env.VITE_BACKEND_IP;

interface Message {
  text: string;
  origin: 'server' | 'client' | 'self';
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [isInChatRoom, setIsInChatRoom] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 890);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    if (isConnected) {
      const wsUrl = `ws://${backendIP}/randomchat`;
      const ws = new WebSocket(wsUrl);
      setSocket(ws);

      ws.onmessage = (event) => {
        const data = event.data;
        try {
          const parsedData = JSON.parse(data);
          let message: Message = { text: data, origin: 'server' };

          if (parsedData.kind === 'userCount') {
            setUserCount(parsedData.userCount);
          } else if (parsedData.kind === 'statusMessage') {
            setIsInChatRoom(parsedData.status === 'connectedToUser');
            message = {
              text: parsedData.status === "connectedToServer" ?
                "Welcome! You're now connected to the server." : parsedData.status === "connectedToUser" ? "Match found! Let's chat. San Franciscan." : "Anonymous has left the chat room.",
              origin: 'server'
            };
            setMessages((prevMessages) => [...prevMessages, message]);
          } else {
            message = {
              text: parsedData.messageContent,
              origin: 'client'
            };
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: data, origin: 'server' }
          ]);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsInChatRoom(false);
        setUserCount(0);
        console.log('WebSocket connection closed');
      };

      return () => {
        ws.close();
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isConnected, handleResize]);

  const handleStartChat = () => {
    setIsConnected(true);
    setIsInChatRoom(false);
    setMessages([]);
  };

  const handleExitChat = () => {
    if (socket) {
      socket.close();
      setIsConnected(false);
    }
  };

  const handleSendMessage = (message: string) => {
    if (socket && message.trim()) {
      const messageObject = {
        kind: 'clientMessage',
        messageContent: message,
        receiver: 'server',
        sender: 'client'
      };
      socket.send(JSON.stringify(messageObject));
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, origin: 'self' },
      ]);
      // Clear input field
      setInput('');
      // Keep focus on input field after sending message
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative flex flex-col h-screen">
      {/* Loading indicator */}
      {!isInChatRoom && isConnected && (
        <div className='fixed inset-0 flex flex-col justify-center items-center z-40 pointer-events-none'>
          <div className='flex flex-col items-center'>
            <div className='flex space-x-2 mb-2'>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce'></div>
            </div>
            <span className='text-gray-700'>Finding your match...</span>
          </div>
        </div>
      )}

      <header className="bg-blue-600 text-white text-center py-1">
        <h1 className="text-5xl font-bold m-0">
          👋🏻 Random Chat
        </h1>
      </header>

      <div className="flex flex-col flex-grow bg-gray-100">
        <div className="relative flex flex-col bg-white border rounded-lg shadow-lg flex-grow"
          style={{ height: 'calc(100vh - 7rem)', maxHeight: 'calc(100vh - 7rem)' }}> {/* Set max-height */}
          <div className="absolute top-4 right-4 bg-gray-200 text-sm p-2 rounded-lg z-10">
            Online: {userCount}
          </div>
          <div className="flex-shrink-0 overflow-y-auto p-4 pt-12"
            style={{ height: 'calc(100% - 3.5rem)', maxHeight: 'calc(100% - 3.5rem)' }}> {/* Set max-height */}
            <MessageList messages={messages} />
          </div>
          <div className={`p-4 border-t flex flex-col sm:flex-row items-center bg-white ${isMobile ? 'fixed bottom-0 left-0 w-full' : ''}`}>
            <button
              onClick={isConnected ? handleExitChat : handleStartChat}
              className="w-full sm:w-32 px-4 py-2 mb-2 sm:mb-0 sm:mr-4 text-white rounded-lg shadow-lg transition"
              style={{ backgroundColor: isConnected ? 'red' : 'blue' }}
            >
              {isConnected ? 'Exit Chat' : 'Start Chat'}
            </button>
            <MessageInput
              input={input}
              onInputChange={(e) => setInput(e.target.value)}
              onSubmit={() => handleSendMessage(input)}
              isDisabled={!isInChatRoom}
              ref={inputRef}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-300 p-2 flex items-center justify-center">
        <span>Since 2024</span>
      </footer>
    </div>
  );
};

export default App;
