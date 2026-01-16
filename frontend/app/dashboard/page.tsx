'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    translations: 245,
    xp: 3450,
    level: 8,
    streak: 12
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  const features = [
    {
      title: 'Translate',
      description: 'AI-powered translation with cultural context',
      icon: '🌐',
      href: '/translate',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Voice Translation',
      description: 'Speech-to-speech translation',
      icon: '🎤',
      href: '/voice-translate',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'AI Assistant',
      description: 'Smart suggestions and quality assessment',
      icon: '🤖',
      href: '/ai-assistant',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Collaboration',
      description: 'Work together on translations',
      icon: '👥',
      href: '/collaboration',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'RAG Chat',
      description: 'Chat with your documents',
      icon: '📚',
      href: '/rag-chat',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Gamification',
      description: 'Earn XP, badges, and level up',
      icon: '🏆',
      href: '/gamification',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Analytics',
      description: 'Track your progress and insights',
      icon: '📊',
      href: '/analytics',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Learn',
      description: 'Structured language courses',
      icon: '📖',
      href: '/learn',
      color: 'from-teal-500 to-green-500'
    },
    {
      title: 'Chat Rooms',
      description: 'Multilingual group conversations',
      icon: '💬',
      href: '/chat',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Sentiment Analysis',
      description: 'Analyze and adjust tone',
      icon: '😊',
      href: '/sentiment-analyzer',
      color: 'from-purple-500 to-blue-500'
    },
    {
      title: 'PDF Chat',
      description: 'Chat with PDF documents',
      icon: '📄',
      href: '/chat-with-pdf',
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Pricing',
      description: 'Upgrade to unlock more features',
      icon: '💳',
      href: '/payment',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user.firstName || 'User'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Continue your language learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Translations</div>
              <div className="text-3xl">📝</div>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.translations}</div>
            <div className="text-sm text-green-600 mt-1">↑ 12% this week</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Total XP</div>
              <div className="text-3xl">⭐</div>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.xp}</div>
            <div className="text-sm text-gray-600 mt-1">Level {stats.level}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Streak</div>
              <div className="text-3xl">🔥</div>
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.streak} days</div>
            <div className="text-sm text-green-600 mt-1">Keep it up!</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Rank</div>
              <div className="text-3xl">🏅</div>
            </div>
            <div className="text-3xl font-bold text-green-600">#42</div>
            <div className="text-sm text-gray-600 mt-1">Global leaderboard</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/translate"
              className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-2">🌐</div>
              <div className="font-semibold">Translate</div>
            </Link>
            <Link
              href="/ai-assistant"
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-semibold">AI Assistant</div>
            </Link>
            <Link
              href="/gamification"
              className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold">Gamification</div>
            </Link>
            <Link
              href="/analytics"
              className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">Analytics</div>
            </Link>
          </div>
        </div>

        {/* All Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🚀 All Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-semibold">
                  <span>Explore</span>
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📅 Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'Completed translation', time: '2 hours ago', icon: '✅' },
              { action: 'Earned "Week Streak" badge', time: '5 hours ago', icon: '🏆' },
              { action: 'Passed Hindi quiz with 95%', time: '1 day ago', icon: '🎯' },
              { action: 'Joined collaboration session', time: '2 days ago', icon: '👥' },
              { action: 'Uploaded document to RAG', time: '3 days ago', icon: '📚' }
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
