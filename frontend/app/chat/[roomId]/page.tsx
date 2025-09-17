// frontend/app/chat/[roomId]/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/providers/auth-provider';
import { io, Socket } from 'socket.io-client';

// Define message type
interface Message {
  id: string;
  roomId: string;
  userId: number;
  sender_name: string; // Added for group chat
  content: string;
  originalLanguage?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  edited?: boolean;
  created_at: string; // Use string for date from DB
}

interface Participant {
  id: number;
  name: string;
  email: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Socket.IO URL

let socket: Socket; // Declare socket globally to persist across re-renders

export default function GroupChatPage() {
  const { roomId } = useParams();
  const { token, user } = useAuth(); // Assuming user object has an 'id'
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token || !user?.id || !roomId) {
      setError('Authentication required or room ID missing.');
      return;
    }

    // Fetch room details and participants
    const fetchRoomData = async () => {
      try {
        const roomRes = await fetch(`${API_URL}/chat/rooms/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const roomData = await roomRes.json();
        if (!roomRes.ok) throw new Error(roomData.message || 'Failed to fetch room details');
        setRoomDetails(roomData);
        setParticipants(roomData.participants);

        // Fetch chat history
        const historyRes = await fetch(`${API_URL}/chat/history/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const historyData = await historyRes.json();
        if (!historyRes.ok) throw new Error(historyData.error || 'Failed to fetch chat history');
        setMessages(historyData.messages);

      } catch (err: any) {
        console.error('Error fetching room data:', err);
        setError(err.message || 'Failed to load chat room.');
      }
    };

    fetchRoomData();

    // Setup Socket.IO
    socket = io(SOCKET_URL, {
      auth: {
        token: token, // Pass token for authentication if needed by Socket.IO
      },
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socket.emit('join_room', { roomId, userId: user.id });
    });

    socket.on('receive_message', (message: Message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    socket.on('user_joined', (data: { userId: number, socketId: string }) => {
      console.log(`User ${data.userId} joined the room.`);
      // Optionally update participants list or show a system message
    });

    socket.on('user_left', (data: { userId: number, socketId: string }) => {
      console.log(`User ${data.userId} left the room.`);
      // Optionally update participants list or show a system message
    });

    socket.on('message_edited', (data: { messageId: string, newContent: string, userId: number }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId ? { ...msg, content: data.newContent, edited: true } : msg
        )
      );
    });

    socket.on('message_deleted', (data: { messageId: string, userId: number }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    });

    socket.on('error', (err: any) => {
      console.error('Socket error:', err);
      setError(err.message || 'Socket connection error.');
    });

    return () => {
      if (socket) {
        socket.emit('leave_room', roomId);
        socket.disconnect();
        console.log('Disconnected from Socket.IO server');
      }
    };
  }, [roomId, token, user?.id]); // Re-run effect if roomId, token, or user.id changes

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !roomId || !user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(), // Temporary ID
      roomId: roomId as string,
      userId: user.id,
      sender_name: user.name || 'You', // Assuming user.name exists
      content: inputText,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]); // Optimistic update
    setInputText('');
    setIsLoading(true); // Keep loading true until message is confirmed by server via socket

    try {
      // Send message via Socket.IO
      socket.emit('send_message', {
        roomId: roomId,
        userId: user.id,
        content: userMessage.content,
        // originalLanguage: selectedLanguage, // If applicable for group chat
        // attachmentUrl, attachmentType // If applicable
      });
    } catch (err) {
      console.error('Error sending message via socket:', err);
      setError('Failed to send message.');
      // Revert optimistic update if sending fails
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false); // Message will be added by 'receive_message' event
    }
  };

  useEffect(() => {
    socket.on('proactive_suggestion', (data) => {
      // Display suggestion UI
      setSuggestion(data);
    });
    return () => {
      socket.off('proactive_suggestion');
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline mt-4">Go to Dashboard</Link>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>Loading chat room...</p>
      </div>
    );
  }

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
              AI Chat
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
            <h1 className="text-2xl font-bold">Group Chat: {roomDetails.name}</h1>
            <span className="text-sm text-muted-foreground">Lang: {roomDetails.primary_language.toUpperCase()}</span>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-muted/30">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2">
                    {message.userId !== user?.id && (
                      <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700">
                        {message.sender_name ? message.sender_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.userId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-50">
                        {message.sender_name} - {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.edited && ' (edited)'}
                      </p>
                    </div>
                    {message.userId === user?.id && (
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
                        {message.sender_name ? message.sender_name.charAt(0).toUpperCase() : 'U'}
                      </div>
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
            <h2 className="font-bold mb-2">Participants ({participants.length})</h2>
            <ul>
              {participants.map(p => (
                <li key={p.id} className="text-sm text-muted-foreground mb-1">
                  {p.name} ({p.email})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}