import { Request, Response } from 'express';
import redisClient from '../config/redis';
import { pool } from '../db/pool';

/**
 * Get cultural tips for a specific language
 * @route GET /api/tips/cultural/:language
 */
export const getCulturalTips = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const { category, difficulty } = req.query;

    const cacheKey = `tips:cultural:${language}:${category || 'all'}:${difficulty || 'all'}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      return res.status(200).json(JSON.parse(cachedResult));
    }

    let query = 'SELECT * FROM cultural_tips WHERE language_code = $1';
    const params = [language];

    if (category) {
      query += ' AND category = $2';
      params.push(category as string);
    }

    if (difficulty) {
      query += ` AND difficulty = ${params.length + 1}`;
      params.push(difficulty as string);
    }

    const { rows: tips } = await pool.query(query, params);

    const result = {
      success: true,
      data: {
        language,
        tips
      }
    };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get cultural tips error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting cultural tips' 
    });
  }
};

/**
 * Get language learning tips
 * @route GET /api/tips/language/:language
 */
export const getLanguageTips = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const { category, difficulty } = req.query;

    const cacheKey = `tips:language:${language}:${category || 'all'}:${difficulty || 'all'}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      return res.status(200).json(JSON.parse(cachedResult));
    }

    let query = 'SELECT * FROM language_tips WHERE language_code = $1';
    const params = [language];

    if (category) {
      query += ' AND category = $2';
      params.push(category as string);
    }

    if (difficulty) {
      query += ` AND difficulty = ${params.length + 1}`;
      params.push(difficulty as string);
    }

    const { rows: tips } = await pool.query(query, params);

    const result = {
      success: true,
      data: {
        language,
        tips
      }
    };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get language tips error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting language tips' 
    });
  }
};