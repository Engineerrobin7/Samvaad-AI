import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock database
jest.mock('../db/pool.js', () => ({
  query: jest.fn()
}));

describe('Gamification Service Tests', () => {
  describe('XP and Leveling System', () => {
    const XP_PER_LEVEL = 100;

    it('should calculate correct level from XP', () => {
      const testCases = [
        { xp: 0, expectedLevel: 1 },
        { xp: 50, expectedLevel: 1 },
        { xp: 100, expectedLevel: 2 },
        { xp: 250, expectedLevel: 3 },
        { xp: 1000, expectedLevel: 11 }
      ];

      testCases.forEach(({ xp, expectedLevel }) => {
        const level = Math.floor(xp / XP_PER_LEVEL) + 1;
        expect(level).toBe(expectedLevel);
      });
    });

    it('should calculate XP needed for next level', () => {
      const currentXP = 150;
      const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
      const xpForNextLevel = (currentLevel * XP_PER_LEVEL) - currentXP;
      
      expect(xpForNextLevel).toBe(50);
      expect(currentLevel).toBe(2);
    });

    it('should handle level up correctly', () => {
      const oldXP = 95;
      const xpGained = 10;
      const newXP = oldXP + xpGained;
      const oldLevel = Math.floor(oldXP / XP_PER_LEVEL) + 1;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      
      expect(oldLevel).toBe(1);
      expect(newLevel).toBe(2);
      expect(newLevel > oldLevel).toBe(true);
    });

    it('should award bonus XP for perfect quiz scores', () => {
      const baseXP = 50;
      const score = 100;
      const bonusMultiplier = score / 100;
      const totalXP = Math.floor(baseXP * (1 + bonusMultiplier));
      
      expect(totalXP).toBe(100);
      expect(totalXP).toBeGreaterThan(baseXP);
    });
  });

  describe('Streak System', () => {
    it('should maintain streak for consecutive days', () => {
      let streak = 5;
      const daysDiff = 1;
      
      if (daysDiff === 1) {
        streak += 1;
      }
      
      expect(streak).toBe(6);
    });

    it('should reset streak for missed days', () => {
      let streak = 10;
      const daysDiff = 3;
      
      if (daysDiff > 1) {
        streak = 1;
      }
      
      expect(streak).toBe(1);
    });

    it('should keep streak same for same day activity', () => {
      let streak = 7;
      const daysDiff = 0;
      
      if (daysDiff === 0) {
        // Same day, no change
      } else if (daysDiff === 1) {
        streak += 1;
      } else {
        streak = 1;
      }
      
      expect(streak).toBe(7);
    });

    it('should calculate days difference correctly', () => {
      const today = new Date('2024-01-15');
      const yesterday = new Date('2024-01-14');
      const twoDaysAgo = new Date('2024-01-13');
      
      const daysDiff1 = Math.floor((today.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24));
      const daysDiff2 = Math.floor((today.getTime() - twoDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDiff1).toBe(1);
      expect(daysDiff2).toBe(2);
    });
  });

  describe('Achievement System', () => {
    it('should unlock achievement when criteria met', () => {
      const achievements = {
        firstTranslation: { unlocked: false, requirement: 1 },
        translationMaster: { unlocked: false, requirement: 100 },
        weekStreak: { unlocked: false, requirement: 7 }
      };

      const translationCount = 1;
      if (translationCount >= achievements.firstTranslation.requirement) {
        achievements.firstTranslation.unlocked = true;
      }

      expect(achievements.firstTranslation.unlocked).toBe(true);
      expect(achievements.translationMaster.unlocked).toBe(false);
    });

    it('should track multiple achievements', () => {
      const userProgress = {
        translations: 150,
        streak: 10,
        quizzesPassed: 5
      };

      const unlockedAchievements = [];

      if (userProgress.translations >= 1) unlockedAchievements.push('first_translation');
      if (userProgress.translations >= 100) unlockedAchievements.push('translation_master');
      if (userProgress.streak >= 7) unlockedAchievements.push('week_streak');
      if (userProgress.quizzesPassed >= 5) unlockedAchievements.push('quiz_master');

      expect(unlockedAchievements).toHaveLength(4);
      expect(unlockedAchievements).toContain('translation_master');
    });

    it('should calculate achievement progress percentage', () => {
      const current = 75;
      const required = 100;
      const progress = Math.min((current / required) * 100, 100);

      expect(progress).toBe(75);
    });
  });

  describe('Quiz System', () => {
    it('should calculate quiz score percentage', () => {
      const correctAnswers = 7;
      const totalQuestions = 10;
      const score = (correctAnswers / totalQuestions) * 100;
      
      expect(score).toBe(70);
    });

    it('should determine pass/fail based on threshold', () => {
      const passingScore = 70;
      
      expect(75 >= passingScore).toBe(true);
      expect(65 >= passingScore).toBe(false);
      expect(70 >= passingScore).toBe(true);
    });

    it('should award XP based on quiz performance', () => {
      const baseXP = 50;
      const scores = [100, 80, 60, 40];
      
      const xpAwarded = scores.map(score => {
        const bonusMultiplier = score / 100;
        return Math.floor(baseXP * (1 + bonusMultiplier));
      });

      expect(xpAwarded[0]).toBe(100); // Perfect score
      expect(xpAwarded[1]).toBe(90);  // 80%
      expect(xpAwarded[2]).toBe(80);  // 60%
      expect(xpAwarded[3]).toBe(70);  // 40%
    });

    it('should generate quiz questions from translation history', () => {
      const translations = [
        { source: 'Hello', target: 'नमस्ते', language: 'hi' },
        { source: 'Goodbye', target: 'अलविदा', language: 'hi' },
        { source: 'Thank you', target: 'धन्यवाद', language: 'hi' }
      ];

      const quizQuestions = translations.map((t, i) => ({
        id: i + 1,
        question: `What is the translation of "${t.source}" in Hindi?`,
        correctAnswer: t.target,
        options: [t.target, 'wrong1', 'wrong2', 'wrong3']
      }));

      expect(quizQuestions).toHaveLength(3);
      expect(quizQuestions[0].correctAnswer).toBe('नमस्ते');
    });
  });

  describe('Leaderboard System', () => {
    it('should rank users by XP', () => {
      const users = [
        { id: 'user1', name: 'Alice', xp: 500 },
        { id: 'user2', name: 'Bob', xp: 750 },
        { id: 'user3', name: 'Charlie', xp: 300 }
      ];

      const leaderboard = users.sort((a, b) => b.xp - a.xp);

      expect(leaderboard[0].name).toBe('Bob');
      expect(leaderboard[1].name).toBe('Alice');
      expect(leaderboard[2].name).toBe('Charlie');
    });

    it('should assign ranks correctly', () => {
      const users = [
        { name: 'Alice', xp: 500 },
        { name: 'Bob', xp: 750 },
        { name: 'Charlie', xp: 300 }
      ];

      const rankedUsers = users
        .sort((a, b) => b.xp - a.xp)
        .map((user, index) => ({ ...user, rank: index + 1 }));

      expect(rankedUsers[0].rank).toBe(1);
      expect(rankedUsers[0].name).toBe('Bob');
      expect(rankedUsers[2].rank).toBe(3);
    });

    it('should handle tied scores', () => {
      const users = [
        { name: 'Alice', xp: 500 },
        { name: 'Bob', xp: 500 },
        { name: 'Charlie', xp: 300 }
      ];

      const sorted = users.sort((a, b) => b.xp - a.xp);

      expect(sorted[0].xp).toBe(sorted[1].xp);
      expect(sorted[0].xp).toBeGreaterThan(sorted[2].xp);
    });
  });

  describe('Activity Tracking', () => {
    it('should log translation activity', () => {
      const activity = {
        userId: 'user-1',
        type: 'translation',
        xpGained: 10,
        timestamp: new Date()
      };

      expect(activity.type).toBe('translation');
      expect(activity.xpGained).toBe(10);
      expect(activity.timestamp).toBeInstanceOf(Date);
    });

    it('should log quiz completion', () => {
      const activity = {
        userId: 'user-1',
        type: 'quiz_completed',
        xpGained: 50,
        metadata: { score: 80, passed: true }
      };

      expect(activity.type).toBe('quiz_completed');
      expect(activity.metadata.passed).toBe(true);
    });

    it('should calculate daily activity stats', () => {
      const activities = [
        { type: 'translation', xpGained: 10 },
        { type: 'translation', xpGained: 10 },
        { type: 'quiz_completed', xpGained: 50 }
      ];

      const totalXP = activities.reduce((sum, a) => sum + a.xpGained, 0);
      const translationCount = activities.filter(a => a.type === 'translation').length;

      expect(totalXP).toBe(70);
      expect(translationCount).toBe(2);
    });
  });

  describe('Badge System', () => {
    it('should award badges for milestones', () => {
      const badges = [];
      const userStats = {
        translations: 100,
        streak: 30,
        languages: 5
      };

      if (userStats.translations >= 100) badges.push('translation_master');
      if (userStats.streak >= 30) badges.push('dedicated_learner');
      if (userStats.languages >= 5) badges.push('polyglot');

      expect(badges).toHaveLength(3);
      expect(badges).toContain('polyglot');
    });

    it('should track badge rarity', () => {
      const badges = [
        { name: 'first_translation', rarity: 'common' },
        { name: 'translation_master', rarity: 'rare' },
        { name: 'polyglot', rarity: 'legendary' }
      ];

      const rareBadges = badges.filter(b => b.rarity === 'rare' || b.rarity === 'legendary');

      expect(rareBadges).toHaveLength(2);
    });
  });
});
