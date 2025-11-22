import { Router } from 'express';
import * as multiDocController from '../controllers/multiDocument.controller';

const router = Router();

router.post('/add', multiDocController.uploadMiddleware, multiDocController.addDocument);
router.post('/chat', multiDocController.chatWithDocuments);
router.post('/summarize', multiDocController.summarizeDocuments);
router.post('/compare', multiDocController.compareDocuments);
router.get('/:sessionId', multiDocController.getDocuments);
router.delete('/:sessionId/:documentId', multiDocController.removeDocument);

export default router;
