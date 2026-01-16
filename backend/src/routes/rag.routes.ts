import { Router } from 'express';
import { query, uploadDocument } from '../controllers/rag.controller';
import { multerUpload } from '../middleware/multer.middleware';

const router = Router();

router.post('/upload', multerUpload.single('file'), uploadDocument);
router.post('/query', query);

export default router;
