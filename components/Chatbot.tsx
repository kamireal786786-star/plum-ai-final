
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { BotIcon } from './icons/BotIcon';
import { SendIcon } from './icons/SendIcon';
import { CloseIcon } from './icons/CloseIcon';
import { Chat } from '@google/genai';
import { MeetingDetails } from '../App';

interface ChatbotProps {
  onMeetingScheduled: (details: MeetingDetails) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onMeetingScheduled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm PlumBot. How can I help you explore our AI services today?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!chatSession.current) {
            chatSession.current = createChatSession();
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    // Effect to auto-focus the input field when the chat opens or after the bot responds.
    useEffect(() => {
        if (isOpen && !isLoading) {
            // Use a small timeout to allow for UI transitions before focusing.
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isLoading]);


    const handleSendMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: inputValue.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        if (chatSession.current) {
            const response = await sendMessageToGemini(chatSession.current, userMessage.content);
            const modelMessage: ChatMessage = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);

            // Check for successful booking and trigger the modal
            if (response.startsWith("Success!")) {
                const bookingRegex = /for (.*) on ([\d-]+) at ([\d:]+)\. A confirmation email has been sent to (.*)\./;
                const match = response.match(bookingRegex);
                if (match) {
                    const [, name, date, time, email] = match;
                    onMeetingScheduled({ name, date, time, email });
                }
            }
        }
        
        setIsLoading(false);
    }, [inputValue, isLoading, onMeetingScheduled]);

    const toggleChat = () => setIsOpen(!isOpen);

    const renderMessageContent = (content: string) => {
        // Replace markdown links [text](url) with HTML <a> tags
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
        const contentWithLinks = content.replace(linkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 underline hover:text-purple-300">$1</a>');
        
        // Use dangerouslySetInnerHTML. This is safe as we are only transforming specific markdown into trusted HTML.
        return <div className="text-sm break-words" dangerouslySetInnerHTML={{ __html: contentWithLinks.replace(/\n/g, '<br />') }} />;
    };
    
    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-50"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <CloseIcon className="w-6 h-6"/> : <BotIcon className="w-6 h-6" />}
            </button>

            <div
                className={`fixed inset-x-4 bottom-24 h-[60vh] sm:inset-x-auto sm:right-6 sm:w-full sm:max-w-sm flex flex-col bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center">
                            <BotIcon className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-white">PlumBot Assistant</h3>
                            <p className="text-sm text-gray-400">Online</p>
                        </div>
                    </div>
                    <button onClick={toggleChat} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-gray-300" /></div>}
                                <div
                                    className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-br-none'
                                            : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                        }`}
                                >
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-end gap-2 justify-start">
                                <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-gray-300" /></div>
                                <div className="bg-gray-700 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                                    <div className="flex items-center justify-center space-x-1">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center bg-gray-700 rounded-lg">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about our services..."
                            className="w-full bg-transparent p-3 text-white placeholder-gray-400 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputValue.trim()}
                            className="p-3 text-white disabled:text-gray-500 enabled:hover:text-purple-400 transition-colors"
                        >
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chatbot;