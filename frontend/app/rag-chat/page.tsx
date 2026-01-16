'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ content: string; similarity: number }>;
}

interface Document {
  id: string;
  name: string;
  uploadedAt: Date;
  size: number;
}

export default function RAGChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:5000/api/rag/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await user?.getToken()}`
          },
          body: formData
        });

        if (response.ok) {
          const doc = await response.json();
          setDocuments(prev => [...prev, {
            id: doc.id,
            name: file.name,
            uploadedAt: new Date(),
            size: file.size
          }]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({ query: input })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          sources: data.sources
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Query error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] flex gap-4">
        {/* Sidebar - Documents */}
        <div className="w-80 bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">📚 Documents</h2>
            <p className="text-sm text-gray-600">Upload documents to chat with them</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 mb-4"
          >
            {uploading ? 'Uploading...' : '+ Upload Documents'}
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {documents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-sm">No documents uploaded yet</div>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="font-medium text-sm truncate">{doc.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm">
            <div className="font-semibold mb-1">💡 Tip</div>
            <div className="text-gray-600">
              Upload PDFs, Word docs, or text files. Then ask questions about their content!
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">🤖 RAG Chat Assistant</h1>
            <p className="text-gray-600">Ask questions about your uploaded documents</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                  <p className="text-gray-600">
                    Upload documents and ask questions about them
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto">
                    {[
                      'Summarize this document',
                      'What are the key points?',
                      'Explain this concept',
                      'Compare these sections'
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="text-xs font-semibold mb-2">📎 Sources:</div>
                          <div className="space-y-2">
                            {message.sources.map((source, i) => (
                              <div key={i} className="text-xs bg-white bg-opacity-50 p-2 rounded">
                                <div className="font-medium mb-1">
                                  Relevance: {(source.similarity * 100).toFixed(1)}%
                                </div>
                                <div className="text-gray-700 line-clamp-2">
                                  {source.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question about your documents..."
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading || documents.length === 0}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim() || documents.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            {documents.length === 0 && (
              <div className="text-sm text-gray-500 mt-2">
                Upload documents first to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
