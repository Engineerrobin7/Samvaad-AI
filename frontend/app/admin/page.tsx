"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/providers/auth-provider';
import FaqManagement from '@/components/admin/faq-management';

// Dummy components for now
const DashboardStats = () => <div>Dashboard Stats</div>;
const AssistanceRequests = () => <div>Assistance Requests</div>;
const ConversationLogs = () => <div>Conversation Logs</div>;

export default function AdminPage() {
  const { token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // In a real app, you'd fetch the user's role from the backend
  useEffect(() => {
    // For now, we'll just assume the user is an admin if they have a token
    if (token) {
      setIsAdmin(true);
    }
  }, [token]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Go back to the homepage
        </Link>
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
                Samvaad AI - Admin
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-sm font-medium hover:underline underline-offset-4">
              Chat
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-3">
            <DashboardStats />
          </div>

          "use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/providers/auth-provider';
import FaqManagement from '@/components/admin/faq-management';
import TicketManagement from '@/components/admin/ticket-management';

// Dummy components for now
const DashboardStats = () => <div>Dashboard Stats</div>;
const ConversationLogs = () => <div>Conversation Logs</div>;

export default function AdminPage() {
  const { token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // In a real app, you'd fetch the user's role from the backend
  useEffect(() => {
    // For now, we'll just assume the user is an admin if they have a token
    if (token) {
      setIsAdmin(true);
    }
  }, [token]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Go back to the homepage
        </Link>
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
                Samvaad AI - Admin
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-sm font-medium hover:underline underline-offset-4">
              Chat
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-3">
            <DashboardStats />
          </div>

          <div className="col-span-1 lg:col-span-2 bg-card p-6 rounded-lg shadow">
            <TicketManagement />
          </div>

          <div className="col-span-1 bg-card p-6 rounded-lg shadow">
            <FaqManagement />
          </div>
        </div>
      </main>
    </div>
  );
}

          <div className="col-span-1 bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Conversation Logs</h2>
            <ConversationLogs />
          </div>
        </div>
      </main>
    </div>
  );
}
