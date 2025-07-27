import React, { useState } from 'react';
import { Send, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  resumeContent: string;
  jobContent: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ resumeContent, jobContent }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I've analyzed your resume against the job posting. I can help you with specific questions about improving your resume, formatting suggestions, or any other concerns you might have. What would you like to know more about?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputValue,
          resume_content: resumeContent,
          job_content: jobContent
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-beige-500" />
        <h2 className="text-xl font-semibold text-white">
          Ask Follow-up Questions
        </h2>
      </div>
      <div className="space-y-0 mb-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
          >
            <div className="flex items-start space-x-4 max-w-3xl mx-auto">
              {message.sender === 'bot' && (
                <Bot className="w-6 h-6 text-beige-500 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className="text-white leading-relaxed">{message.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              {message.sender === 'user' && (
                <User className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat-message bot">
            <div className="flex items-start space-x-4 max-w-3xl mx-auto">
              <Bot className="w-6 h-6 text-beige-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about specific improvements, formatting, or any concerns..."
            className="input-field flex-1"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 