// Gamified learning system
import pool from '../db/pool';

interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  streak: number;
  lastActivityDate: Date;
  badges: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: number;
  category: 'translation' | 'learning' | 'social' | 'streak';
}

interface Quiz {
  id: number;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

class GamificationService {
  private readonly XP_PER_LEVEL = 100;
  private readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_translation',
      name: 'First Steps',
      description: 'Complete your first translation',
      icon: '🎯',
      xpReward: 10,
      requirement: 1,
      category: 'translation',
    },
    {
      id: 'translation_master',
      name: 'Translation Master',
      description: 'Complete 100 translations',
      icon: '🏆',
      xpReward: 100,
      requirement: 100,
      category: 'translation',
    },
    {
      id: 'week_streak',
      name: 'Dedicated Learner',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      xpReward: 50,
      requirement: 7,
      category: 'streak',
    },
    {
      id: 'polyglot',
      name: 'Polyglot',
      description: 'Learn 5 different languages',
      icon: '🌍',
      xpReward: 150,
      requirement: 5,
      category: 'learning',
    },
  ];

  /**
   * Get user progress
   */
  async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      const result = await pool.query(
        `SELECT * FROM user_progress WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        // Create new progress record
        return await this.initializeUserProgress(userId);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Get user progress error:', error);
      throw new Error('Failed to retrieve user progress');
    }
  }

  /**
   * Initialize user progress
   */
  private async initializeUserProgress(userId: string): Promise<UserProgress> {
    const result = await pool.query(
      `INSERT INTO user_progress (user_id, level, xp, streak, last_activity_date, badges)
      VALUES ($1, 1, 0, 0, NOW(), '[]')
      RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }

  /**
   * Award XP to user
   */
  async awardXP(userId: string, xp: number, activity: string): Promise<{
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    try {
      const progress = await this.getUserProgress(userId);
      const newXP = progress.xp + xp;
      const newLevel = Math.floor(newXP / this.XP_PER_LEVEL) + 1;
      const leveledUp = newLevel > progress.level;

      await pool.query(
        `UPDATE user_progress 
        SET xp = $1, level = $2, last_activity_date = NOW()
        WHERE user_id = $3`,
        [newXP, newLevel, userId]
      );

      // Log activity
      await pool.query(
        `INSERT INTO activity_log (user_id, activity_type, xp_earned, created_at)
        VALUES ($1, $2, $3, NOW())`,
        [userId, activity, xp]
      );

      return { newXP, newLevel, leveledUp };
    } catch (error) {
      console.error('Award XP error:', error);
      throw new Error('Failed to award XP');
    }
  }

  /**
   * Update streak
   */
  async updateStreak(userId: string): Promise<number> {
    try {
      const progress = await this.getUserProgress(userId);
      const lastActivity = new Date(progress.lastActivityDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = progress.streak;

      if (daysDiff === 1) {
        // Continue streak
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If daysDiff === 0, same day, don't change streak

      await pool.query(
        `UPDATE user_progress 
        SET streak = $1, last_activity_date = NOW()
        WHERE user_id = $2`,
        [newStreak, userId]
      );

      // Check for streak achievements
      await this.checkAchievements(userId, 'streak', newStreak);

      return newStreak;
    } catch (error) {
      console.error('Update streak error:', error);
      throw new Error('Failed to update streak');
    }
  }

  /**
   * Check and award achievements
   */
  async checkAchievements(
    userId: string,
    category: string,
    count: number
  ): Promise<Achievement[]> {
    try {
      const progress = await this.getUserProgress(userId);
      const currentBadges = progress.badges || [];
      const newAchievements: Achievement[] = [];

      for (const achievement of this.ACHIEVEMENTS) {
        if (
          achievement.category === category &&
          count >= achievement.requirement &&
          !currentBadges.includes(achievement.id)
        ) {
          // Award achievement
          currentBadges.push(achievement.id);
          newAchievements.push(achievement);

          // Award XP
          await this.awardXP(userId, achievement.xpReward, `achievement_${achievement.id}`);
        }
      }

      if (newAchievements.length > 0) {
        await pool.query(
          `UPDATE user_progress SET badges = $1 WHERE user_id = $2`,
          [JSON.stringify(currentBadges), userId]
        );
      }

      return newAchievements;
    } catch (error) {
      console.error('Check achievements error:', error);
      return [];
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT user_id, level, xp, streak, badges 
        FROM user_progress 
        ORDER BY xp DESC 
        LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw new Error('Failed to retrieve leaderboard');
    }
  }

  /**
   * Generate quiz
   */
  async generateQuiz(language: string, difficulty: string): Promise<Quiz> {
    // Mock quiz generation - in production, this would use AI
    const questions: QuizQuestion[] = [
      {
        question: `How do you say "Hello" in ${language}?`,
        options: ['Namaste', 'Hola', 'Bonjour', 'Konnichiwa'],
        correctAnswer: 0,
        explanation: 'Namaste is a common greeting in Hindi and other Indian languages.',
      },
      {
        question: `What is the formal way to address someone in ${language}?`,
        options: ['Tu', 'Aap', 'Tum', 'Ye'],
        correctAnswer: 1,
        explanation: 'Aap is the formal way to address someone in Hindi.',
      },
    ];

    return {
      id: Date.now(),
      language,
      difficulty: difficulty as any,
      questions,
    };
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(
    userId: string,
    quizId: number,
    answers: number[]
  ): Promise<{
    score: number;
    totalQuestions: number;
    xpEarned: number;
    passed: boolean;
  }> {
    try {
      // Mock scoring - in production, validate against stored quiz
      const totalQuestions = answers.length;
      const score = Math.floor(Math.random() * totalQuestions) + 1;
      const passed = score >= totalQuestions * 0.7;
      const xpEarned = passed ? score * 10 : score * 5;

      await this.awardXP(userId, xpEarned, 'quiz_completion');

      return {
        score,
        totalQuestions,
        xpEarned,
        passed,
      };
    } catch (error) {
      console.error('Submit quiz error:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return this.ACHIEVEMENTS;
  }
}

export const gamificationService = new GamificationService();
