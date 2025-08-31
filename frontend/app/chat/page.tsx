"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'

// Define message type
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  originalText?: string;
  language?: string;
  culturalContext?: string;
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
      originalText: 'Hello! How can I help you today?',
      language: 'hi',
      culturalContext: 'This is a formal Hindi greeting commonly used in North India.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [culturalTip, setCulturalTip] = useState({
    title: 'Greeting in Hindi',
    content: 'In Hindi, "Namaste" (नमस्ते) is a respectful greeting used in formal settings. It literally means "I bow to you" and is often accompanied by joining palms together.'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Simulate API call for translation and response
    setTimeout(() => {
      // Mock AI response
      const responses = [
        {
          text: 'मुझे समझ में आया। क्या आप भारत की यात्रा कर रहे हैं?',
          originalText: 'I understand. Are you traveling to India?',
          language: 'hi',
          culturalContext: 'This is a conversational Hindi phrase using a polite form.'
        },
        {
          text: 'बिलकुल! मैं आपकी मदद करूंगा।',
          originalText: 'Absolutely! I will help you.',
          language: 'hi',
          culturalContext: 'This is an enthusiastic affirmation in Hindi, commonly used in service contexts.'
        },
        {
          text: 'क्या आप कोई विशेष भारतीय त्योहार के बारे में जानना चाहते हैं?',
          originalText: 'Would you like to learn about any specific Indian festival?',
          language: 'hi',
          culturalContext: 'This is a question about cultural interest, using formal Hindi.'
        }
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: randomResponse.text,
        originalText: randomResponse.originalText,
        language: randomResponse.language,
        culturalContext: randomResponse.culturalContext,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // Update cultural tip
      setCulturalTip({
        title: 'Hindi Conversation',
        content: 'In Hindi conversations, it\'s common to use "आप" (aap) for formal address and "तुम" (tum) for informal situations with friends or family. Using the wrong form can sometimes be perceived as disrespectful or overly familiar.'
      });
    }, 1500);
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
            <Link href="/translate" className="text-sm font-medium hover:underline underline-offset-4">
              Translate
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
            <div className="flex items-center">
              <label htmlFor="language-select" className="mr-2 text-sm">Your Language:</label>
              <select 
                id="language-select"
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
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.text}</p>
                    {message.originalText && (
                      <p className="text-sm mt-1 opacity-80">{message.originalText}</p>
                    )}
                    {message.culturalContext && (
                      <div className="mt-2 text-xs border-t pt-1 opacity-70">
                        <p>{message.culturalContext}</p>
                      </div>
                    )}
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
            <div className="rounded-lg border p-3 bg-muted/30">
              <h3 className="font-medium text-sm">{culturalTip.title}</h3>
              <p className="text-sm mt-1 text-muted-foreground">{culturalTip.content}</p>
            </div>
            
            <h2 className="font-bold mt-6 mb-2">Learning Progress</h2>
            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hindi</span>
                    <span>7/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tamil</span>
                    <span>3/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bengali</span>
                    <span>5/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-sm mb-2">Badges Earned</h3>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center" title="Hindi Beginner">
                    <span className="text-xs">हि</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center" title="Bengali Beginner">
                    <span className="text-xs">বা</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-40" title="Locked">
                    <span className="text-xs">?</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}