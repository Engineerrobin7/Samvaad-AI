import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [stats, setStats] = useState({ chats: 0, translations: 0, learnSessions: 0 });
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/recent-chats")
      .then((res) => res.json())
      .then((data) => {
        setRecentChats(data.chats || []);
        setRecentLoading(false);
      })
      .catch(() => setRecentLoading(false));
  }, []);

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
      </section>
      <div className="widget">
        <h2>Recent Chats</h2>
        {recentLoading ? (
          <div>Loading recent chats...</div>
        ) : (
          <ul>
            {recentChats.length === 0 ? (
              <li>No recent chats found.</li>
            ) : (
              recentChats.map((chat, idx) => (
                <li key={idx}>{chat.message}</li>
              ))
            )}
          </ul>
        )}
      </div>
    </main>
  );
};

export default Dashboard;