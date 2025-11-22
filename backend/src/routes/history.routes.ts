import { Router } from 'express';
import * as historyController from '../controllers/history.controller';

const router = Router();

router.get('/', historyController.getHistory);
router.get('/favorites', historyController.getFavorites);
router.get('/stats', historyController.getStats);
router.get('/search', historyController.searchHistory);
router.post('/:translationId/favorite', historyController.toggleFavorite);
router.delete('/:translationId', historyController.deleteHistoryItem);
router.delete('/', historyController.clearHistory);

export default router;
