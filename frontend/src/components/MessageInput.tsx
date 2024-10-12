import React, { forwardRef } from 'react';

interface MessageInputProps {
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    isDisabled: boolean;
}

const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>(
    ({ input, onInputChange, onSubmit, isDisabled }, ref) => {
        const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isDisabled) {
                    const cleanedInput = input.trim().replace(/\n/g, '');
                    onInputChange({ target: { value: cleanedInput } } as React.ChangeEvent<HTMLInputElement>);
                    onSubmit();
                }
            }
        };

        return (
            <div className="flex-grow flex items-center">
                <input
                    ref={ref}
                    type="text"
                    value={input}
                    onChange={onInputChange}
                    onKeyPress={handleKeyPress}
                    className={`flex-grow p-2 border rounded-lg ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
                    placeholder="Type your message..."
                    disabled={isDisabled}
                    maxLength={500}
                />
                <button
                    onClick={() => {
                        if (!isDisabled) {
                            const cleanedInput = input.trim().replace(/\n/g, '');
                            onInputChange({ target: { value: cleanedInput } } as React.ChangeEvent<HTMLInputElement>);
                            onSubmit();
                        }
                    }}
                    className={`ml-2 w-32 px-4 py-2 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition`}
                    disabled={isDisabled}
                >
                    Send
                </button>
            </div>
        );
    });

MessageInput.displayName = 'MessageInput';

export default MessageInput;
