// frontend/app/create-group-chat/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider'; // Assuming auth-provider exists
import { ThemeToggle } from '@/components/theme-toggle'; // Assuming theme-toggle exists

// Mock user data for participant selection (replace with actual API call)
const mockUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  { id: 4, name: 'David', email: 'david@example.com' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  // Add more languages as needed
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CreateGroupChatPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState(mockUsers); // Initialize with mock users

  // In a real application, fetch users from backend
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const res = await fetch(`${API_URL}/users`, {
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });
  //       if (!res.ok) {
  //         throw new Error('Failed to fetch users');
  //       }
  //       const data = await res.json();
  //       setUsers(data);
  //     } catch (err) {
  //       console.error('Error fetching users:', err);
  //       setError('Failed to load users for participant selection.');
  //     }
  //   };
  //   if (token) {
  //     fetchUsers();
  //   }
  // }, [token]);

  const handleParticipantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedParticipants(prev => [...prev, userId]);
    } else {
      setSelectedParticipants(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          primary_language: primaryLanguage,
          participantIds: selectedParticipants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create group chat');
      }

      alert('Group chat created successfully!');
      router.push('/dashboard'); // Redirect to dashboard or chat list
    } catch (err: any) {
      console.error('Error creating group chat:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
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
            <Link href="/learn" className="text-sm font-medium hover:underline underline-offset-4">
              Learn
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6">Create New Group Chat</h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-foreground">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="primaryLanguage" className="block text-sm font-medium text-foreground">
                Primary Language
              </label>
              <select
                id="primaryLanguage"
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                disabled={isLoading}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Participants
              </label>
              <div className="border border-input rounded-md p-3 max-h-40 overflow-y-auto bg-background">
                {users.length === 0 ? (
                  <p className="text-muted-foreground">No users available.</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        value={user.id}
                        onChange={handleParticipantChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                        disabled={isLoading}
                      />
                      <label htmlFor={`user-${user.id}`} className="text-sm text-foreground">
                        {user.name} ({user.email})
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
              disabled={isLoading || !groupName.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Group Chat'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}