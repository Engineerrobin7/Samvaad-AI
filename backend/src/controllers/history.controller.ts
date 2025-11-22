import { Request, Response } from 'express';
import { historyService } from '../services/history.service';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await historyService.getHistory(userId, limit, offset);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve history',
    });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const favorites = await historyService.getFavorites(userId);

    return res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve favorites',
    });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { translationId } = req.params;

    const isFavorite = await historyService.toggleFavorite(userId, parseInt(translationId));

    return res.status(200).json({
      success: true,
      data: { isFavorite },
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
    });
  }
};

export const searchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { q, sourceLanguage, targetLanguage } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const results = await historyService.searchHistory(
      userId,
      q as string,
      sourceLanguage as string,
      targetLanguage as string
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search history',
    });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const stats = await historyService.getStats(userId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
    });
  }
};

export const deleteHistoryItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { translationId } = req.params;

    await historyService.deleteHistoryItem(userId, parseInt(translationId));

    return res.status(200).json({
      success: true,
      message: 'History item deleted',
    });
  } catch (error) {
    console.error('Delete history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete history item',
    });
  }
};

export const clearHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await historyService.clearHistory(userId);

    return res.status(200).json({
      success: true,
      message: 'History cleared',
    });
  } catch (error) {
    console.error('Clear history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear history',
    });
  }
};
