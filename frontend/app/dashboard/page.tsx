// frontend/app/dashboard/page.tsx
"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link for navigation

const Dashboard = () => {
  const [stats, setStats] = useState({ chats: 0, translations: 0, learnSessions: 0 });
  type RecentChat = {
    context?: string;
    message?: string;
    [key: string]: any;
  };
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);

  // New state for group chats
  type GroupChat = {
    id: string;
    name: string;
    primary_language: string;
    created_at: string;
  };
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [groupChatsLoading, setGroupChatsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  // Assuming useAuth is available for token
  // const { token } = useAuth(); // Uncomment if you need authentication for fetching group chats

  useEffect(() => {
    // Fetch stats
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch recent chats
    fetch("/api/recent-chats")
      .then((res) => res.json())
      .then((data) => {
        setRecentChats(data.chats || []);
        setRecentLoading(false);
      })
      .catch(() => setRecentLoading(false));

    // Fetch group chats
    const fetchGroupChats = async () => {
      try {
        // Replace with actual token if authentication is required
        const res = await fetch(`${API_URL}/chat/rooms`, {
          headers: {
            // 'Authorization': `Bearer ${token}` // Uncomment if authentication is required
          }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch group chats');
        }
        const data = await res.json();
        setGroupChats(data);
      } catch (error) {
        console.error('Error fetching group chats:', error);
      } finally {
        setGroupChatsLoading(false);
      }
    };
    fetchGroupChats();
  }, []); // Add token to dependency array if uncommented above

  return (
    <main>
      <h1>Dashboard</h1>
      {loading ? <div>Loading stats...</div> : (
        <section className="grid grid-cols-3 gap-4 my-8">
          <div className="card">Chats<br /><span>{stats.chats}</span></div>
          <div className="card">Translations<br /><span>{stats.translations}</span></div>
          <div className="card">Learn Sessions<br /><span>{stats.learnSessions}</span></div>
        </section>
      )}
      <section className="flex gap-4 mt-8">
        <a href="/chat" className="quick-link">Chat</a>
        <a href="/translate" className="quick-link">Translate</a>
        <a href="/learn" className="quick-link">Learn</a>
        <a href="/create-group-chat" className="quick-link">Create Group Chat</a>
      </section>
      
      {/* New section for Group Chats */}
      <div className="widget mt-8">
        <h2>My Group Chats</h2>
        {groupChatsLoading ? (
          <div>Loading group chats...</div>
        ) : (
          <ul>
            {groupChats.length === 0 ? (
              <li>No group chats found. <Link href="/create-group-chat" className="text-blue-500 hover:underline">Create one?</Link></li>
            ) : (
              groupChats.map((room) => (
                <li key={room.id} className="mb-2 p-2 border rounded-md flex justify-between items-center">
                  <Link href={`/chat/${room.id}`} className="text-lg font-medium hover:underline">
                    {room.name} ({room.primary_language.toUpperCase()})
                  </Link>
                  <span className="text-sm text-muted-foreground">Created: {new Date(room.created_at).toLocaleDateString()}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="widget mt-8">
        <h2>Recent Chats</h2>
        {recentLoading ? (
          <div>Loading recent chats...</div>
        ) : (
          <ul>
            {recentChats.length === 0 ? (
              <li>No recent chats found.</li>
            ) : (
              recentChats.map((chat, idx) => (
                <li key={idx}>
                  <div>
                    <strong>Context:</strong> {chat.context ? chat.context : "No context"}
                  </div>
                  <div>
                    <span>{chat.message}</span>
                    {chat.context && (
                      <button className="continue-btn" onClick={() => window.location.href = `/chat?context=${encodeURIComponent(chat.context ?? "")}`}>Continue Conversation</button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </main>
  );
};

export default Dashboard;