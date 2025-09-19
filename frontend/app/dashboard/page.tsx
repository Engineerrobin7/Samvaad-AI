// frontend/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { Upload, File, MessageSquare, Users, ArrowRight, Bot, Clock, Loader2, AlertCircle } from "lucide-react";

// --- PROPS & TYPE DEFINITIONS ---
type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: number | string;
  loading: boolean;
};

type Session = {
  id: string;
  type: "PDF" | "Group Chat";
  name: string;
  lastActivity: string;
};

// --- MOCK DATA (Replace with API calls) ---
const useDashboardData = () => {
  const [stats, setStats] = useState({ chats: 0, pdfs: 0, groups: 0 });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ chats: 128, pdfs: 12, groups: 5 });
      setSessions([
        { id: "1", type: "PDF", name: "Q2 Project Planning Notes", lastActivity: "2 hours ago" },
        { id: "2", type: "Group Chat", name: "SIH 2025 Prep Team", lastActivity: "22 hours ago" },
      ]);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return { stats, sessions, loading };
};

// --- UI COMPONENTS ---

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`} />
);

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, loading }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col justify-between">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    </div>
    {loading ? <Skeleton className="h-9 w-1/2" /> : <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>}
  </div>
);

const RecentSessionItem: React.FC<{ session: Session }> = ({ session }) => {
  const Icon = session.type === "PDF" ? File : Users;
  return (
    <Link href={`/chat/${session.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-lg transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><Icon className="h-5 w-5 text-gray-500" /><span className="font-medium text-gray-800 dark:text-gray-200">{session.name}</span></div>
        <div className="flex items-center gap-4 text-sm text-gray-500"><div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{session.lastActivity}</span></div><ArrowRight className="h-4 w-4 text-gray-400" /></div>
      </div>
    </Link>
  );
};

// --- MAIN DASHBOARD PAGE ---

const DashboardPage = () => {
  const { stats, sessions, loading: dashboardLoading } = useDashboardData();
  const { startAnalysis, isLoading: isAnalyzing, error } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await startAnalysis(file);
      // The session provider handles loading/error state. We can check the error state after the call.
      // A more robust way is to have startAnalysis return a boolean.
      // For now, we assume if no error is set, it was successful.
      if (!error) {
        router.push('/session/local');
      }
    }
  };

  return (
    <main className="bg-gray-50 dark:bg-black min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- NEW ASSISTANT CARD --- */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Meeting Assistant</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
                Your new superpower. Upload a meeting transcript (.txt or .pdf) to automatically generate a concise summary and actionable tasks.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
              <button
                onClick={handleUploadClick}
                disabled={isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Upload className="h-5 w-5" /> Upload Transcript</>}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt" />
            </div>
          </div>
        </section>

        {/* --- ERROR DISPLAY --- */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold"><AlertCircle className="inline-block mr-2"/>Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* --- STATS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={MessageSquare} title="Total Chats" value={stats.chats} loading={dashboardLoading} />
          <StatCard icon={File} title="PDFs Analyzed" value={stats.pdfs} loading={dashboardLoading} />
          <StatCard icon={Users} title="Group Collaborations" value={stats.groups} loading={dashboardLoading} />
        </section>

        {/* --- RECENT SESSIONS --- */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            {dashboardLoading ? (
              <div className="p-4 space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
            ) : sessions.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {sessions.map((session) => <li key={session.id}><RecentSessionItem session={session} /></li>)}
              </ul>
            ) : (
              <div className="text-center py-12"><Bot className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No recent sessions</h3><p className="mt-1 text-sm text-gray-500">Start a new session to see your AI-powered dialogues here.</p></div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;