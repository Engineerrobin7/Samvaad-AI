'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Award } from 'lucide-react';

export default function GamificationPage() {
  const [progress, setProgress] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progressRes, leaderboardRes, achievementsRes] = await Promise.all([
        fetch('http://localhost:5000/api/gamification/progress'),
        fetch('http://localhost:5000/api/gamification/leaderboard'),
        fetch('http://localhost:5000/api/gamification/achievements'),
      ]);

      const progressData = await progressRes.json();
      const leaderboardData = await leaderboardRes.json();
      const achievementsData = await achievementsRes.json();

      if (progressData.success) setProgress(progressData.data);
      if (leaderboardData.success) setLeaderboard(leaderboardData.data);
      if (achievementsData.success) setAchievements(achievementsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const xpToNextLevel = progress ? (progress.level * 100) - progress.xp : 0;
  const progressPercentage = progress ? (progress.xp % 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-900">
          🏆 Your Learning Journey
        </h1>

        {/* User Progress Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">Level {progress?.level || 1}</h3>
              <p className="text-gray-600">Current Level</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-3">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{progress?.xp || 0} XP</h3>
              <p className="text-gray-600">{xpToNextLevel} to next level</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full mb-3">
                <Flame className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{progress?.streak || 0} Days</h3>
              <p className="text-gray-600">Current Streak</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Level Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Achievements
            </h2>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const isUnlocked = progress?.badges?.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${
                      isUnlocked
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-indigo-600 mt-1">
                          +{achievement.xpReward} XP
                        </p>
                      </div>
                      {isUnlocked && (
                        <div className="text-green-500 font-bold">✓</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.map((user, index) => (
                <div
                  key={user.userId}
                  className={`p-4 rounded-lg flex items-center gap-4 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-white'
                        : index === 1
                        ? 'bg-gray-300 text-white'
                        : index === 2
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">User {user.userId.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      Level {user.level} • {user.xp} XP
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-red-500">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold">{user.streak}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
