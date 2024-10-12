import React from 'react';

interface ExitButtonProps {
    onClick: () => void;
}

const ExitButton: React.FC<ExitButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 bg-red-500 text-white rounded"
        >
            Exit Chat
        </button>
    );
};

export default ExitButton;
