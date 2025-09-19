// frontend/app/session/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/providers/session-provider";
import { Bot, CheckCircle, ChevronRight, Download, Loader2, User, UploadCloud } from "lucide-react";

// --- TYPE DEFINITIONS ---
type ActionItem = {
  text: string;
  isDone: boolean;
};

type Message = {
  sender: "user" | "ai";
  text: string;
};

// --- UI COMPONENTS ---

const ActionItemCard: React.FC<{ item: ActionItem }> = ({ item }) => {
  const [isDone, setIsDone] = useState(item.isDone);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
      <button onClick={() => setIsDone(!isDone)} className="flex-shrink-0">
        <CheckCircle className={`h-6 w-6 transition-colors ${isDone ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
      </button>
      <p className={`flex-grow text-sm ${isDone ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
        {item.text}
      </p>
    </div>
  );
};

// --- MAIN SESSION PAGE ---

const SessionPage = () => {
  const { analysisData, isLoading, error } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (analysisData) {
      setMessages([{ sender: "ai", text: "I have analyzed the transcript. You can ask me any questions, or review the summary and action items on the left." }]);
    }
  }, [analysisData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    // TODO: Add logic to send message to backend and get AI response
    // You will need the original transcript text for context, which should be added to the SessionProvider state.
  };

  if (isLoading) {
    return <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-black"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /><p className="mt-4 text-gray-600">Analyzing your document...</p></div>;
  }

  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50 dark:bg-black">
        <UploadCloud className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">No Analysis Data Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">It looks like you haven't analyzed a document yet.</p>
        <Link href="/dashboard" className="mt-6 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700">
          Go to Dashboard to Start
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-950">
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">Analysis Results</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 text-sm">
          <Download className="h-4 w-4" />
          Export
        </button>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* --- LEFT SIDEBAR (AI Analysis) --- */}
        <aside className="w-1/3 max-w-sm border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-8 overflow-y-auto">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Summary</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{analysisData.summary}</p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Action Items</h2>
            <div className="space-y-2">
              {analysisData.actionItems.map((item, idx) => <ActionItemCard key={idx} item={item} />)}
            </div>
          </div>
        </aside>

        {/* --- MAIN CHAT PANEL --- */}
        <main className="flex-grow flex flex-col">
          <div className="flex-grow p-6 space-y-6 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white"/></div>}
                <div className={`max-w-lg px-4 py-2.5 rounded-2xl ${msg.sender === 'user' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-white"/></div>}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSendMessage} className="relative">
              <label htmlFor="chat-input" className="sr-only">Ask a follow-up question</label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="w-full pl-4 pr-12 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button 
                type="submit" 
                aria-label="Send message"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SessionPage;