// src/controllers/learn.controller.ts
import { Request, Response } from 'express';
import  pool  from '../db/pool';



/**
 * Get all available languages
 * @route GET /api/learn/languages
 */
export const getLanguages = async (req: Request, res: Response) => {
  try {
    const { rows: languages } = await pool.query(`
      SELECT 
        l.id,
        l.code,
        l.name,
        l.native_name,
        l.difficulty_level,
        l.description,
        l.is_active,
        COUNT(c.id) as course_count
      FROM languages l
      LEFT JOIN courses c ON l.id = c.language_id AND c.is_active = true
      WHERE l.is_active = true
      GROUP BY l.id, l.code, l.name, l.native_name, l.difficulty_level, l.description, l.is_active
      ORDER BY l.name ASC
    `);

    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch languages'
    });
  }
};

/**
 * Get courses for a specific language
 * @route GET /api/learn/languages/:languageId/courses
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { languageId } = req.params;
    const userId = (req as any).user?.id;

    const { rows: courses } = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.difficulty_level,
        c.estimated_duration,
        c.order_index,
        c.is_active,
        COUNT(l.id) as lesson_count,
        CASE 
          WHEN up.course_id IS NOT NULL THEN up.progress_percentage
          ELSE 0
        END as progress_percentage,
        CASE 
          WHEN up.course_id IS NOT NULL THEN up.is_completed
          ELSE false
        END as is_completed
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id AND l.is_active = true
      LEFT JOIN user_course_progress up ON c.id = up.course_id AND up.user_id = $2
      WHERE c.language_id = $1 AND c.is_active = true
      GROUP BY c.id, c.title, c.description, c.difficulty_level, c.estimated_duration, c.order_index, c.is_active, up.course_id, up.progress_percentage, up.is_completed
      ORDER BY c.order_index ASC, c.title ASC
    `, [languageId, userId]);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
};

/**
 * Get lessons for a specific course
 * @route GET /api/learn/courses/:courseId/lessons
 */
export const getLessons = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user?.id;

    const { rows: lessons } = await pool.query(`
      SELECT 
        l.id,
        l.title,
        l.description,
        l.content,
        l.lesson_type,
        l.order_index,
        l.estimated_duration,
        l.is_active,
        CASE 
          WHEN ulp.lesson_id IS NOT NULL THEN ulp.is_completed
          ELSE false
        END as is_completed,
        CASE 
          WHEN ulp.lesson_id IS NOT NULL THEN ulp.score
          ELSE NULL
        END as score,
        CASE 
          WHEN ulp.lesson_id IS NOT NULL THEN ulp.completed_at
          ELSE NULL
        END as completed_at
      FROM lessons l
      LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = $2
      WHERE l.course_id = $1 AND l.is_active = true
      ORDER BY l.order_index ASC, l.title ASC
    `, [courseId, userId]);

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons'
    });
  }
};

/**
 * Get specific lesson details
 * @route GET /api/learn/lessons/:lessonId
 */
export const getLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = (req as any).user?.id;

    const { rows } = await pool.query(`
      SELECT 
        l.id,
        l.title,
        l.description,
        l.content,
        l.lesson_type,
        l.estimated_duration,
        c.title as course_title,
        c.id as course_id,
        lang.name as language_name,
        lang.code as language_code,
        CASE 
          WHEN ulp.lesson_id IS NOT NULL THEN ulp.is_completed
          ELSE false
        END as is_completed,
        CASE 
          WHEN ulp.lesson_id IS NOT NULL THEN ulp.score
          ELSE NULL
        END as score
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      JOIN languages lang ON c.language_id = lang.id
      LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = $2
      WHERE l.id = $1 AND l.is_active = true
    `, [lessonId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson'
    });
  }
};

/**
 * Update lesson progress
 * @route PUT /api/learn/lessons/:lessonId/progress
 */
export const updateLessonProgress = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { isCompleted, score } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    await pool.query('BEGIN');

    // Update or insert lesson progress
    await pool.query(`
      INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        is_completed = $3,
        score = GREATEST(user_lesson_progress.score, $4),
        completed_at = CASE 
          WHEN $3 = true AND user_lesson_progress.is_completed = false 
          THEN $5 
          ELSE user_lesson_progress.completed_at 
        END,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, lessonId, isCompleted, score, isCompleted ? new Date() : null]);

    // If lesson is completed, update course progress
    if (isCompleted) {
      await pool.query(`
        WITH course_stats AS (
          SELECT 
            c.id as course_id,
            COUNT(l.id) as total_lessons,
            COUNT(ulp.lesson_id) FILTER (WHERE ulp.is_completed = true) as completed_lessons
          FROM lessons l
          JOIN courses c ON l.course_id = c.id
          LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = $1
          WHERE l.id = $2
          GROUP BY c.id
        )
        INSERT INTO user_course_progress (user_id, course_id, progress_percentage, is_completed)
        SELECT 
          $1,
          cs.course_id,
          ROUND((cs.completed_lessons::float / cs.total_lessons::float) * 100, 2),
          cs.completed_lessons = cs.total_lessons
        FROM course_stats cs
        ON CONFLICT (user_id, course_id)
        DO UPDATE SET
          progress_percentage = ROUND((EXCLUDED.progress_percentage), 2),
          is_completed = EXCLUDED.is_completed,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, lessonId]);

      // Award points to user
      const pointsToAward = score || 10; // Default 10 points per lesson
      await pool.query(`
        UPDATE users 
        SET points = points + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [pointsToAward, userId]);
    }

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
};

/**
 * Get user's overall progress
 * @route GET /api/learn/progress
 */
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get overall user stats
    const { rows: userStats } = await pool.query(`
      SELECT 
        u.points,
        u.level,
        COUNT(DISTINCT ucp.course_id) as courses_enrolled,
        COUNT(DISTINCT ucp.course_id) FILTER (WHERE ucp.is_completed = true) as courses_completed,
        COUNT(DISTINCT ulp.lesson_id) as lessons_completed,
        COALESCE(AVG(ulp.score), 0) as average_score
      FROM users u
      LEFT JOIN user_course_progress ucp ON u.id = ucp.user_id
      LEFT JOIN user_lesson_progress ulp ON u.id = ulp.user_id AND ulp.is_completed = true
      WHERE u.id = $1
      GROUP BY u.id, u.points, u.level
    `, [userId]);

    // Get progress by language
    const { rows: languageProgress } = await pool.query(`
      SELECT 
        l.id,
        l.name,
        l.code,
        l.native_name,
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT ucp.course_id) as enrolled_courses,
        COUNT(DISTINCT ucp.course_id) FILTER (WHERE ucp.is_completed = true) as completed_courses,
        COALESCE(AVG(ucp.progress_percentage), 0) as average_progress
      FROM languages l
      LEFT JOIN courses c ON l.id = c.language_id AND c.is_active = true
      LEFT JOIN user_course_progress ucp ON c.id = ucp.course_id AND ucp.user_id = $1
      WHERE l.is_active = true
      GROUP BY l.id, l.name, l.code, l.native_name
      HAVING COUNT(DISTINCT ucp.course_id) > 0
      ORDER BY l.name
    `, [userId]);

    res.json({
      success: true,
      data: {
        userStats: userStats[0] || {
          points: 0,
          level: 1,
          courses_enrolled: 0,
          courses_completed: 0,
          lessons_completed: 0,
          average_score: 0
        },
        languageProgress
      }
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
};

const getLanguageDetails = async (req: Request, res: Response) => {
  // TODO: Replace with actual logic to fetch language details
  res.json({ success: true, message: 'getLanguageDetails not implemented yet' });
};

export const learnController = {
  getLanguages,
  getCourses,
  getLessons,
  getLesson,
  updateLessonProgress,
  getUserProgress,
  getLanguageDetails
};

