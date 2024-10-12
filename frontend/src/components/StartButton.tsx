import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartButton: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/chat');
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <button
                onClick={handleClick}
                className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg shadow-lg hover:bg-blue-600 transition"
            >
                Start Chat
            </button>
        </div>
    );
};

export default StartButton;
