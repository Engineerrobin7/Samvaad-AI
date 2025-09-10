import { Request, Response } from 'express';
import { pool } from '../db/pool';

export const learnController = {
  // Get all available languages for learning
  async getLanguages(req: Request, res: Response) {
    try {
      // This is a placeholder. In a real app, you might have a 'languages' table.
      const languages = [
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
        { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
        { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
      ];
      res.json(languages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching languages' });
    }
  },

  // Get lessons and progress for a specific language
  async getLanguageDetails(req: Request, res: Response) {
    try {
      const { languageCode } = req.params;
      const userId = (req as any).user?.id;

      // Mocked lessons data
      const allLessons = {
        hi: [
            { id: 1, title: 'Basic Greetings', duration: 10 },
            { id: 2, title: 'Family Members', duration: 15 },
            { id: 3, title: 'Common Phrases', duration: 18 },
        ],
        bn: [
            { id: 4, title: 'Bengali Alphabet', duration: 25 },
            { id: 5, title: 'Simple Questions', duration: 12 },
        ],
      };

      // In a real app, you'd fetch user progress from the DB
      // For this example, we'll mock it.
      const userProgress = {
        hi: { level: 3, progress: 65, completedLessons: [1, 2] },
        bn: { level: 1, progress: 30, completedLessons: [4] },
      };

      const lessons = (allLessons as any)[languageCode] || [];
      const progress = (userProgress as any)[languageCode] || { level: 1, progress: 0, completedLessons: [] };
      
      const lessonsWithCompletion = lessons.map((lesson: any) => ({
        ...lesson,
        completed: progress.completedLessons.includes(lesson.id)
      }));

      res.json({
        name: languageCode.charAt(0).toUpperCase() + languageCode.slice(1),
        flag: '🇮🇳', // Placeholder
        level: progress.level,
        progress: progress.progress,
        lessons: lessonsWithCompletion,
      });

    } catch (error) {
      console.error('Error fetching language details:', error);
      res.status(500).json({ message: 'Error fetching language details' });
    }
  },
};