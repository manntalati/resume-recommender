import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Bot, Mic, Paperclip, Smile } from 'lucide-react';

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
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const response = await fetch('/api/chat', {
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

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {line}
      </p>
    ));
  };

  useEffect(() => {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    setInputValue(transcript);
  };

  recognition.onend = () => {
    setIsListening(false);

    if (inputValue.trim()) {
      handleSendMessage();
    }
  };

    recognitionRef.current = recognition;
  }, [inputValue]);

  const handleMicClick = () => {
  if (!recognitionRef.current) return;

  if (isListening) {
    recognitionRef.current.stop();
  } else {
    recognitionRef.current.start();
    setIsListening(true);
  }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full blur-lg opacity-50 animate-pulse-slow" />
            <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-3 border border-white/20">
              <MessageCircle className="w-6 h-6 text-accent-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white gradient-text">
              AI Career Assistant
            </h2>
            <p className="text-neutral-400 text-sm">
              Ask me anything about your resume optimization
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-3xl rounded-2xl p-4 relative group
                ${message.sender === 'user' 
                  ? 'glass-card ml-12' 
                  : 'neumorphic-card mr-12'
                }
              `}>
                <div className="flex items-center space-x-2 mb-2">
                  {message.sender === 'bot' && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent-secondary rounded-full blur-sm animate-pulse" />
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20">
                        <Bot className="w-4 h-4 text-accent-secondary" />
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-neutral-400">
                    {message.sender === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                <div className="text-neutral-300 leading-relaxed">
                  {formatMessage(message.text)}
                </div>

                <div className="absolute top-2 right-2 w-1 h-1 bg-accent-primary rounded-full animate-pulse opacity-50" />
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-accent-secondary rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-slide-up">
            <div className="neumorphic-card mr-12 p-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-secondary rounded-full blur-sm animate-pulse" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20">
                    <Bot className="w-4 h-4 text-accent-secondary" />
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-secondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-card p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <div className={`
              relative transition-all duration-300
              ${isFocused ? 'scale-105' : ''}
            `}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask about specific improvements, formatting, or any concerns..."
                className="input-field w-full resize-none"
                rows={3}
              />
              
              <div className="absolute top-2 right-2 w-1 h-1 bg-accent-primary rounded-full animate-pulse" />
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-accent-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="btn-secondary p-3 rounded-xl hover:bg-accent-secondary/20 transition-colors duration-300">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleMicClick}
              className={`btn-secondary p-3 rounded-xl transition-colors duration-300 ${
                  isListening ? "bg-accent-secondary/30" : "hover:bg-accent-tertiary/20"}`}>
              <Mic className="w-5 h-5" />
            </button>
            <button className="btn-secondary p-3 rounded-xl hover:bg-accent-primary/20 transition-colors duration-300">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="btn-gradient p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "How can I improve my skills section?",
            "What formatting changes do you recommend?",
            "Can you help with my professional summary?",
            "What keywords should I add?"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputValue(suggestion)}
              className="btn-secondary text-sm px-3 py-1 rounded-full hover:bg-accent-primary/20 transition-colors duration-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 