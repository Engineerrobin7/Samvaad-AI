// src/controllers/tips.controller.ts
import { Request, Response } from 'express';
import  pool  from '../db/pool';

/**
 * Get cultural tips for a specific language
 * @route GET /api/tips/cultural/:language
 */
export const getCulturalTips = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const { category, difficulty } = req.query;

    let query = 'SELECT * FROM cultural_tips WHERE language_code = $1';
    const params = [language];

    if (category) {
      query += ' AND category = $2';
      params.push(category as string);
    }

    if (difficulty) {
      query += ` AND difficulty = $${params.length + 1}`;
      params.push(difficulty as string);
    }

    query += ' ORDER BY title ASC';

    const { rows: tips } = await pool.query(query, params);

    const result = {
      success: true,
      data: {
        language,
        tips
      }
    };

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

    let query = 'SELECT * FROM language_tips WHERE language_code = $1';
    const params = [language];

    if (category) {
      query += ' AND category = $2';
      params.push(category as string);
    }

    if (difficulty) {
      query += ` AND difficulty = $${params.length + 1}`;
      params.push(difficulty as string);
    }

    query += ' ORDER BY title ASC';

    const { rows: tips } = await pool.query(query, params);

    const result = {
      success: true,
      data: {
        language,
        tips
      }
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get language tips error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting language tips' 
    });
  }
};