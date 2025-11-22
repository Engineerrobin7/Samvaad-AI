// Translation history and favorites service
import pool from '../db/pool';

interface TranslationHistory {
  id: number;
  userId: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  isFavorite: boolean;
  createdAt: Date;
}

interface HistoryStats {
  totalTranslations: number;
  favoriteCount: number;
  languagePairs: { source: string; target: string; count: number }[];
  recentLanguages: string[];
}

class HistoryService {
  /**
   * Save translation to history
   */
  async saveTranslation(
    userId: string,
    originalText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<number> {
    try {
      const result = await pool.query(
        `INSERT INTO translation_history 
        (user_id, original_text, translated_text, source_language, target_language, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id`,
        [userId, originalText, translatedText, sourceLanguage, targetLanguage]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('Save translation error:', error);
      throw new Error('Failed to save translation');
    }
  }

  /**
   * Get user's translation history
   */
  async getHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TranslationHistory[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM translation_history 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Get history error:', error);
      throw new Error('Failed to retrieve history');
    }
  }

  /**
   * Get favorites
   */
  async getFavorites(userId: string): Promise<TranslationHistory[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM translation_history 
        WHERE user_id = $1 AND is_favorite = true 
        ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Get favorites error:', error);
      throw new Error('Failed to retrieve favorites');
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, translationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `UPDATE translation_history 
        SET is_favorite = NOT is_favorite 
        WHERE id = $1 AND user_id = $2 
        RETURNING is_favorite`,
        [translationId, userId]
      );

      return result.rows[0]?.is_favorite || false;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw new Error('Failed to toggle favorite');
    }
  }

  /**
   * Search history
   */
  async searchHistory(
    userId: string,
    searchTerm: string,
    sourceLanguage?: string,
    targetLanguage?: string
  ): Promise<TranslationHistory[]> {
    try {
      let query = `SELECT * FROM translation_history WHERE user_id = $1 
        AND (original_text ILIKE $2 OR translated_text ILIKE $2)`;
      const params: any[] = [userId, `%${searchTerm}%`];

      if (sourceLanguage) {
        query += ` AND source_language = $${params.length + 1}`;
        params.push(sourceLanguage);
      }

      if (targetLanguage) {
        query += ` AND target_language = $${params.length + 1}`;
        params.push(targetLanguage);
      }

      query += ` ORDER BY created_at DESC LIMIT 50`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Search history error:', error);
      throw new Error('Failed to search history');
    }
  }

  /**
   * Get history statistics
   */
  async getStats(userId: string): Promise<HistoryStats> {
    try {
      const totalResult = await pool.query(
        `SELECT COUNT(*) as total FROM translation_history WHERE user_id = $1`,
        [userId]
      );

      const favoriteResult = await pool.query(
        `SELECT COUNT(*) as count FROM translation_history 
        WHERE user_id = $1 AND is_favorite = true`,
        [userId]
      );

      const pairsResult = await pool.query(
        `SELECT source_language, target_language, COUNT(*) as count 
        FROM translation_history 
        WHERE user_id = $1 
        GROUP BY source_language, target_language 
        ORDER BY count DESC 
        LIMIT 10`,
        [userId]
      );

      const recentResult = await pool.query(
        `SELECT DISTINCT target_language FROM translation_history 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5`,
        [userId]
      );

      return {
        totalTranslations: parseInt(totalResult.rows[0]?.total || '0'),
        favoriteCount: parseInt(favoriteResult.rows[0]?.count || '0'),
        languagePairs: pairsResult.rows.map(row => ({
          source: row.source_language,
          target: row.target_language,
          count: parseInt(row.count),
        })),
        recentLanguages: recentResult.rows.map(row => row.target_language),
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw new Error('Failed to retrieve statistics');
    }
  }

  /**
   * Delete history item
   */
  async deleteHistoryItem(userId: string, translationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `DELETE FROM translation_history WHERE id = $1 AND user_id = $2`,
        [translationId, userId]
      );

      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Delete history error:', error);
      throw new Error('Failed to delete history item');
    }
  }

  /**
   * Clear all history
   */
  async clearHistory(userId: string): Promise<boolean> {
    try {
      await pool.query(
        `DELETE FROM translation_history WHERE user_id = $1 AND is_favorite = false`,
        [userId]
      );

      return true;
    } catch (error) {
      console.error('Clear history error:', error);
      throw new Error('Failed to clear history');
    }
  }
}

export const historyService = new HistoryService();
