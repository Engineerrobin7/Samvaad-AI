import pool from '../db/pool.js';

export class AnalyticsService {
  async getUserStats(userId: string) {
    try {
      const translationsResult = await pool.query(
        'SELECT COUNT(*) as count FROM translation_history WHERE user_id = $1',
        [userId]
      );

      const progressResult = await pool.query(
        'SELECT * FROM user_progress WHERE user_id = $1',
        [userId]
      );

      const quizResults = await pool.query(
        'SELECT AVG(score) as avg_score, COUNT(*) as total FROM quiz_results WHERE user_id = $1',
        [userId]
      );

      return {
        totalTranslations: parseInt(translationsResult.rows[0]?.count || '0'),
        xp: progressResult.rows[0]?.xp || 0,
        level: progressResult.rows[0]?.level || 1,
        streak: progressResult.rows[0]?.streak || 0,
        averageQuizScore: parseFloat(quizResults.rows[0]?.avg_score || '0'),
        quizzesTaken: parseInt(quizResults.rows[0]?.total || '0')
      };
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  async getActivityByDay(userId: string, days: number = 7) {
    try {
      const result = await pool.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM activity_log
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Activity by day error:', error);
      return [];
    }
  }

  async getLanguageDistribution(userId: string) {
    try {
      const result = await pool.query(
        `SELECT target_language as language, COUNT(*) as count
         FROM translation_history
         WHERE user_id = $1
         GROUP BY target_language
         ORDER BY count DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Language distribution error:', error);
      return [];
    }
  }
}

export default new AnalyticsService();
