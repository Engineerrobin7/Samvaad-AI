"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/providers/auth-provider'
import { v4 as uuidv4 } from 'uuid';

// Define message type
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// Define language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [assistanceStatus, setAssistanceStatus] = useState<'idle' | 'loading' | 'requested' | 'error'>('idle');
  const { token } = useAuth();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversationId(uuidv4());
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !conversationId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: inputText }],
          language: selectedLanguage,
          conversationId
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'AI chat failed');
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: data.data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAssistance = async () => {
    if (!conversationId) return;

    if (window.confirm('Are you sure you want to request human assistance?')) {
      setAssistanceStatus('loading');
      try {
        const res = await fetch(`${API_URL}/assistance/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ conversationId }),
        });

        if (!res.ok) {
          throw new Error('Failed to request assistance');
        }

        setAssistanceStatus('requested');
        const assistanceMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'A human assistant has been notified. They will get back to you shortly.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistanceMessage]);

      } catch (error) {
        console.error(error);
        setAssistanceStatus('error');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Samvaad AI
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-sm font-medium underline underline-offset-4">
              Chat
            </Link>
            <Link href="/learn" className="text-sm font-medium hover:underline underline-offset-4">
              Learn
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Multilingual Chat</h1>
            <div className="flex items-center gap-4">
              <select 
                id="language-select"
                title="Select language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRequestAssistance}
                disabled={assistanceStatus === 'loading' || assistanceStatus === 'requested'}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {assistanceStatus === 'requested' ? 'Assistance Requested' : 'Request Human Assistance'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-muted/30">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2">
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700">AI</div>
                    )}
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs mt-1 opacity-50">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">U</div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
        
        <div className="w-80 border-l p-4 hidden md:block">
          <div className="sticky top-20">
            <h2 className="font-bold mb-2">Cultural Tips</h2>
            <div className="mb-4 text-sm text-muted-foreground">Coming soon: cultural tips for your selected language will appear here.</div>
            
            <h2 className="font-bold mt-6 mb-2">Learning Progress</h2>
            {/* TODO: Fetch and display learning progress */}
          </div>
        </div>
      </main>
    </div>
  )
}