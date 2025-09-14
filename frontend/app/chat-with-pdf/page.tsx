"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/providers/auth-provider'
import { v4 as uuidv4 } from 'uuid';
import { ArrowUp, Paperclip } from 'lucide-react';

// Define message type
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pa', label: 'Punjabi' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ChatWithPdfPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [assistanceStatus, setAssistanceStatus] = useState<'idle' | 'loading' | 'requested' | 'error'>('idle');
  const { token } = useAuth();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversationId(uuidv4());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile || !conversationId) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('conversationId', conversationId);
    formData.append('language', language);

    try {
      const res = await fetch(`${API_URL}/ai/upload-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'PDF upload failed');
      }
      
      setMessages([{
        id: Date.now().toString(),
        sender: 'ai',
        text: "PDF uploaded successfully! You can now ask questions about it.",
        timestamp: new Date()
      }]);

    } catch (error: any) {
      setUploadError(error.message || 'An unknown error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

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
      const res = await fetch(`${API_URL}/ai/chat-with-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: inputText,
          conversationId,
          language,
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
            <Link href="/chat" className="text-sm font-medium hover:underline underline-offset-4">
              Chat
            </Link>
            <Link href="/chat-with-pdf" className="text-sm font-medium underline underline-offset-4">
              Chat with PDF
            </Link>
            <Link href="/learn" className="text-sm font-medium hover:underline underline-offset-4">
              Learn
            </Link>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded px-2 py-1 mr-2"
              title="Select language for PDF chat"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleRequestAssistance}
              disabled={assistanceStatus === 'loading' || assistanceStatus === 'requested'}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-amber-600 disabled:opacity-50"
              title="Request Human Assistance"
            >
              {assistanceStatus === 'requested' ? 'Assistance Requested' : 'Request Human Assistance'}
            </button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <h1 className="text-2xl font-bold mb-4">Chat with PDF</h1>
        
        {!pdfFile || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
            <Paperclip className="w-12 h-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Upload a PDF document</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a PDF file to start a conversation about its content.
            </p>
            <div className="mt-6">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="hidden" 
                id="pdf-upload"
              />
              <label 
                htmlFor="pdf-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Select PDF
              </label>
            </div>
            {pdfFile && (
              <div className="mt-4 text-sm text-muted-foreground">
                Selected file: {pdfFile.name}
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="ml-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
                  title="Upload PDF"
                >
                  {isUploading ? "Uploading..." : "Upload PDF"}
                </button>
              </div>
            )}
            {uploadError && (
              <p className="mt-4 text-sm text-red-500">{uploadError}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-muted/30">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
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
                placeholder="Ask a question about the PDF..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}