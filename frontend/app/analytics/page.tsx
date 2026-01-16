'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  totalTranslations: number;
  totalXP: number;
  currentStreak: number;
  level: number;
  languagesLearned: number;
  quizzesTaken: number;
  averageScore: number;
  activityByDay: Array<{ date: string; count: number }>;
  languageDistribution: Array<{ language: string; count: number }>;
  progressOverTime: Array<{ date: string; xp: number }>;
}

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    } else if (user) {
      fetchAnalytics();
    }
  }, [isLoaded, user, router, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockData: AnalyticsData = {
        totalTranslations: 245,
        totalXP: 3450,
        currentStreak: 12,
        level: 8,
        languagesLearned: 3,
        quizzesTaken: 28,
        averageScore: 82,
        activityByDay: [
          { date: '2024-01-10', count: 15 },
          { date: '2024-01-11', count: 22 },
          { date: '2024-01-12', count: 18 },
          { date: '2024-01-13', count: 25 },
          { date: '2024-01-14', count: 20 },
          { date: '2024-01-15', count: 30 },
          { date: '2024-01-16', count: 28 }
        ],
        languageDistribution: [
          { language: 'Hindi', count: 120 },
          { language: 'Spanish', count: 85 },
          { language: 'French', count: 40 }
        ],
        progressOverTime: [
          { date: '2024-01-01', xp: 2000 },
          { date: '2024-01-05', xp: 2500 },
          { date: '2024-01-10', xp: 3000 },
          { date: '2024-01-15', xp: 3450 }
        ]
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
            <p className="text-gray-600">Track your learning progress and achievements</p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Total Translations</div>
              <div className="text-3xl">📝</div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {analytics.totalTranslations}
            </div>
            <div className="text-sm text-green-600 mt-2">↑ 12% from last week</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Total XP</div>
              <div className="text-3xl">⭐</div>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {analytics.totalXP.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-2">Level {analytics.level}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Current Streak</div>
              <div className="text-3xl">🔥</div>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {analytics.currentStreak} days
            </div>
            <div className="text-sm text-green-600 mt-2">Keep it up!</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Avg Quiz Score</div>
              <div className="text-3xl">🎯</div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {analytics.averageScore}%
            </div>
            <div className="text-sm text-gray-600 mt-2">{analytics.quizzesTaken} quizzes taken</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Daily Activity</h2>
            <div className="space-y-3">
              {analytics.activityByDay.map((day, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 w-24">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(day.count / 30) * 100}%` }}
                    >
                      <span className="text-white text-xs font-semibold">{day.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Language Distribution</h2>
            <div className="space-y-4">
              {analytics.languageDistribution.map((lang, i) => {
                const percentage = (lang.count / analytics.totalTranslations) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-gray-600">{lang.count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-blue-500' :
                          i === 1 ? 'bg-purple-500' :
                          'bg-pink-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Over Time */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">XP Progress Over Time</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.progressOverTime.map((point, i) => {
              const height = (point.xp / Math.max(...analytics.progressOverTime.map(p => p.xp))) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">{point.xp}</div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-semibold">Translation Master</div>
              <div className="text-sm text-gray-600">Completed 100+ translations</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="text-4xl mb-2">🔥</div>
              <div className="font-semibold">Streak Champion</div>
              <div className="text-sm text-gray-600">10-day learning streak</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
              <div className="text-4xl mb-2">🎯</div>
              <div className="font-semibold">Quiz Expert</div>
              <div className="text-sm text-gray-600">90%+ average score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
